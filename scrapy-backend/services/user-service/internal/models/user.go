package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID                      primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Uuid                    string             `bson:"uuid" json:"uuid"`
	Name                    string             `bson:"name" json:"name"`
	Email                   string             `bson:"email" json:"email"`
	SerpAPIKey              string             `bson:"serpapi_key" json:"serpapi_key"`
	AccountID               string             `bson:"account_id,omitempty" json:"account_id,omitempty"`
	AccountStatus           string             `bson:"account_status,omitempty" json:"account_status,omitempty"`
	PlanName                string             `bson:"plan_name,omitempty" json:"plan_name,omitempty"`
	SearchesPerMonth        int                `bson:"searches_per_month,omitempty" json:"searches_per_month,omitempty"`
	TotalSearchesLeft       int                `bson:"total_searches_left,omitempty" json:"total_searches_left,omitempty"`
	ThisMonthUsage          int                `bson:"this_month_usage,omitempty" json:"this_month_usage,omitempty"`
	ThisHourSearches        int                `bson:"this_hour_searches,omitempty" json:"this_hour_searches,omitempty"`
	LastHourSearches        int                `bson:"last_hour_searches,omitempty" json:"last_hour_searches,omitempty"`
	AccountRateLimitPerHour int                `bson:"account_rate_limit_per_hour,omitempty" json:"account_rate_limit_per_hour,omitempty"`
	RemainingCredits        int                `bson:"remaining_credits" json:"remaining_credits"`
	CreatedAt               time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt               time.Time          `bson:"updated_at" json:"updated_at"`
}

type Users struct {
	Uuid              string    `bson:"uuid" json:"uuid"`
	Name              string    `bson:"name" json:"name"`
	Email             string    `bson:"email" json:"email"`
	PlanName          string    `bson:"plan_name,omitempty" json:"planName,omitempty"`
	AccountStatus     string    `bson:"account_status,omitempty" json:"accountStatus,omitempty"`
	TotalSearchesLeft int       `bson:"total_searches_left,omitempty" json:"totalSearchesLeft,omitempty"`
	CreatedAt         time.Time `bson:"created_at" json:"createdAt"`
}

type CreateUserRequest struct {
	Name       string `json:"name"`
	Email      string `json:"email"`
	SerpAPIKey string `json:"serpapi_key"`
}

type SerpAPIAccountDetails struct {
	AccountID               string `json:"account_id"`
	AccountStatus           string `json:"account_status"`
	PlanName                string `json:"plan_name"`
	SearchesPerMonth        int    `json:"searches_per_month"`
	TotalSearchesLeft       int    `json:"total_searches_left"`
	ThisMonthUsage          int    `json:"this_month_usage"`
	ThisHourSearches        int    `json:"this_hour_searches"`
	LastHourSearches        int    `json:"last_hour_searches"`
	AccountRateLimitPerHour int    `json:"account_rate_limit_per_hour"`
}
