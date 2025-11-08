package repository

import (
	"context"
	"fmt"
	"storage-service/internal/models"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
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
	result.CreatedAt = getTime()

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

func (r *StorageRepository) GetSearchResult(ctx context.Context, searchID string) ([]models.SearchResult, error) {
	filter := bson.M{"search_id": searchID}
	cursor, err := r.Collection.Find(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch results: %v", err)
	}
	defer cursor.Close(ctx)

	var results []models.SearchResult
	if err := cursor.All(ctx, &results); err != nil {
		return nil, fmt.Errorf("failed to decode results: %v", err)
	}

	return results, nil
}

func (r *StorageRepository) GetUserSearchResults(ctx context.Context, userID string) ([]models.SearchResult, error) {
	filter := bson.M{"user_id": userID}
	cursor, err := r.Collection.Find(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch user results: %v", err)
	}
	defer cursor.Close(ctx)

	var results []models.SearchResult
	if err := cursor.All(ctx, &results); err != nil {
		return nil, fmt.Errorf("failed to decode user results: %v", err)
	}

	return results, nil
}

func getTime() time.Time {
	loc, err := time.LoadLocation("Asia/Kolkata")
	if err != nil {
		loc = time.FixedZone("IST", 5*60*60+30*60)
	}
	return time.Now().In(loc)
}
