package main

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"sync"
	"time"
)

type applicationRecord struct {
	ApplicationID                 string    `json:"applicationId"`
	FullName                      string    `json:"fullName"`
	Email                         string    `json:"email"`
	PhoneCountryDial              string    `json:"phoneCountryDial"`
	PhoneNumber                   string    `json:"phoneNumber"`
	CountryOfResidence            string    `json:"countryOfResidence"`
	City                          string    `json:"city"`
	Age                           string    `json:"age"`
	OrganizationName              string    `json:"organizationName"`
	ParticipatedBefore            string    `json:"participatedBefore"`
	PreferredParticipationType    string    `json:"preferredParticipationType"`
	Motivation                    string    `json:"motivation"`
	AmbassadorCode                string    `json:"ambassadorCode"`
	AgreedToTermsAndPrivacyPolicy bool      `json:"agreedToTermsAndPrivacyPolicy"`
	PaymentID                     string    `json:"paymentId"`
	PaymentStatus                 string    `json:"paymentStatus"`
	PaidAt                        time.Time `json:"paidAt,omitempty"`
	TelegramNotified              bool      `json:"telegramNotified"`
	CreatedAt                     time.Time `json:"createdAt"`
	UpdatedAt                     time.Time `json:"updatedAt"`
}

type applicationStore struct {
	mu      sync.Mutex
	path    string
	records map[string]applicationRecord
}

func NewApplicationStore(path string) (*applicationStore, error) {
	s := &applicationStore{
		path:    path,
		records: make(map[string]applicationRecord),
	}

	if err := s.load(); err != nil {
		return nil, err
	}

	return s, nil
}

func (s *applicationStore) load() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.path == "" {
		return errors.New("application store path is empty")
	}

	data, err := os.ReadFile(s.path)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return nil
		}
		return err
	}
	if len(data) == 0 {
		return nil
	}

	var records map[string]applicationRecord
	if err := json.Unmarshal(data, &records); err != nil {
		return err
	}
	if records != nil {
		s.records = records
	}
	return nil
}

func (s *applicationStore) Create(applicationID string, req applicationSubmitRequest) error {
	now := time.Now().UTC()
	record := applicationRecord{
		ApplicationID:                 applicationID,
		FullName:                      req.FullName,
		Email:                         req.Email,
		PhoneCountryDial:              req.PhoneCountryDial,
		PhoneNumber:                   req.PhoneNumber,
		CountryOfResidence:            req.CountryOfResidence,
		City:                          req.City,
		Age:                           req.Age,
		OrganizationName:              req.OrganizationName,
		ParticipatedBefore:            req.ParticipatedBefore,
		PreferredParticipationType:    req.PreferredParticipationType,
		Motivation:                    req.Motivation,
		AmbassadorCode:                req.AmbassadorCode,
		AgreedToTermsAndPrivacyPolicy: req.AgreedToTermsAndPrivacyPolicy,
		PaymentStatus:                 "created",
		CreatedAt:                     now,
		UpdatedAt:                     now,
	}

	return s.saveRecord(record)
}

func (s *applicationStore) UpdatePayment(applicationID, paymentID, paymentStatus string) (applicationRecord, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	record, ok := s.records[applicationID]
	if !ok {
		return applicationRecord{}, errors.New("application not found")
	}

	record.PaymentID = paymentID
	record.PaymentStatus = paymentStatus
	record.UpdatedAt = time.Now().UTC()
	if isSuccessfulPaymentStatus(paymentStatus) && record.PaidAt.IsZero() {
		record.PaidAt = time.Now().UTC()
	}

	s.records[applicationID] = record
	if err := s.persistLocked(); err != nil {
		return applicationRecord{}, err
	}

	return record, nil
}

func (s *applicationStore) MarkTelegramNotified(applicationID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	record, ok := s.records[applicationID]
	if !ok {
		return errors.New("application not found")
	}

	record.TelegramNotified = true
	record.UpdatedAt = time.Now().UTC()
	s.records[applicationID] = record

	return s.persistLocked()
}

func (s *applicationStore) saveRecord(record applicationRecord) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.records[record.ApplicationID] = record
	return s.persistLocked()
}

func (s *applicationStore) persistLocked() error {
	if err := os.MkdirAll(filepath.Dir(s.path), 0o755); err != nil {
		return err
	}

	data, err := json.MarshalIndent(s.records, "", "  ")
	if err != nil {
		return err
	}

	tmpPath := s.path + ".tmp"
	if err := os.WriteFile(tmpPath, data, 0o644); err != nil {
		return err
	}

	return os.Rename(tmpPath, s.path)
}

func isSuccessfulPaymentStatus(status string) bool {
	switch status {
	case "succeeded", "captured":
		return true
	default:
		return false
	}
}
