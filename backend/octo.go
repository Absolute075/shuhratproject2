package main

import (
	"bytes"
	"context"
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"
)

const octoPreparePaymentURL = "https://secure.octo.uz/prepare_payment"

type OctoProvider struct {
	shopID      int
	secret      string
	test        bool
	currency    string
	language    string
	ttlMinutes  int
	autoCapture bool
	returnURL   string
	notifyURL   string
	client      *http.Client
}

func NewOctoProvider(cfg Config) *OctoProvider {
	return &OctoProvider{
		shopID:      cfg.OctoShopID,
		secret:      cfg.OctoSecret,
		test:        cfg.OctoTest,
		currency:    cfg.OctoCurrency,
		language:    cfg.OctoLanguage,
		ttlMinutes:  cfg.OctoTTLMinutes,
		autoCapture: cfg.OctoAutoCapture,
		returnURL:   cfg.ReturnURL,
		notifyURL:   cfg.NotifyURL,
		client: &http.Client{
			Timeout: 20 * time.Second,
		},
	}
}

type octoPreparePaymentRequest struct {
	OctoShopID        int                 `json:"octo_shop_id"`
	OctoSecret        string              `json:"octo_secret"`
	ShopTransactionID string              `json:"shop_transaction_id"`
	AutoCapture       bool                `json:"auto_capture"`
	Test              bool                `json:"test"`
	InitTime          string              `json:"init_time"`
	UserData          octoUserData        `json:"user_data"`
	TotalSum          float64             `json:"total_sum"`
	Currency          string              `json:"currency"`
	Description       string              `json:"description"`
	Basket            []octoBasketItem    `json:"basket,omitempty"`
	PaymentMethods    []octoPaymentMethod `json:"payment_methods,omitempty"`
	ReturnURL         string              `json:"return_url"`
	NotifyURL         string              `json:"notify_url,omitempty"`
	Language          string              `json:"language,omitempty"`
	TTL               int                 `json:"ttl,omitempty"`
}

type octoUserData struct {
	UserID string `json:"user_id"`
	Phone  string `json:"phone"`
	Email  string `json:"email"`
}

type octoBasketItem struct {
	PositionDesc string  `json:"position_desc"`
	Count        int     `json:"count"`
	Price        float64 `json:"price"`
}

type octoPaymentMethod struct {
	Method string `json:"method"`
}

type octoPreparePaymentResponse struct {
	Error      int    `json:"error"`
	ErrMessage string `json:"errMessage"`
	Data       *struct {
		ShopTransactionID string  `json:"shop_transaction_id"`
		OctoPaymentUUID   string  `json:"octo_payment_UUID"`
		Status            string  `json:"status"`
		OctoPayURL        string  `json:"octo_pay_url"`
		RefundedSum       float64 `json:"refunded_sum"`
		TotalSum          float64 `json:"total_sum"`
	} `json:"data"`
	ShopTransactionID string  `json:"shop_transaction_id"`
	OctoPaymentUUID   string  `json:"octo_payment_UUID"`
	Status            string  `json:"status"`
	OctoPayURL        string  `json:"octo_pay_url"`
	RefundedSum       float64 `json:"refunded_sum"`
	TotalSum          float64 `json:"total_sum"`
}

type createPaymentRequest struct {
	ShopTransactionID string  `json:"shopTransactionId"`
	Amount            float64 `json:"amount"`
	Currency          string  `json:"currency"`
	Description       string  `json:"description"`
	FullName          string  `json:"fullName"`
	Email             string  `json:"email"`
	Phone             string  `json:"phone"`
}

type createPaymentResponse struct {
	PaymentID   string `json:"paymentId"`
	RedirectURL string `json:"redirectUrl"`
	Status      string `json:"status"`
}

type paymentProvider interface {
	CreatePayment(ctx context.Context, req createPaymentRequest) (createPaymentResponse, error)
}

func (p *OctoProvider) CreatePayment(ctx context.Context, req createPaymentRequest) (createPaymentResponse, error) {
	if p.shopID == 0 || p.secret == "" {
		return createPaymentResponse{}, errors.New("octo is not configured")
	}

	currency := req.Currency
	if currency == "" {
		currency = p.currency
	}

	shopTx := strings.TrimSpace(req.ShopTransactionID)
	if shopTx == "" {
		shopTx = uuid.NewString()
	}

	payload := octoPreparePaymentRequest{
		OctoShopID:        p.shopID,
		OctoSecret:        p.secret,
		ShopTransactionID: shopTx,
		AutoCapture:       p.autoCapture,
		Test:              p.test,
		InitTime:          time.Now().Format("2006-01-02 15:04:05"),
		UserData: octoUserData{
			UserID: req.FullName,
			Phone:  digitsOnly(req.Phone),
			Email:  req.Email,
		},
		TotalSum:    req.Amount,
		Currency:    currency,
		Description: req.Description,
		Basket: []octoBasketItem{
			{PositionDesc: req.Description, Count: 1, Price: req.Amount},
		},
		PaymentMethods: []octoPaymentMethod{{Method: "bank_card"}, {Method: "uzcard"}, {Method: "humo"}},
		ReturnURL:      p.returnURL,
		NotifyURL:      p.notifyURL,
		Language:       p.language,
		TTL:            p.ttlMinutes,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return createPaymentResponse{}, fmt.Errorf("marshal payload: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, octoPreparePaymentURL, bytes.NewReader(body))
	if err != nil {
		return createPaymentResponse{}, fmt.Errorf("create request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")

	httpResp, err := p.client.Do(httpReq)
	if err != nil {
		return createPaymentResponse{}, fmt.Errorf("octo request failed: %w", err)
	}
	defer httpResp.Body.Close()

	var resp octoPreparePaymentResponse
	if err := json.NewDecoder(httpResp.Body).Decode(&resp); err != nil {
		return createPaymentResponse{}, fmt.Errorf("decode octo response: %w", err)
	}

	if httpResp.StatusCode < 200 || httpResp.StatusCode >= 300 {
		msg := resp.ErrMessage
		if msg == "" {
			msg = httpResp.Status
		}
		return createPaymentResponse{}, fmt.Errorf("octo http error: %s", msg)
	}

	if resp.Error != 0 {
		msg := resp.ErrMessage
		if msg == "" {
			msg = "octo error"
		}
		return createPaymentResponse{}, fmt.Errorf("octo error: %s", msg)
	}

	payURL := resp.OctoPayURL
	paymentID := resp.OctoPaymentUUID
	status := resp.Status
	if resp.Data != nil {
		if resp.Data.OctoPayURL != "" {
			payURL = resp.Data.OctoPayURL
		}
		if resp.Data.OctoPaymentUUID != "" {
			paymentID = resp.Data.OctoPaymentUUID
		}
		if resp.Data.Status != "" {
			status = resp.Data.Status
		}
	}

	if payURL == "" {
		return createPaymentResponse{}, errors.New("octo_pay_url missing")
	}

	return createPaymentResponse{
		PaymentID:   paymentID,
		RedirectURL: payURL,
		Status:      status,
	}, nil
}

type octoCheckStatusRequest struct {
	OctoShopID        int    `json:"octo_shop_id"`
	OctoSecret        string `json:"octo_secret"`
	ShopTransactionID string `json:"shop_transaction_id"`
}

func (p *OctoProvider) CheckStatus(ctx context.Context, shopTransactionID string) (string, error) {
	if p.shopID == 0 || p.secret == "" {
		return "", errors.New("octo is not configured")
	}
	if strings.TrimSpace(shopTransactionID) == "" {
		return "", errors.New("shop_transaction_id missing")
	}

	payload := octoCheckStatusRequest{
		OctoShopID:        p.shopID,
		OctoSecret:        p.secret,
		ShopTransactionID: shopTransactionID,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("marshal payload: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, octoPreparePaymentURL, bytes.NewReader(body))
	if err != nil {
		return "", fmt.Errorf("create request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")

	httpResp, err := p.client.Do(httpReq)
	if err != nil {
		return "", fmt.Errorf("octo request failed: %w", err)
	}
	defer httpResp.Body.Close()

	var resp octoPreparePaymentResponse
	if err := json.NewDecoder(httpResp.Body).Decode(&resp); err != nil {
		return "", fmt.Errorf("decode octo response: %w", err)
	}

	if httpResp.StatusCode < 200 || httpResp.StatusCode >= 300 {
		msg := resp.ErrMessage
		if msg == "" {
			msg = httpResp.Status
		}
		return "", fmt.Errorf("octo http error: %s", msg)
	}

	if resp.Error != 0 {
		msg := resp.ErrMessage
		if msg == "" {
			msg = "octo error"
		}
		return "", fmt.Errorf("octo error: %s", msg)
	}

	st := resp.Status
	if resp.Data != nil && resp.Data.Status != "" {
		st = resp.Data.Status
	}
	if strings.TrimSpace(st) == "" {
		return "", errors.New("status missing")
	}
	return st, nil
}

func expectedOctoCallbackSignature(uniqueKey, uuid, status string) string {
	h := sha1.Sum([]byte(uniqueKey + uuid + status))
	return strings.ToUpper(hex.EncodeToString(h[:]))
}

func verifyOctoCallbackSignature(uniqueKey, uuid, status, signature, hashKey string) bool {
	if strings.TrimSpace(uniqueKey) == "" {
		return true
	}
	expected := expectedOctoCallbackSignature(uniqueKey, uuid, status)
	return strings.EqualFold(strings.TrimSpace(signature), expected) || strings.EqualFold(strings.TrimSpace(hashKey), expected)
}

var nonDigits = regexp.MustCompile(`\D+`)

func digitsOnly(s string) string {
	return nonDigits.ReplaceAllString(s, "")
}
