export interface Users {
  message: string;
  users: User[];
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
  createdAt: string;
  updatedAt: string;
}
