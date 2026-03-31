package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

type TelegramNotifier struct {
	botToken string
	chatID   string
	client   *http.Client
}

type telegramSendMessageRequest struct {
	ChatID    string `json:"chat_id"`
	Text      string `json:"text"`
	ParseMode string `json:"parse_mode,omitempty"`
}

type telegramSendMessageResponse struct {
	OK          bool   `json:"ok"`
	Description string `json:"description"`
}

func NewTelegramNotifier(cfg Config) *TelegramNotifier {
	return &TelegramNotifier{
		botToken: strings.TrimSpace(cfg.TelegramBotToken),
		chatID:   strings.TrimSpace(cfg.TelegramChatID),
		client: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

func (n *TelegramNotifier) Enabled() bool {
	return n != nil && n.botToken != "" && n.chatID != ""
}

func (n *TelegramNotifier) SendPaidApplication(ctx context.Context, record applicationRecord) error {
	if !n.Enabled() {
		return nil
	}

	payload := telegramSendMessageRequest{
		ChatID:    n.chatID,
		Text:      formatTelegramPaidApplicationMessage(record),
		ParseMode: "HTML",
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("marshal telegram payload: %w", err)
	}

	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", n.botToken)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("create telegram request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := n.client.Do(req)
	if err != nil {
		return fmt.Errorf("telegram request failed: %w", err)
	}
	defer resp.Body.Close()

	var telegramResp telegramSendMessageResponse
	_ = json.NewDecoder(resp.Body).Decode(&telegramResp)

	if resp.StatusCode < 200 || resp.StatusCode >= 300 || !telegramResp.OK {
		msg := telegramResp.Description
		if msg == "" {
			msg = resp.Status
		}
		return fmt.Errorf("telegram send failed: %s", msg)
	}

	return nil
}

func formatTelegramPaidApplicationMessage(record applicationRecord) string {
	paidAt := "-"
	if !record.PaidAt.IsZero() {
		paidAt = record.PaidAt.Format("2006-01-02 15:04:05 MST")
	}

	return strings.Join([]string{
		"<b>✅ Successful payment received</b>",
		fmt.Sprintf("<b>Application ID:</b> <code>%s</code>", escapeTelegramHTML(record.ApplicationID)),
		fmt.Sprintf("<b>Payment ID:</b> <code>%s</code>", escapeTelegramHTML(record.PaymentID)),
		fmt.Sprintf("<b>Status:</b> %s", escapeTelegramHTML(record.PaymentStatus)),
		fmt.Sprintf("<b>Paid at:</b> %s", escapeTelegramHTML(paidAt)),
		"",
		"<b>Applicant data</b>",
		fmt.Sprintf("<b>Full name:</b> %s", escapeTelegramHTML(record.FullName)),
		fmt.Sprintf("<b>Email:</b> %s", escapeTelegramHTML(record.Email)),
		fmt.Sprintf("<b>Phone:</b> %s%s", escapeTelegramHTML(record.PhoneCountryDial), escapeTelegramHTML(record.PhoneNumber)),
		fmt.Sprintf("<b>Country:</b> %s", escapeTelegramHTML(record.CountryOfResidence)),
		fmt.Sprintf("<b>City:</b> %s", escapeTelegramHTML(record.City)),
		fmt.Sprintf("<b>Age:</b> %s", escapeTelegramHTML(record.Age)),
		fmt.Sprintf("<b>Organization:</b> %s", escapeTelegramHTML(record.OrganizationName)),
		fmt.Sprintf("<b>Participated before:</b> %s", escapeTelegramHTML(record.ParticipatedBefore)),
		fmt.Sprintf("<b>Participation type:</b> %s", escapeTelegramHTML(record.PreferredParticipationType)),
		fmt.Sprintf("<b>Ambassador code:</b> %s", escapeTelegramHTML(record.AmbassadorCode)),
		fmt.Sprintf("<b>Motivation:</b> %s", escapeTelegramHTML(record.Motivation)),
	}, "\n")
}

func escapeTelegramHTML(s string) string {
	replacer := strings.NewReplacer(
		"&", "&amp;",
		"<", "&lt;",
		">", "&gt;",
	)
	return replacer.Replace(strings.TrimSpace(s))
}
