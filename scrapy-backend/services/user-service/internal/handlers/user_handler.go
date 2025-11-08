package handlers

import (
	"context"
	"net/http"

	"user-service/internal/models"
	"user-service/internal/services"

	"github.com/gofiber/fiber/v2"
)

type UserHandler struct {
	UserService *services.UserService
}

func NewUserHandler(userService *services.UserService) *UserHandler {
	return &UserHandler{UserService: userService}
}

func (h *UserHandler) CreateUser(c *fiber.Ctx) error {
	var req models.CreateUserRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid input"})
	}

	user, err := h.UserService.CreateUser(context.Background(), &req)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"message": "User registered successfully",
		"user":    user,
	})
}

func (h *UserHandler) GetUsers(c *fiber.Ctx) error {
	users, err := h.UserService.GetUsers(context.Background())
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"message": "Users fetched successfully",
		"users":   users,
	})
}

func (h *UserHandler) GetUser(c *fiber.Ctx) error {
	uuid := c.Params("uuid")
	user, err := h.UserService.GetUser(context.Background(), uuid)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": "user not found"})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"message": "User fetched successfully",
		"user":    user,
	})
}

func (h *UserHandler) UpdateUser(c *fiber.Ctx) error {
	uuid := c.Params("uuid")

	var updateData models.User
	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid input"})
	}

	err := h.UserService.UpdateUser(c.Context(), uuid, &updateData)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"message": "User updated successfully",
	})
}

func (h *UserHandler) DeleteUser(c *fiber.Ctx) error {
	uuid := c.Params("uuid")

	err := h.UserService.DeleteUser(context.Background(), uuid)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"message": "User deleted successfully",
	})
}
