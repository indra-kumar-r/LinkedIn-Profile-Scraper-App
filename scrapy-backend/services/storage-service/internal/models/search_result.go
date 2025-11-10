package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type SearchResult struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	SearchID  string             `bson:"search_id" json:"search_id"`
	UserID    string             `bson:"user_id" json:"user_id"`
	Query     string             `bson:"query" json:"query"`
	Page      int                `bson:"page" json:"page"`
	Results   Results            `bson:"results" json:"results"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
}

type Results struct {
	SearchMetadata SearchMetadata  `bson:"search_metadata" json:"search_metadata"`
	OrganicResults []OrganicResult `bson:"organic_results" json:"organic_results"`
}

type SearchMetadata struct {
	ID             string  `bson:"id" json:"id"`
	Status         string  `bson:"status" json:"status"`
	TotalTimeTaken float64 `bson:"total_time_taken" json:"total_time_taken"`
}

type OrganicResult struct {
	Title   string `bson:"title" json:"title"`
	Link    string `bson:"link" json:"link"`
	Snippet string `bson:"snippet" json:"snippet"`
}

type UserSearchResults struct {
	SearchID       string         `bson:"searchId" json:"searchId"`
	CreatedAt      time.Time      `bson:"createdAt" json:"createdAt"`
	Query          string         `bson:"query" json:"query"`
	SearchMetadata SearchMetadata `bson:"searchMetadata" json:"searchMetadata"`
	SearchCount    int            `bson:"searchCount" json:"searchCount"`
}

type SearchResults struct {
	SearchID            string          `bson:"searchId" json:"search_id"`
	UserID              string          `bson:"userId" json:"user_id"`
	Query               string          `bson:"query" json:"query"`
	OrganicResults      []OrganicResult `bson:"organicResults" json:"organic_results"`
	OrganicResultsCount int             `bson:"organicResultsCount" json:"organic_results_count"`
}
