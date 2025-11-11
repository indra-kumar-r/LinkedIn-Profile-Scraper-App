export interface OrganicResult {
  title: string;
  link: string;
  snippet: string;
}

export interface SearchResults {
  searchId: string;
  userId: string;
  query: string;
  organicResults: OrganicResult[];
  organicResultsCount: number;
}

export interface SearchResultsResponse {
  message: string;
  results: SearchResults;
}

export interface GroupedSearchResults {
  searchId: string;
  createdAt: string;
  query: string;
  searchCount: number;
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalPages: number;
  totalResults: number;
}

export interface UserSearchResultsResponse {
  message: string;
  pagination: Pagination;
  results: GroupedSearchResults[];
}

export interface UserSearchResultsParams {
  userId: string;
  page: number;
  pageSize: number;
}
