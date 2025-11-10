package repository

import (
	"context"
	"time"

	"user-service/internal/models"

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
	user.CreatedAt = getTime()
	user.UpdatedAt = user.CreatedAt

	_, err := r.Collection.InsertOne(ctx, user)
	return err
}

func (r *UserRepository) GetUsers(ctx context.Context) ([]*models.User, error) {
	options := options.Find().SetSort(bson.M{"created_at": -1})
	cursor, err := r.Collection.Find(ctx, bson.M{}, options)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var users []*models.User
	for cursor.Next(ctx) {
		var user models.User
		if err := cursor.Decode(&user); err != nil {
			return nil, err
		}
		users = append(users, &user)
	}
	return users, cursor.Err()
}

func (r *UserRepository) GetUser(ctx context.Context, uuid string) (*models.User, error) {
	var user models.User
	err := r.Collection.FindOne(ctx, bson.M{"uuid": uuid}).Decode(&user)
	return &user, err
}

func (r *UserRepository) UpdateUser(ctx context.Context, uuid string, user bson.M) error {
	user["updated_at"] = getTime()
	_, err := r.Collection.UpdateOne(ctx, bson.M{"uuid": uuid}, bson.M{"$set": user})
	return err
}

func (r *UserRepository) DeleteUser(ctx context.Context, uuid string) error {
	_, err := r.Collection.DeleteOne(ctx, bson.M{"uuid": uuid})
	return err
}

func getTime() time.Time {
	loc, err := time.LoadLocation("Asia/Kolkata")
	if err != nil {
		loc = time.FixedZone("IST", 5*60*60+30*60)
	}
	return time.Now().In(loc)
}
