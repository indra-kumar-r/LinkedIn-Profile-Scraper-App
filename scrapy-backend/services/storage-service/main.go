package main

import (
	"log"
	"storage-service/config"
	"storage-service/internal/handlers"
	"storage-service/internal/middleware"
	"storage-service/internal/repository"
	"storage-service/internal/services"

	"github.com/gofiber/fiber/v2"
)

func main() {
	cfg := config.LoadConfig()
	client := config.ConnectDB(cfg.MongoURI)
	db := client.Database(cfg.DBName)

	app := fiber.New()
	app.Use(middleware.CamelCaseMiddleware)

	storageRepo, err := repository.NewStorageRepository(db)
	if err != nil {
		log.Fatalf("Failed to init repository: %v", err)
	}

	storageService := services.NewStorageService(storageRepo)
	storageHandler := handlers.NewStorageHandler(storageService)

	app.Post("/api/v1/store", storageHandler.StoreSearchResults)
	app.Get("/api/v1/search/results/:search_id", storageHandler.GetSearchResult)
	app.Get("/api/v1/user/results/:user_id", storageHandler.GetUserSearchResults)

	if err := app.Listen(":" + cfg.Port); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
