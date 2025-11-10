package services

import (
	"context"
	"storage-service/internal/models"
	"storage-service/internal/repository"
)

type StorageService struct {
	StorageRepo *repository.StorageRepository
}

func NewStorageService(repo *repository.StorageRepository) *StorageService {
	return &StorageService{StorageRepo: repo}
}

func (s *StorageService) StoreSearchResults(ctx context.Context, req *models.SearchResult) error {
	if err := s.StorageRepo.StoreSearchResults(ctx, req); err != nil {
		return err
	}
	return nil
}

func (s *StorageService) GetSearchResults(ctx context.Context, searchID string) (*models.SearchResults, error) {
	return s.StorageRepo.GetSearchResults(ctx, searchID)
}

func (s *StorageService) GetUserSearchResults(ctx context.Context, userID string, page int, pageSize int) (int, []models.UserSearchResults, error) {
	return s.StorageRepo.GetUserSearchResults(ctx, userID, page, pageSize)
}
