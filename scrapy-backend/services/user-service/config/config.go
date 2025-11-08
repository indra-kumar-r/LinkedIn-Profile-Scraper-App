package config

import (
	"context"
	"log"
	"time"

	"github.com/spf13/viper"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Config struct {
	DBName   string
	MongoURI string
	Port     string
}

func LoadConfig() *Config {
	viper.SetConfigFile(".env")
	err := viper.ReadInConfig()
	if err != nil {
		log.Fatal("Error reading .env file:", err)
	}

	return &Config{
		MongoURI: viper.GetString("MONGO_URI"),
		DBName:   viper.GetString("DB_NAME"),
		Port:     viper.GetString("PORT"),
	}
}

func ConnectDB(uri string) *mongo.Client {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		log.Fatal("Error connecting to MongoDB:", err)
	}

	if err := client.Ping(ctx, nil); err != nil {
		log.Fatal("Could not ping MongoDB:", err)
	}

	return client
}
