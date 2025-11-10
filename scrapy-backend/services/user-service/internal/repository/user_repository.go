package repository

import (
	"context"
	"fmt"

	"user-service/internal/models"
	"user-service/internal/utils"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type UserRepository struct {
	Collection *mongo.Collection
	Client     *mongo.Client
}

func NewUserRepository(db *mongo.Database) *UserRepository {
	userCollection := db.Collection("users")

	index := mongo.IndexModel{
		Keys:    bson.M{"uuid": 1},
		Options: options.Index().SetUnique(true),
	}
	_, err := userCollection.Indexes().CreateOne(context.Background(), index)
	if err != nil {
		panic("failed to create uuid index: " + err.Error())
	}

	return &UserRepository{
		Collection: userCollection,
		Client:     db.Client(),
	}
}

func (r *UserRepository) CreateUser(ctx context.Context, user *models.User) error {
	user.Uuid = uuid.New().String()
	user.CreatedAt = utils.GetTime()
	user.UpdatedAt = user.CreatedAt

	_, err := r.Collection.InsertOne(ctx, user)
	return err
}

func (r *UserRepository) GetUsers(ctx context.Context) ([]*models.Users, error) {
	projection := bson.M{
		"uuid":                1,
		"name":                1,
		"email":               1,
		"plan_name":           1,
		"account_status":      1,
		"total_searches_left": 1,
		"created_at":          1,
	}

	findOptions := options.Find().
		SetSort(bson.M{"created_at": -1}).
		SetProjection(projection)

	cursor, err := r.Collection.Find(ctx, bson.M{}, findOptions)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var users []*models.Users
	for cursor.Next(ctx) {
		var u models.Users
		if err := cursor.Decode(&u); err != nil {
			return nil, err
		}
		users = append(users, &u)
	}
	return users, cursor.Err()
}

func (r *UserRepository) GetUser(ctx context.Context, uuid string) (*models.User, error) {
	var user models.User
	err := r.Collection.FindOne(ctx, bson.M{"uuid": uuid}).Decode(&user)
	return &user, err
}

func (r *UserRepository) UpdateUser(ctx context.Context, uuid string, user bson.M) (*models.User, error) {
	user["updated_at"] = utils.GetTime()

	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	filter := bson.M{"uuid": uuid}
	update := bson.M{"$set": user}

	var updated models.User
	err := r.Collection.FindOneAndUpdate(ctx, filter, update, opts).Decode(&updated)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to update user: %v", err)
	}

	return &updated, nil
}

func (r *UserRepository) DeleteUser(ctx context.Context, uuid string) error {
	_, err := r.Collection.DeleteOne(ctx, bson.M{"uuid": uuid})
	return err
}
