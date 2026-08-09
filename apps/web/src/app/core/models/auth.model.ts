export enum UserRole {
  ADMIN = 'ADMIN',
  GAMER = 'GAMER',
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  avatarUrl?: string;
  isBlocked?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
