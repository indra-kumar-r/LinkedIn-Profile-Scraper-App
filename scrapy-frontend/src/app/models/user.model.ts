export interface Users {
  message: string;
  users: User[];
}

export interface UserResponse {
  message: string;
  user: User;
}

export interface User {
  id: string;
  uuid: string;
  name: string;
  email: string;
  planName: string;
  accountId: string;
  accountStatus: string;
  accountRateLimitPerHour: number;
  remainingCredits: number;
  searchesPerMonth: number;
  totalSearchesLeft: number;
  thisMonthUsage: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserCreationParams {
  name: string;
  email: User;
  serpapi_key: string;
}
