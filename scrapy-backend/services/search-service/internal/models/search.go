package models

type SearchRequest struct {
	UserID   string `json:"user_id"`
	Query    string `json:"query"`
	Page     int    `json:"page,omitempty"`
	SearchID string `json:"search_id,omitempty"`
}

type User struct {
	UUID       string
	SerpAPIKey string
}

type UserResponse struct {
	Message string `json:"message,omitempty"`
	User    User   `json:"user"`
}

type SearchMetadata struct {
	ID             string  `json:"id"`
	Status         string  `json:"status"`
	TotalTimeTaken float64 `json:"total_time_taken"`
}

type OrganicResult struct {
	Title   string `json:"title"`
	Link    string `json:"link"`
	Snippet string `json:"snippet"`
}

type SearchResponse struct {
	SearchMetadata SearchMetadata  `json:"search_metadata"`
	OrganicResults []OrganicResult `json:"organic_results"`
}

type SearchResult struct {
	SearchID string         `bson:"search_id" json:"search_id"`
	UserID   string         `bson:"user_id" json:"user_id"`
	Query    string         `bson:"query" json:"query"`
	Page     int            `bson:"page" json:"page"`
	Results  SearchResponse `bson:"results" json:"results"`
}
