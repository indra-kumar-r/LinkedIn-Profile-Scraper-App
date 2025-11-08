package config

import (
	"log"

	"github.com/spf13/viper"
)

type Config struct {
	Port              string
	UserServiceURL    string
	StorageServiceURL string
}

func LoadConfig() *Config {
	viper.SetConfigFile(".env")
	err := viper.ReadInConfig()
	if err != nil {
		log.Fatal("Error reading .env file:", err)
	}

	return &Config{
		Port:              viper.GetString("PORT"),
		UserServiceURL:    viper.GetString("USER_SERVICE_URL"),
		StorageServiceURL: viper.GetString("STORAGE_SERVICE_URL"),
	}

}
