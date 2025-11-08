package main

import (
	"log"
	"search-service/config"
	"search-service/internal/handlers"
	"search-service/internal/middleware"
	"search-service/internal/serpapi"
	"search-service/internal/services"

	"github.com/gofiber/fiber/v2"
)

func main() {
	cfg := config.LoadConfig()

	app := fiber.New()
	app.Use(middleware.CamelCaseMiddleware)

	serpClient := serpapi.NewSerpClient()
	searchService := services.NewSearchService(serpClient, cfg.UserServiceURL, cfg.StorageServiceURL)
	searchHandler := handlers.NewSearchHandler(searchService)

	app.Post("/api/v1/search", searchHandler.Search)

	if err := app.Listen(":" + cfg.Port); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
