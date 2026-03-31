package main

import (
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Addr                 string
	FrontendURL          string
	OctoShopID           int
	OctoSecret           string
	OctoUniqueKey        string
	OctoTest             bool
	OctoCurrency         string
	OctoLanguage         string
	OctoTTLMinutes       int
	OctoAutoCapture      bool
	ReturnURL            string
	NotifyURL            string
	ApplicationFee       float64
	ApplicationStorePath string
	TelegramBotToken     string
	TelegramChatID       string
}

func LoadConfig() Config {
	frontendURL := envOrDefault("FRONTEND_BASE_URL", "http://localhost:5173")
	returnURL := envOrDefault("OCTO_RETURN_URL", frontendURL)
	notifyURL := envOrDefault("OCTO_NOTIFY_URL", "")

	fee := envFloatOrDefault("APPLICATION_FEE", 20)

	return Config{
		Addr:                 envOrDefault("BACKEND_ADDR", ":8080"),
		FrontendURL:          frontendURL,
		OctoShopID:           envIntOrDefault("OCTO_SHOP_ID", 0),
		OctoSecret:           envOrDefault("OCTO_SECRET", ""),
		OctoUniqueKey:        envOrDefault("OCTO_UNIQUE_KEY", ""),
		OctoTest:             envBoolOrDefault("OCTO_TEST", false),
		OctoCurrency:         envOrDefault("OCTO_CURRENCY", "USD"),
		OctoLanguage:         envOrDefault("OCTO_LANGUAGE", "en"),
		OctoTTLMinutes:       envIntOrDefault("OCTO_TTL", 15),
		OctoAutoCapture:      envBoolOrDefault("OCTO_AUTO_CAPTURE", true),
		ReturnURL:            returnURL,
		NotifyURL:            notifyURL,
		ApplicationFee:       fee,
		ApplicationStorePath: envOrDefault("APPLICATION_STORE_PATH", "data/applications.json"),
		TelegramBotToken:     envOrDefault("TELEGRAM_BOT_TOKEN", ""),
		TelegramChatID:       envOrDefault("TELEGRAM_CHAT_ID", ""),
	}
}

func envOrDefault(key, def string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return def
}

func envIntOrDefault(key string, def int) int {
	v := strings.TrimSpace(os.Getenv(key))
	if v == "" {
		return def
	}
	i, err := strconv.Atoi(v)
	if err != nil {
		return def
	}
	return i
}

func envFloatOrDefault(key string, def float64) float64 {
	v := strings.TrimSpace(os.Getenv(key))
	if v == "" {
		return def
	}
	f, err := strconv.ParseFloat(v, 64)
	if err != nil {
		return def
	}
	return f
}

func envBoolOrDefault(key string, def bool) bool {
	v := strings.TrimSpace(os.Getenv(key))
	if v == "" {
		return def
	}
	b, err := strconv.ParseBool(v)
	if err != nil {
		return def
	}
	return b
}
