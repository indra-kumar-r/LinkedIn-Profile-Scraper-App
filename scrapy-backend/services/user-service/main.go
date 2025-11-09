package main

import (
	"log"
	"user-service/config"
	"user-service/internal/handlers"
	"user-service/internal/middleware"
	"user-service/internal/repository"
	"user-service/internal/services"

	"github.com/gofiber/fiber/v2"
)

func main() {
	cfg := config.LoadConfig()
	client := config.ConnectDB(cfg.MongoURI)
	db := client.Database(cfg.DBName)

	app := fiber.New()
	app.Use(middleware.CorsMiddleware())
	app.Use(middleware.CamelCaseMiddleware)

	userRepo := repository.NewUserRepository(db)
	userService := services.NewUserService(userRepo)
	userHandler := handlers.NewUserHandler(userService)

	app.Post("/api/v1/users", userHandler.CreateUser)
	app.Get("/api/v1/users", userHandler.GetUsers)
	app.Get("/api/v1/users/:uuid", userHandler.GetUser)
	app.Put("/api/v1/users/:uuid", userHandler.UpdateUser)
	app.Delete("/api/v1/users/:uuid", userHandler.DeleteUser)

	if err := app.Listen(":" + cfg.Port); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
