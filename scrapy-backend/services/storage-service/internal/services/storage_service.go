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

func (s *StorageService) GetSearchResult(ctx context.Context, searchID string) ([]models.SearchResult, error) {
	return s.StorageRepo.GetSearchResult(ctx, searchID)
}

func (s *StorageService) GetUserSearchResults(ctx context.Context, userID string) ([]models.SearchResult, error) {
	return s.StorageRepo.GetUserSearchResults(ctx, userID)
}
