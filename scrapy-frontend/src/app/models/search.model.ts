export interface SearchRequest {
  user_id: string;
  search_id?: string;
  query: string;
  page: number;
}

export interface SearchResponse {
  results: SearchOrganicResults;
  searchId: string;
}

export interface SearchOrganicResults {
  organicResults: OrganicResult[];
  searchMetadata: SearchMetadata;
}

export interface OrganicResult {
  link: string;
  snippet: string;
  title: string;
}

export interface SearchMetadata {
  id: string;
  status: string;
  totalTimeTaken: number;
}
