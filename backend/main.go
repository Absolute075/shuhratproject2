package main

import (
	"bytes"
	"crypto/rand"
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math"
	"net"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"
)

type healthResponse struct {
	Status string    `json:"status"`
	Time   time.Time `json:"time"`
}

func main() {
	_ = loadDotEnv(".env")
	_ = loadDotEnv("backend/.env")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	distDir := os.Getenv("FRONTEND_DIST")
	if distDir == "" {
		distDir = filepath.FromSlash("../frontend/dist")
	}

	storeBase := strings.TrimSpace(os.Getenv("APPLICATION_STORE_PATH"))
	if storeBase == "" {
		storeBase = "store"
	}
	store := newTransactionStore(storeBase)
	if err := store.Init(); err != nil {
		log.Printf("transaction store init error: %v", err)
	}

	contactWindowMin := envInt("CONTACT_RATE_LIMIT_WINDOW_MIN", 10)
	if contactWindowMin <= 0 {
		contactWindowMin = 10
	}
	contactMax := envInt("CONTACT_RATE_LIMIT_MAX", 5)
	if contactMax <= 0 {
		contactMax = 5
	}
	contactLimiter := newIPRateLimiter(contactMax, time.Duration(contactWindowMin)*time.Minute)

	mux := http.NewServeMux()

	handleOctoNotify := func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		cfg, err := readOctoConfig()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		body, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "failed to read body", http.StatusBadRequest)
			return
		}

		var cb octoCallback
		if err := json.Unmarshal(body, &cb); err != nil {
			http.Error(w, "invalid json body", http.StatusBadRequest)
			return
		}

		if cfg.UniqueKey != "" {
			expected := computeOctoSignature(cfg.UniqueKey, cb.OctoPaymentUUID, cb.Status)
			if !strings.EqualFold(expected, cb.Signature) {
				http.Error(w, "invalid signature", http.StatusUnauthorized)
				return
			}
		}

		if cb.ShopTransactionID != "" {
			_ = store.UpdateFromCallback(cb)
			if strings.EqualFold(cb.Status, "succeeded") {
				rec, ok, err := store.Get(cb.ShopTransactionID)
				if err == nil && ok {
					if rec.TelegramNotifiedAt == nil {
						err := sendTelegramPaymentSucceeded(rec)
						if err == nil {
							now := time.Now().UTC()
							rec.TelegramNotifiedAt = &now
							rec.TelegramLastError = ""
							_ = store.Save(rec)
						} else {
							rec.TelegramLastError = err.Error()
							_ = store.Save(rec)
							if !strings.Contains(err.Error(), "not configured") {
								log.Printf("telegram notify failed: %v", err)
							}
						}
					}
				}
			}
		}
		log.Printf("octo notify: shop_transaction_id=%s uuid=%s status=%s", cb.ShopTransactionID, cb.OctoPaymentUUID, cb.Status)
		w.WriteHeader(http.StatusNoContent)
	}

	mux.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(healthResponse{Status: "ok", Time: time.Now().UTC()})
	})

	mux.HandleFunc("/api/contact", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		ip := clientIP(r)
		if ip != "" && !contactLimiter.Allow(ip) {
			http.Error(w, "too many requests", http.StatusTooManyRequests)
			return
		}

		var in struct {
			Name    string `json:"name"`
			Email   string `json:"email"`
			Message string `json:"message"`
			Website string `json:"website"`
		}
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			http.Error(w, "invalid json body", http.StatusBadRequest)
			return
		}

		if strings.TrimSpace(in.Website) != "" {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		name := strings.TrimSpace(in.Name)
		email := strings.TrimSpace(in.Email)
		msg := strings.TrimSpace(in.Message)

		if len(name) > 256 {
			http.Error(w, "name too long", http.StatusBadRequest)
			return
		}
		if len(email) == 0 || len(email) > 256 || !strings.Contains(email, "@") {
			http.Error(w, "invalid email", http.StatusBadRequest)
			return
		}
		if len(msg) == 0 || len(msg) > 2048 {
			http.Error(w, "invalid message", http.StatusBadRequest)
			return
		}

		ua := strings.TrimSpace(r.UserAgent())
		text := fmt.Sprintf("Contact form\nName: %s\nEmail: %s\nMessage: %s\nIP: %s\nUA: %s", name, email, msg, ip, ua)
		if len(text) > 3900 {
			text = text[:3900]
		}

		if err := sendTelegramMessage(text); err != nil {
			http.Error(w, "failed to send", http.StatusBadGateway)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	})

	mux.HandleFunc("/api/payments/octo/prepare", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		cfg, err := readOctoConfig()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		var req prepareRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid json body", http.StatusBadRequest)
			return
		}

		planID := strings.ToLower(strings.TrimSpace(req.PlanID))
		planName, amount, ok := amountForPlanID(planID)
		if !ok {
			// Backward-compatible fallback: accept only whitelisted amounts.
			if req.TotalSum <= 0 {
				http.Error(w, "plan_id is required", http.StatusBadRequest)
				return
			}

			allowed := map[int]bool{249: true, 499: true, 899: true}
			rounded := int(math.Round(req.TotalSum))
			if !allowed[rounded] || math.Abs(req.TotalSum-float64(rounded)) > 0.0001 {
				http.Error(w, "invalid plan amount", http.StatusBadRequest)
				return
			}

			amount = rounded
			switch rounded {
			case 249:
				planID = "starter"
				planName = "Starter"
			case 499:
				planID = "pro"
				planName = "Pro"
			case 899:
				planID = "dominator"
				planName = "Dominator"
			}
		}

		currency := envString("OCTO_CURRENCY", req.Currency)
		if currency == "" {
			currency = "UZS"
		}
		test := envBool("OCTO_TEST", req.Test)
		language := envString("OCTO_LANGUAGE", req.Language)
		if language == "" {
			language = "ru"
		}
		ttl := envInt("OCTO_TTL", req.TTL)
		if ttl == 0 {
			ttl = 15
		}
		autoCapture := envBool("OCTO_AUTO_CAPTURE", true)

		description := fmt.Sprintf("PermitPulse - %s plan", planName)
		shopTransactionID := "pp-" + newTransactionID()
		initTime := time.Now().Format("2006-01-02 15:04:05")

		_ = store.Save(transactionRecord{
			ShopTransactionID: shopTransactionID,
			PlanID:            planID,
			PlanName:          planName,
			Amount:            amount,
			Currency:          currency,
			Status:            "initiated",
			CreatedAt:         time.Now().UTC(),
			UpdatedAt:         time.Now().UTC(),
		})

		octoReq := octoPreparePaymentRequest{
			OctoShopID:        cfg.ShopID,
			OctoSecret:        cfg.Secret,
			ShopTransactionID: shopTransactionID,
			AutoCapture:       autoCapture,
			InitTime:          initTime,
			Test:              test,
			TotalSum:          float64(amount),
			Currency:          currency,
			Description:       description,
			PaymentMethods:    octoDefaultPaymentMethods(currency),
			ReturnURL:         cfg.ReturnURL,
			NotifyURL:         cfg.NotifyURL,
			Language:          language,
			TTL:               ttl,
			UserData:          req.UserData,
			Basket:            req.Basket,
		}

		octoResp, err := octoPreparePayment(cfg, octoReq)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadGateway)
			return
		}
		if octoResp.Error != 0 {
			msg := octoResp.ErrMessage
			if msg == "" {
				msg = "octo error"
			}
			http.Error(w, msg, http.StatusBadGateway)
			return
		}

		_ = store.UpdateAfterPrepare(shopTransactionID, octoResp.Data)

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(octoResp.Data)
	})

	mux.HandleFunc("/api/payments/octo/status", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		cfg, err := readOctoConfig()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		shopTransactionID := r.URL.Query().Get("shop_transaction_id")
		if shopTransactionID == "" {
			http.Error(w, "shop_transaction_id is required", http.StatusBadRequest)
			return
		}

		octoResp, err := octoCheckStatus(cfg, shopTransactionID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadGateway)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(octoResp)
	})

	mux.HandleFunc("/api/payments/octo/notify", handleOctoNotify)
	mux.HandleFunc("/api/payments/notify", handleOctoNotify)

	mux.HandleFunc("/api/payments/transactions", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		shopTransactionID := r.URL.Query().Get("shop_transaction_id")
		if shopTransactionID == "" {
			http.Error(w, "shop_transaction_id is required", http.StatusBadRequest)
			return
		}

		rec, ok, err := store.Get(shopTransactionID)
		if err != nil {
			http.Error(w, "failed to read transaction", http.StatusInternalServerError)
			return
		}
		if !ok {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(rec)
	})

	spa := newSPAHandler(distDir)
	mux.Handle("/", spa)

	h := withCORS(mux)

	addr := strings.TrimSpace(os.Getenv("BACKEND_ADDR"))
	if addr == "" {
		addr = ":" + port
	}
	log.Printf("listening on %s", addr)
	log.Printf("serving frontend dist (if exists) from %s", distDir)
	if err := http.ListenAndServe(addr, h); err != nil {
		log.Fatal(err)
	}
}

type spaHandler struct {
	distDir string
	fs      http.Handler
}

func newSPAHandler(distDir string) http.Handler {
	return &spaHandler{
		distDir: distDir,
		fs:      http.FileServer(http.Dir(distDir)),
	}
}

func (h *spaHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if strings.HasPrefix(r.URL.Path, "/api/") {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	if !dirExists(h.distDir) {
		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("frontend build not found. Run the frontend dev server (Vite) or build it to frontend/dist."))
		return
	}

	path := r.URL.Path
	if path == "/" {
		serveIndex(w, r, h.distDir)
		return
	}

	clean := filepath.Clean(filepath.FromSlash(strings.TrimPrefix(path, "/")))
	candidate := filepath.Join(h.distDir, clean)
	lowerCandidate := strings.ToLower(candidate)

	if fileExists(candidate) {
		// If any stale HTML files exist in dist (e.g. from an old Webflow export),
		// never serve them. They will break SPA refresh by showing different markup.
		if strings.HasSuffix(lowerCandidate, ".html") && strings.ToLower(filepath.Base(candidate)) != "index.html" {
			serveIndex(w, r, h.distDir)
			return
		}

		if strings.HasPrefix(path, "/assets/") {
			base := strings.ToLower(filepath.Base(path))
			if strings.HasPrefix(base, "index-") {
				switch {
				case strings.HasSuffix(base, ".js"):
					if serveLatestIndexAsset(w, r, h.distDir, ".js") {
						return
					}
				case strings.HasSuffix(base, ".css"):
					if serveLatestIndexAsset(w, r, h.distDir, ".css") {
						return
					}
				}
			}

			setImmutableAssetCacheHeaders(w)
		} else if strings.HasSuffix(strings.ToLower(candidate), ".html") {
			setNoCacheHeaders(w)
		}
		h.fs.ServeHTTP(w, r)
		return
	}

	if strings.HasPrefix(path, "/assets/") {
		base := filepath.Base(path)
		lowerBase := strings.ToLower(base)
		if strings.HasPrefix(lowerBase, "index-") {
			switch {
			case strings.HasSuffix(lowerBase, ".js"):
				if serveLatestIndexAsset(w, r, h.distDir, ".js") {
					return
				}
			case strings.HasSuffix(lowerBase, ".css"):
				if serveLatestIndexAsset(w, r, h.distDir, ".css") {
					return
				}
			}
		}

		w.WriteHeader(http.StatusNotFound)
		return
	}

	serveIndex(w, r, h.distDir)
}

func serveIndex(w http.ResponseWriter, r *http.Request, distDir string) {
	setNoCacheHeaders(w)
	if r.URL.Query().Get("pp_clear_cache") == "1" {
		w.Header().Set("Clear-Site-Data", "\"cache\"")
	}
	indexPath := filepath.Join(distDir, "index.html")
	if fileExists(indexPath) {
		if st, err := os.Stat(indexPath); err == nil {
			w.Header().Set("X-PermitPulse-Index-Mtime", strconv.FormatInt(st.ModTime().Unix(), 10))
		}
		http.ServeFile(w, r, indexPath)
		return
	}

	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte("index.html not found in frontend dist."))
}

func setNoCacheHeaders(w http.ResponseWriter) {
	w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
	w.Header().Set("Surrogate-Control", "no-store")
	w.Header().Set("CDN-Cache-Control", "no-store")
	w.Header().Set("Pragma", "no-cache")
	w.Header().Set("Expires", "0")
}

func setImmutableAssetCacheHeaders(w http.ResponseWriter) {
	w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
}

func serveLatestIndexAsset(w http.ResponseWriter, r *http.Request, distDir string, ext string) bool {
	indexPath := filepath.Join(distDir, "index.html")
	if b, err := os.ReadFile(indexPath); err == nil {
		// The Vite build references /assets/index-<hash>.{js,css}. Always serve the asset referenced
		// by the current index.html so stale cached index.html can't pin users to old entry bundles.
		lowerExt := strings.ToLower(ext)
		re := regexp.MustCompile(`/assets/index-[^"']+\` + regexp.QuoteMeta(lowerExt) + `\b`)
		if m := re.Find(b); len(m) > 0 {
			p := filepath.FromSlash(strings.TrimPrefix(string(m), "/"))
			full := filepath.Join(distDir, p)
			if fileExists(full) {
				setNoCacheHeaders(w)
				http.ServeFile(w, r, full)
				return true
			}
		}
	}

	assetsDir := filepath.Join(distDir, "assets")
	entries, err := os.ReadDir(assetsDir)
	if err != nil {
		return false
	}

	var bestPath string
	var bestMod time.Time

	lowerExt := strings.ToLower(ext)
	for _, e := range entries {
		if e.IsDir() {
			continue
		}

		name := strings.ToLower(e.Name())
		if !strings.HasPrefix(name, "index-") {
			continue
		}
		if !strings.HasSuffix(name, lowerExt) {
			continue
		}
		if strings.HasSuffix(name, ".map") {
			continue
		}

		info, err := e.Info()
		if err != nil {
			continue
		}
		if bestPath == "" || info.ModTime().After(bestMod) {
			bestMod = info.ModTime()
			bestPath = filepath.Join(assetsDir, e.Name())
		}
	}

	if bestPath == "" {
		return false
	}

	setNoCacheHeaders(w)
	http.ServeFile(w, r, bestPath)
	return true
}

func dirExists(path string) bool {
	st, err := os.Stat(path)
	if err != nil {
		return false
	}
	return st.IsDir()
}

func fileExists(path string) bool {
	st, err := os.Stat(path)
	if err != nil {
		return false
	}
	return !st.IsDir()
}

func withCORS(next http.Handler) http.Handler {
	allowedOrigins := map[string]bool{
		"http://localhost:5173": true,
		"http://127.0.0.1:5173": true,
	}

	if base := strings.TrimSpace(os.Getenv("FRONTEND_BASE_URL")); base != "" {
		if u, err := url.Parse(base); err == nil {
			origin := ""
			if u.Scheme != "" && u.Host != "" {
				origin = u.Scheme + "://" + u.Host
			}
			if origin != "" {
				allowedOrigins[origin] = true
			}
		}
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin != "" && allowedOrigins[origin] {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
			w.Header().Set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
		}

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func envString(key, fallback string) string {
	v := strings.TrimSpace(os.Getenv(key))
	if v == "" {
		return fallback
	}
	return v
}

func envInt(key string, fallback int) int {
	v := strings.TrimSpace(os.Getenv(key))
	if v == "" {
		return fallback
	}
	i, err := strconv.Atoi(v)
	if err != nil {
		return fallback
	}
	return i
}

func envBool(key string, fallback bool) bool {
	v := strings.TrimSpace(os.Getenv(key))
	if v == "" {
		return fallback
	}
	b, err := strconv.ParseBool(v)
	if err != nil {
		return fallback
	}
	return b
}

func amountForPlanID(planID string) (planName string, amount int, ok bool) {
	switch strings.ToLower(strings.TrimSpace(planID)) {
	case "starter":
		return "Starter", 249, true
	case "pro":
		return "Pro", 499, true
	case "dominator":
		return "Dominator", 899, true
	default:
		return "", 0, false
	}
}

type ipRateLimiter struct {
	max    int
	window time.Duration
	mu     sync.Mutex
	items  map[string]ipRateLimiterItem
}

type ipRateLimiterItem struct {
	Count   int
	ResetAt time.Time
}

func newIPRateLimiter(max int, window time.Duration) *ipRateLimiter {
	if max <= 0 {
		max = 1
	}
	if window <= 0 {
		window = time.Minute
	}

	return &ipRateLimiter{max: max, window: window, items: map[string]ipRateLimiterItem{}}
}

func (l *ipRateLimiter) Allow(key string) bool {
	if strings.TrimSpace(key) == "" {
		return true
	}

	now := time.Now()
	l.mu.Lock()
	defer l.mu.Unlock()

	it, ok := l.items[key]
	if !ok || now.After(it.ResetAt) {
		l.items[key] = ipRateLimiterItem{Count: 1, ResetAt: now.Add(l.window)}
		return true
	}

	if it.Count >= l.max {
		return false
	}
	it.Count++
	l.items[key] = it
	return true
}

func clientIP(r *http.Request) string {
	if r == nil {
		return ""
	}

	if xff := strings.TrimSpace(r.Header.Get("X-Forwarded-For")); xff != "" {
		parts := strings.Split(xff, ",")
		if len(parts) > 0 {
			ip := strings.TrimSpace(parts[0])
			if net.ParseIP(ip) != nil {
				return ip
			}
		}
	}

	if xrip := strings.TrimSpace(r.Header.Get("X-Real-IP")); xrip != "" {
		if net.ParseIP(xrip) != nil {
			return xrip
		}
	}

	host, _, err := net.SplitHostPort(strings.TrimSpace(r.RemoteAddr))
	if err == nil {
		if net.ParseIP(host) != nil {
			return host
		}
	}

	if net.ParseIP(strings.TrimSpace(r.RemoteAddr)) != nil {
		return strings.TrimSpace(r.RemoteAddr)
	}

	return ""
}

func sendTelegramMessage(text string) error {
	token := strings.TrimSpace(os.Getenv("TELEGRAM_BOT_TOKEN"))
	chatID := strings.TrimSpace(os.Getenv("TELEGRAM_CHAT_ID"))
	if token == "" || chatID == "" {
		return fmt.Errorf("telegram is not configured")
	}

	text = strings.TrimSpace(text)
	if text == "" {
		return fmt.Errorf("empty telegram message")
	}
	if len(text) > 3900 {
		text = text[:3900]
	}

	form := url.Values{}
	form.Set("chat_id", chatID)
	form.Set("text", text)
	form.Set("disable_web_page_preview", "true")

	apiURL := "https://api.telegram.org/bot" + token + "/sendMessage"

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.PostForm(apiURL, form)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("telegram http %d: %s", resp.StatusCode, strings.TrimSpace(string(body)))
	}

	return nil
}

type prepareRequest struct {
	PlanID      string         `json:"plan_id"`
	TotalSum    float64        `json:"total_sum"`
	Currency    string         `json:"currency"`
	Description string         `json:"description"`
	Language    string         `json:"language"`
	Test        bool           `json:"test"`
	TTL         int            `json:"ttl"`
	UserData    *octoUserData  `json:"user_data"`
	Basket      []octoBasketIt `json:"basket"`
}

type octoConfig struct {
	ShopID    int
	Secret    string
	ReturnURL string
	NotifyURL string
	UniqueKey string
}

func readOctoConfig() (octoConfig, error) {
	shopIDRaw := strings.TrimSpace(os.Getenv("OCTO_SHOP_ID"))
	secret := strings.TrimSpace(os.Getenv("OCTO_SECRET"))
	returnURL := strings.TrimSpace(os.Getenv("OCTO_RETURN_URL"))
	notifyURL := strings.TrimSpace(os.Getenv("OCTO_NOTIFY_URL"))
	uniqueKey := strings.TrimSpace(os.Getenv("OCTO_UNIQUE_KEY"))

	if shopIDRaw == "" {
		return octoConfig{}, fmt.Errorf("missing OCTO_SHOP_ID")
	}
	shopID, err := strconv.Atoi(shopIDRaw)
	if err != nil {
		return octoConfig{}, fmt.Errorf("invalid OCTO_SHOP_ID")
	}
	if secret == "" {
		return octoConfig{}, fmt.Errorf("missing OCTO_SECRET")
	}
	if returnURL == "" {
		if base := strings.TrimSpace(os.Getenv("FRONTEND_BASE_URL")); base != "" {
			returnURL = strings.TrimRight(base, "/") + "/payment/return"
		} else {
			returnURL = "http://localhost:5173/payment/return"
		}
	}

	return octoConfig{ShopID: shopID, Secret: secret, ReturnURL: returnURL, NotifyURL: notifyURL, UniqueKey: uniqueKey}, nil
}

type octoPaymentMethod struct {
	Method string `json:"method"`
}

func octoDefaultPaymentMethods(currency string) []octoPaymentMethod {
	c := strings.ToUpper(strings.TrimSpace(currency))
	if c == "" {
		c = "UZS"
	}

	if c == "UZS" {
		return []octoPaymentMethod{{Method: "bank_card"}, {Method: "uzcard"}, {Method: "humo"}}
	}

	return []octoPaymentMethod{{Method: "bank_card"}}
}

type octoUserData struct {
	UserID string `json:"user_id,omitempty"`
	Phone  string `json:"phone,omitempty"`
	Email  string `json:"email,omitempty"`
}

type octoBasketIt struct {
	PositionDesc string  `json:"position_desc,omitempty"`
	Count        int     `json:"count,omitempty"`
	Price        float64 `json:"price,omitempty"`
	Spic         string  `json:"spic,omitempty"`
	Inn          string  `json:"inn,omitempty"`
	PackageCode  string  `json:"package_code,omitempty"`
	NDS          int     `json:"nds,omitempty"`
}

type octoPreparePaymentRequest struct {
	OctoShopID        int                 `json:"octo_shop_id"`
	OctoSecret        string              `json:"octo_secret"`
	ShopTransactionID string              `json:"shop_transaction_id"`
	AutoCapture       bool                `json:"auto_capture"`
	InitTime          string              `json:"init_time"`
	Test              bool                `json:"test"`
	UserData          *octoUserData       `json:"user_data,omitempty"`
	TotalSum          float64             `json:"total_sum"`
	Currency          string              `json:"currency"`
	Description       string              `json:"description"`
	Basket            []octoBasketIt      `json:"basket,omitempty"`
	PaymentMethods    []octoPaymentMethod `json:"payment_methods"`
	ReturnURL         string              `json:"return_url"`
	NotifyURL         string              `json:"notify_url,omitempty"`
	Language          string              `json:"language"`
	TTL               int                 `json:"ttl"`
}

type octoPreparePaymentData struct {
	ShopTransactionID string  `json:"shop_transaction_id"`
	OctoPaymentUUID   string  `json:"octo_payment_UUID"`
	Status            string  `json:"status"`
	OctoPayURL        string  `json:"octo_pay_url"`
	RefundedSum       float64 `json:"refunded_sum,omitempty"`
	TotalSum          float64 `json:"total_sum,omitempty"`
}

type octoPreparePaymentResponse struct {
	Error      int                    `json:"error"`
	ErrMessage string                 `json:"errMessage"`
	Data       octoPreparePaymentData `json:"data"`
}

func octoPreparePayment(cfg octoConfig, req octoPreparePaymentRequest) (octoPreparePaymentResponse, error) {
	var out octoPreparePaymentResponse

	b, err := json.Marshal(req)
	if err != nil {
		return out, err
	}

	httpReq, err := http.NewRequest(http.MethodPost, "https://secure.octo.uz/prepare_payment", bytes.NewReader(b))
	if err != nil {
		return out, err
	}
	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		return out, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return out, err
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return out, fmt.Errorf("octo http %d: %s", resp.StatusCode, strings.TrimSpace(string(body)))
	}

	if err := json.Unmarshal(body, &out); err != nil {
		return out, err
	}

	if out.Data.ShopTransactionID == "" {
		out.Data.ShopTransactionID = req.ShopTransactionID
	}

	return out, nil
}

type octoStatusResponse struct {
	Error      int    `json:"error"`
	ErrMessage string `json:"errMessage,omitempty"`
	Data       *struct {
		ShopTransactionID string `json:"shop_transaction_id"`
		OctoPaymentUUID   string `json:"octo_payment_UUID"`
		Status            string `json:"status"`
	} `json:"data"`
}

func octoCheckStatus(cfg octoConfig, shopTransactionID string) (octoStatusResponse, error) {
	var out octoStatusResponse

	req := map[string]any{
		"octo_shop_id":        cfg.ShopID,
		"octo_secret":         cfg.Secret,
		"shop_transaction_id": shopTransactionID,
	}

	b, err := json.Marshal(req)
	if err != nil {
		return out, err
	}

	httpReq, err := http.NewRequest(http.MethodPost, "https://secure.octo.uz/prepare_payment", bytes.NewReader(b))
	if err != nil {
		return out, err
	}
	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		return out, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return out, err
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return out, fmt.Errorf("octo http %d: %s", resp.StatusCode, strings.TrimSpace(string(body)))
	}

	if err := json.Unmarshal(body, &out); err != nil {
		return out, err
	}

	return out, nil
}

type octoCallback struct {
	ShopTransactionID string `json:"shop_transaction_id"`
	OctoPaymentUUID   string `json:"octo_payment_UUID"`
	Status            string `json:"status"`
	Signature         string `json:"signature"`
	HashKey           string `json:"hash_key"`
}

func computeOctoSignature(uniqueKey, uuid, status string) string {
	sum := sha1.Sum([]byte(uniqueKey + uuid + status))
	return strings.ToUpper(hex.EncodeToString(sum[:]))
}

type transactionRecord struct {
	ShopTransactionID  string        `json:"shop_transaction_id"`
	PlanID             string        `json:"plan_id"`
	PlanName           string        `json:"plan_name"`
	Amount             int           `json:"amount"`
	Currency           string        `json:"currency"`
	Status             string        `json:"status"`
	OctoPaymentUUID    string        `json:"octo_payment_UUID,omitempty"`
	OctoPayURL         string        `json:"octo_pay_url,omitempty"`
	RefundedSum        float64       `json:"refunded_sum,omitempty"`
	TotalSum           float64       `json:"total_sum,omitempty"`
	Callback           *octoCallback `json:"callback,omitempty"`
	TelegramNotifiedAt *time.Time    `json:"telegram_notified_at,omitempty"`
	TelegramLastError  string        `json:"telegram_last_error,omitempty"`
	CreatedAt          time.Time     `json:"created_at"`
	UpdatedAt          time.Time     `json:"updated_at"`
}

func sendTelegramPaymentSucceeded(rec transactionRecord) error {
	text := fmt.Sprintf(
		"Payment succeeded\nPlan: %s\nAmount: %d %s\nTransaction: %s\nUUID: %s\nStatus: %s",
		rec.PlanName,
		rec.Amount,
		rec.Currency,
		rec.ShopTransactionID,
		rec.OctoPaymentUUID,
		rec.Status,
	)
	return sendTelegramMessage(text)
}

type transactionStore struct {
	baseDir string
	mu      sync.Mutex
}

func newTransactionStore(baseDir string) *transactionStore {
	return &transactionStore{baseDir: baseDir}
}

func (s *transactionStore) Init() error {
	s.mu.Lock()
	defer s.mu.Unlock()
	return os.MkdirAll(filepath.Join(s.baseDir, "transactions"), 0o755)
}

func (s *transactionStore) pathFor(shopTransactionID string) string {
	name := strings.ReplaceAll(shopTransactionID, string(os.PathSeparator), "_")
	return filepath.Join(s.baseDir, "transactions", name+".json")
}

func (s *transactionStore) Get(shopTransactionID string) (transactionRecord, bool, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	var rec transactionRecord
	p := s.pathFor(shopTransactionID)
	b, err := os.ReadFile(p)
	if err != nil {
		if os.IsNotExist(err) {
			return rec, false, nil
		}
		return rec, false, err
	}
	if err := json.Unmarshal(b, &rec); err != nil {
		return rec, false, err
	}
	return rec, true, nil
}

func (s *transactionStore) Save(rec transactionRecord) error {
	if strings.TrimSpace(rec.ShopTransactionID) == "" {
		return fmt.Errorf("missing shop_transaction_id")
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	if err := os.MkdirAll(filepath.Join(s.baseDir, "transactions"), 0o755); err != nil {
		return err
	}

	b, err := json.MarshalIndent(rec, "", "  ")
	if err != nil {
		return err
	}

	p := s.pathFor(rec.ShopTransactionID)
	tmp := p + ".tmp"
	if err := os.WriteFile(tmp, b, 0o644); err != nil {
		return err
	}
	if err := os.Rename(tmp, p); err == nil {
		return nil
	}
	_ = os.Remove(p)
	return os.Rename(tmp, p)
}

func (s *transactionStore) UpdateAfterPrepare(shopTransactionID string, data octoPreparePaymentData) error {
	rec, ok, err := s.Get(shopTransactionID)
	if err != nil {
		return err
	}
	if !ok {
		rec = transactionRecord{ShopTransactionID: shopTransactionID, CreatedAt: time.Now().UTC()}
	}

	rec.OctoPaymentUUID = data.OctoPaymentUUID
	rec.OctoPayURL = data.OctoPayURL
	if data.Status != "" {
		rec.Status = data.Status
	}
	if data.TotalSum != 0 {
		rec.TotalSum = data.TotalSum
	}
	if data.RefundedSum != 0 {
		rec.RefundedSum = data.RefundedSum
	}
	rec.UpdatedAt = time.Now().UTC()

	return s.Save(rec)
}

func (s *transactionStore) UpdateFromCallback(cb octoCallback) error {
	rec, ok, err := s.Get(cb.ShopTransactionID)
	if err != nil {
		return err
	}
	if !ok {
		rec = transactionRecord{ShopTransactionID: cb.ShopTransactionID, CreatedAt: time.Now().UTC()}
	}

	rec.Callback = &cb
	rec.OctoPaymentUUID = cb.OctoPaymentUUID
	if cb.Status != "" {
		rec.Status = cb.Status
	}
	rec.UpdatedAt = time.Now().UTC()

	return s.Save(rec)
}

func newTransactionID() string {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return fmt.Sprintf("tx_%d", time.Now().UnixNano())
	}
	return hex.EncodeToString(b)
}

func loadDotEnv(path string) error {
	b, err := os.ReadFile(path)
	if err != nil {
		return err
	}

	lines := strings.Split(string(b), "\n")
	for _, line := range lines {
		line = strings.TrimSpace(strings.TrimSuffix(line, "\r"))
		if line == "" {
			continue
		}
		if strings.HasPrefix(line, "#") {
			continue
		}
		k, v, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}
		k = strings.TrimSpace(k)
		v = strings.TrimSpace(v)
		v = strings.Trim(v, "\"")
		if k == "" {
			continue
		}
		if os.Getenv(k) != "" {
			continue
		}
		_ = os.Setenv(k, v)
	}

	return nil
}
