package serpapi

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"search-service/internal/models"
	"time"
)

type SerpClient struct {
	HTTPClient *http.Client
}

func NewSerpClient() *SerpClient {
	return &SerpClient{
		HTTPClient: &http.Client{
			Timeout: 12 * time.Second,
		},
	}
}

func (c *SerpClient) Search(query string, page int, apiKey string) (*models.SearchResponse, error) {
	if apiKey == "" {
		return nil, fmt.Errorf("missing SerpAPI key")
	}

	params := url.Values{}
	params.Add("q", query)
	params.Add("engine", "google")
	params.Add("location", "India")
	params.Add("google_domain", "google.co.in")
	params.Add("hl", "en")
	params.Add("gl", "in")
	params.Add("start", fmt.Sprintf("%d", page*10))
	params.Add("api_key", apiKey)

	apiURL := fmt.Sprintf("https://serpapi.com/search.json?%s", params.Encode())

	req, err := http.NewRequest(http.MethodGet, apiURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to call SerpAPI: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("SerpAPI returned %d", resp.StatusCode)
	}

	var result models.SearchResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode SerpAPI response: %v", err)
	}

	return &result, nil
}
