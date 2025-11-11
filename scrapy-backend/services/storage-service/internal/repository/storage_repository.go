package repository

import (
	"context"
	"fmt"
	"storage-service/internal/models"
	"storage-service/internal/utils"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const (
	defaultPage      = 1
	defaultPageSize  = 10
	maxPageSize      = 100
	countTimeout     = 10 * time.Second
	aggregateTimeout = 15 * time.Second
)

type StorageRepository struct {
	Collection *mongo.Collection
}

func NewStorageRepository(db *mongo.Database) (*StorageRepository, error) {
	storageCollection := db.Collection("search_results")

	indexModel := mongo.IndexModel{
		Keys: bson.D{
			{Key: "search_id", Value: 1},
			{Key: "page", Value: 1},
		},
		Options: options.Index().SetUnique(true),
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if _, err := storageCollection.Indexes().CreateOne(ctx, indexModel); err != nil {
		return nil, fmt.Errorf("failed to create index: %v", err)
	}

	return &StorageRepository{
		Collection: storageCollection,
	}, nil
}

func (r *StorageRepository) StoreSearchResults(ctx context.Context, result *models.SearchResult) error {
	result.CreatedAt = utils.GetTime()

	filter := bson.M{
		"search_id": result.SearchID,
		"page":      result.Page,
	}

	searchResult := bson.M{
		"$set": bson.M{
			"user_id":    result.UserID,
			"query":      result.Query,
			"results":    result.Results,
			"created_at": result.CreatedAt,
		},
		"$setOnInsert": bson.M{
			"search_id": result.SearchID,
			"page":      result.Page,
		},
	}

	opts := options.Update().SetUpsert(true)

	_, err := r.Collection.UpdateOne(ctx, filter, searchResult, opts)

	if err != nil {
		return fmt.Errorf("failed to store search results: %v", err)
	}

	return nil
}

func (r *StorageRepository) GetSearchResults(ctx context.Context, searchID string) (*models.SearchResults, error) {
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"search_id": searchID}}},
		{{Key: "$project", Value: bson.M{
			"organic":    "$results.organic_results",
			"query":      "$query",
			"user_id":    "$user_id",
			"created_at": "$created_at",
		}}},
		{{Key: "$unwind", Value: bson.M{
			"path": "$organic",
		}}},
		{{
			Key: "$group", Value: bson.M{
				"_id":                 searchID,
				"query":               bson.M{"$first": "$query"},
				"user_id":             bson.M{"$first": "$user_id"},
				"organicResults":      bson.M{"$push": "$organic"},
				"organicResultsCount": bson.M{"$sum": 1},
			},
		}},
		{{
			Key: "$project", Value: bson.M{
				"_id":                 0,
				"searchId":            "$_id",
				"userId":              "$user_id",
				"query":               "$query",
				"organicResults":      "$organicResults",
				"organicResultsCount": "$organicResultsCount",
			},
		}},
	}

	ctxAgg, cancel := context.WithTimeout(ctx, 15*time.Second)
	defer cancel()

	cursor, err := r.Collection.Aggregate(ctxAgg, pipeline)
	if err != nil {
		return nil, fmt.Errorf("failed to aggregate search results: %v", err)
	}
	defer cursor.Close(ctxAgg)

	if !cursor.Next(ctxAgg) {
		empty := &models.SearchResults{
			SearchID:            searchID,
			UserID:              "",
			Query:               "",
			OrganicResults:      []models.OrganicResult{},
			OrganicResultsCount: 0,
		}
		return empty, nil
	}

	var results models.SearchResults
	if err := cursor.Decode(&results); err != nil {
		return nil, fmt.Errorf("failed to decode aggregated results: %v", err)
	}

	return &results, nil
}

func (r *StorageRepository) GetUserSearchResults(ctx context.Context, userID string, page int, pageSize int) (int, []models.UserSearchResults, error) {
	page, pageSize = normalizePagination(page, pageSize)

	totalResults, err := r.getDistinctSearches(ctx, userID)
	if err != nil {
		return 0, nil, fmt.Errorf("count distinct search_ids: %w", err)
	}

	skip := (page - 1) * pageSize
	searchResults, err := r.getGroupedSearches(ctx, userID, skip, pageSize)
	if err != nil {
		return 0, nil, fmt.Errorf("aggregate grouped searches: %w", err)
	}

	return totalResults, searchResults, nil
}

func normalizePagination(page, pageSize int) (int, int) {
	if page < 1 {
		page = defaultPage
	}
	if pageSize < 1 {
		pageSize = defaultPageSize
	}
	if pageSize > maxPageSize {
		pageSize = maxPageSize
	}
	return page, pageSize
}

func (r *StorageRepository) getDistinctSearches(parentCtx context.Context, userID string) (int, error) {
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"user_id": userID}}},
		{{Key: "$group", Value: bson.M{"_id": "$search_id"}}},
		{{Key: "$count", Value: "total"}},
	}

	ctx, cancel := context.WithTimeout(parentCtx, countTimeout)
	defer cancel()

	cursor, err := r.Collection.Aggregate(ctx, pipeline)
	if err != nil {
		return 0, fmt.Errorf("aggregate count pipeline: %v", err)
	}
	defer cursor.Close(ctx)

	var result struct {
		Total int `bson:"total"`
	}
	if cursor.Next(ctx) {
		if err := cursor.Decode(&result); err != nil {
			return 0, fmt.Errorf("decode count result: %v", err)
		}
		return result.Total, nil
	}

	if err := cursor.Err(); err != nil {
		return 0, fmt.Errorf("cursor error while counting groups: %v", err)
	}
	return 0, nil
}

func (r *StorageRepository) getGroupedSearches(parentCtx context.Context, userID string, skip, limit int) ([]models.UserSearchResults, error) {
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"user_id": userID}}},
		{{Key: "$sort", Value: bson.D{{Key: "created_at", Value: -1}}}},
		{{
			Key: "$group", Value: bson.M{
				"_id":         "$search_id",
				"createdAt":   bson.M{"$first": "$created_at"},
				"query":       bson.M{"$first": "$query"},
				"searchCount": bson.M{"$sum": 1},
			},
		}},
		{{Key: "$sort", Value: bson.D{{Key: "createdAt", Value: -1}}}},
		{{Key: "$skip", Value: skip}},
		{{Key: "$limit", Value: limit}},
		{{
			Key: "$project", Value: bson.M{
				"_id":         0,
				"searchId":    "$_id",
				"createdAt":   1,
				"query":       1,
				"searchCount": 1,
			},
		}},
	}

	ctx, cancel := context.WithTimeout(parentCtx, aggregateTimeout)
	defer cancel()

	cursor, err := r.Collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, fmt.Errorf("aggregate data pipeline: %v", err)
	}
	defer cursor.Close(ctx)

	var results []models.UserSearchResults
	if err := cursor.All(ctx, &results); err != nil {
		return nil, fmt.Errorf("decode grouped results: %v", err)
	}

	return results, nil
}
