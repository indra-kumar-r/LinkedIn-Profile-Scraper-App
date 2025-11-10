package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"user-service/internal/models"
	"user-service/internal/repository"

	"go.mongodb.org/mongo-driver/bson"
)

type UserService struct {
	UserRepo *repository.UserRepository
}

func NewUserService(repo *repository.UserRepository) *UserService {
	return &UserService{UserRepo: repo}
}

func (s *UserService) CreateUser(ctx context.Context, request *models.CreateUserRequest) (*models.User, error) {
	if request.Name == "" {
		return nil, errors.New("user name is required")
	}
	if request.Email == "" {
		return nil, errors.New("user email is required")
	}
	if request.SerpAPIKey == "" {
		return nil, errors.New("serpapi key is required")
	}

	accountDetails, err := s.fetchSerpAPIAccountData(request.SerpAPIKey)
	if err != nil {
		return nil, fmt.Errorf("invalid SerpAPI key: %v", err)
	}

	user := &models.User{
		Name:                    request.Name,
		Email:                   request.Email,
		SerpAPIKey:              request.SerpAPIKey,
		AccountID:               accountDetails.AccountID,
		AccountStatus:           accountDetails.AccountStatus,
		PlanName:                accountDetails.PlanName,
		SearchesPerMonth:        accountDetails.SearchesPerMonth,
		TotalSearchesLeft:       accountDetails.TotalSearchesLeft,
		ThisMonthUsage:          accountDetails.ThisMonthUsage,
		ThisHourSearches:        accountDetails.ThisHourSearches,
		LastHourSearches:        accountDetails.LastHourSearches,
		AccountRateLimitPerHour: accountDetails.AccountRateLimitPerHour,
		RemainingCredits:        accountDetails.TotalSearchesLeft,
	}

	if err := s.UserRepo.CreateUser(ctx, user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *UserService) GetUsers(ctx context.Context) ([]*models.Users, error) {
	return s.UserRepo.GetUsers(ctx)
}

func (s *UserService) GetUser(ctx context.Context, uuid string) (*models.User, error) {
	return s.UserRepo.GetUser(ctx, uuid)
}

func (s *UserService) UpdateUser(ctx context.Context, uuid string, request *models.User) error {
	if request == nil {
		return errors.New("no data provided for update")
	}

	existingUser, err := s.UserRepo.GetUser(ctx, uuid)
	if err != nil {
		return fmt.Errorf("user not found: %v", err)
	}

	serpAPIKey := request.SerpAPIKey
	if serpAPIKey == "" {
		serpAPIKey = existingUser.SerpAPIKey
	}

	accountDetails, err := s.fetchSerpAPIAccountData(serpAPIKey)
	if err != nil {
		return fmt.Errorf("failed to fetch SerpAPI data: %v", err)
	}

	user := &models.User{
		Name:                    coalesce(request.Name, existingUser.Name),
		Email:                   coalesce(request.Email, existingUser.Email),
		SerpAPIKey:              serpAPIKey,
		AccountID:               accountDetails.AccountID,
		AccountStatus:           accountDetails.AccountStatus,
		PlanName:                accountDetails.PlanName,
		SearchesPerMonth:        accountDetails.SearchesPerMonth,
		TotalSearchesLeft:       accountDetails.TotalSearchesLeft,
		ThisMonthUsage:          accountDetails.ThisMonthUsage,
		ThisHourSearches:        accountDetails.ThisHourSearches,
		LastHourSearches:        accountDetails.LastHourSearches,
		AccountRateLimitPerHour: accountDetails.AccountRateLimitPerHour,
		RemainingCredits:        accountDetails.TotalSearchesLeft,
		CreatedAt:               existingUser.CreatedAt,
	}

	updatedUser := structConversion(user)

	return s.UserRepo.UpdateUser(ctx, uuid, updatedUser)
}

func (s *UserService) DeleteUser(ctx context.Context, uuid string) error {
	return s.UserRepo.DeleteUser(ctx, uuid)
}

func (s *UserService) fetchSerpAPIAccountData(apiKey string) (*models.SerpAPIAccountDetails, error) {
	url := fmt.Sprintf("https://serpapi.com/account?api_key=%s", apiKey)
	client := http.Client{Timeout: 10 * time.Second}

	response, err := client.Get(url)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(response.Body).Decode(&result); err != nil {
		return nil, err
	}

	if errMsg, ok := result["error"]; ok {
		return nil, fmt.Errorf("%v", errMsg)
	}

	getString := func(key string) string {
		if val, ok := result[key].(string); ok {
			return val
		}
		return ""
	}
	getInt := func(key string) int {
		if val, ok := result[key].(float64); ok {
			return int(val)
		}
		return 0
	}

	return &models.SerpAPIAccountDetails{
		AccountID:               getString("account_id"),
		AccountStatus:           getString("account_status"),
		PlanName:                getString("plan_name"),
		SearchesPerMonth:        getInt("searches_per_month"),
		TotalSearchesLeft:       getInt("total_searches_left"),
		ThisMonthUsage:          getInt("this_month_usage"),
		ThisHourSearches:        getInt("this_hour_searches"),
		LastHourSearches:        getInt("last_hour_searches"),
		AccountRateLimitPerHour: getInt("account_rate_limit_per_hour"),
	}, nil
}

func structConversion(value any) bson.M {
	data, _ := bson.Marshal(value)
	var m bson.M
	_ = bson.Unmarshal(data, &m)

	for key, val := range m {
		switch v := val.(type) {
		case string:
			if v == "" {
				delete(m, key)
			}
		case nil:
			delete(m, key)
		}
	}
	return m
}

func coalesce(values ...string) string {
	for _, value := range values {
		if value != "" {
			return value
		}
	}
	return ""
}
