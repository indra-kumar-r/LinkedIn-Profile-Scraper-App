package handlers

import (
	"context"
	"net/http"

	"storage-service/internal/models"
	"storage-service/internal/services"
	"storage-service/internal/utils"

	"github.com/gofiber/fiber/v2"
)

type StorageHandler struct {
	StorageService *services.StorageService
}

func NewStorageHandler(storageService *services.StorageService) *StorageHandler {
	return &StorageHandler{StorageService: storageService}
}

func (h *StorageHandler) StoreSearchResults(c *fiber.Ctx) error {
	var req models.SearchResult
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid request payload"})
	}

	err := h.StorageService.StoreSearchResults(context.Background(), &req)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"message": "Results stored successfully",
	})
}

func (h *StorageHandler) GetSearchResult(c *fiber.Ctx) error {
	searchID := c.Params("search_id")
	if searchID == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "missing search_id"})
	}

	results, err := h.StorageService.GetSearchResult(context.Background(), searchID)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"message": "Results fetched successfully",
		"results": results,
	})
}

func (h *StorageHandler) GetUserSearchResults(c *fiber.Ctx) error {
	userID := c.Params("user_id")
	if userID == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "missing user_id"})
	}

	pageStr := c.Query("page", "1")
	pageSizeStr := c.Query("page_size", "10")
	page, pageSize := utils.ParsePagination(pageStr, pageSizeStr)

	totalResults, searchResults, err := h.StorageService.GetUserSearchResults(context.Background(), userID, page, pageSize)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	totalPages := 0
	if totalResults > 0 {
		totalPages = (totalResults + pageSize - 1) / pageSize
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"message": "Results fetched successfully",
		"pagination": fiber.Map{
			"page":         page,
			"pageSize":     pageSize,
			"totalPages":   totalPages,
			"totalResults": totalResults,
		},
		"results": searchResults,
	})
}
