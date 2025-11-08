package handlers

import (
	"context"
	"net/http"
	"search-service/internal/models"
	"search-service/internal/services"

	"github.com/gofiber/fiber/v2"
)

type SearchHandler struct {
	Service *services.SearchService
}

func NewSearchHandler(s *services.SearchService) *SearchHandler {
	return &SearchHandler{Service: s}
}

func (h *SearchHandler) Search(c *fiber.Ctx) error {
	var request models.SearchRequest
	if err := c.BodyParser(&request); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid request payload"})
	}

	if request.Page <= 0 {
		request.Page = 1
	}

	searchResp, searchID, err := h.Service.Search(context.Background(), request.UserID, request.Query, request.SearchID, request.Page)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"results":   searchResp,
		"search_id": searchID,
	})
}
