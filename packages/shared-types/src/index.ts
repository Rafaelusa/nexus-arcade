export enum UserRole {
  ADMIN = 'ADMIN',
  GAMER = 'GAMER',
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Platform {
  id: string;
  name: string;
  code: string; // e.g. 'snes', 'nes', 'gba'
  description?: string;
  iconUrl?: string;
  isActive: boolean;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  platformId: string;
  platformName?: string;
  coverUrl?: string;
  romStorageKey?: string;
  romSize?: number;
  romHash?: string;
  releaseYear?: number;
  developer?: string;
  publisher?: string;
  isFavorite?: boolean;
  createdAt: string;
}

export interface ApiStatusResponse {
  status: string;
  service: string;
  timestamp: string;
  version: string;
  database: string;
}
