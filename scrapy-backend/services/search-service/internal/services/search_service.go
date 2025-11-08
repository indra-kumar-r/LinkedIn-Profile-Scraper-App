package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"search-service/internal/models"
	"search-service/internal/serpapi"
	"time"

	"github.com/google/uuid"
)

type SearchService struct {
	SerpClient        *serpapi.SerpClient
	UserServiceURL    string
	StorageServiceURL string
	HTTPClient        *http.Client
}

func NewSearchService(serpClient *serpapi.SerpClient, userServiceURL string, storageServiceURL string) *SearchService {
	return &SearchService{
		SerpClient:        serpClient,
		UserServiceURL:    userServiceURL,
		StorageServiceURL: storageServiceURL,
		HTTPClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (s *SearchService) Search(ctx context.Context, userID, query, searchID string, page int) (*models.SearchResponse, string, error) {
	user, err := s.fetchUser(ctx, userID)
	if err != nil {
		return nil, "", err
	}

	if user.User.SerpAPIKey == "" {
		return nil, "", fmt.Errorf("user %s missing SerpAPI key", userID)
	}

	searchResp, err := s.SerpClient.Search(query, page, user.User.SerpAPIKey)
	if err != nil {
		return nil, "", fmt.Errorf("failed to query SerpAPI: %v", err)
	}

	if searchID == "" {
		searchID = uuid.NewString()
	}

	go s.storeResults(userID, query, page, searchID, searchResp)

	return searchResp, searchID, nil
}

func (s *SearchService) fetchUser(ctx context.Context, userID string) (*models.UserResponse, error) {
	userURL := fmt.Sprintf("%s/api/v1/users/%s", s.UserServiceURL, userID)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, userURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create user-service request: %v", err)
	}

	resp, err := s.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to call user-service: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("user-service returned status %d", resp.StatusCode)
	}

	var user models.UserResponse
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		return nil, fmt.Errorf("invalid user-service response: %v", err)
	}

	return &user, nil
}

func (s *SearchService) storeResults(userID, query string, page int, searchID string, searchResp *models.SearchResponse) {
	storePayload := models.SearchResult{
		SearchID: searchID,
		UserID:   userID,
		Query:    query,
		Page:     page,
		Results:  *searchResp,
	}

	body, _ := json.Marshal(storePayload)
	storeURL := fmt.Sprintf("%s/api/v1/store", s.StorageServiceURL)

	const maxAttempts = 3
	backoff := time.Second

	for attempt := 1; attempt <= maxAttempts; attempt++ {
		req, _ := http.NewRequest(http.MethodPost, storeURL, bytes.NewReader(body))
		req.Header.Set("Content-Type", "application/json")

		resp, err := s.HTTPClient.Do(req)
		if err != nil {
			fmt.Printf("Storage attempt %d failed: %v\n", attempt, err)
		} else {
			resp.Body.Close()
			if resp.StatusCode == http.StatusCreated {
				fmt.Println("Search results stored successfully.")
				return
			}
			fmt.Printf("Storage attempt %d returned %d\n", attempt, resp.StatusCode)
		}

		time.Sleep(backoff)
		backoff *= 2
	}

	fmt.Println("Failed to store results after 3 attempts.")
}
