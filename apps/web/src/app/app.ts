import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

export interface DatabaseStats {
  users: number;
  platforms: number;
  games: number;
}

export interface ApiHealth {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  database: {
    provider: string;
    status: string;
    stats: DatabaseStats;
  };
  architecture: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private http = inject(HttpClient);

  protected readonly title = signal('NEXUS ARCADE');
  protected readonly apiHealth = signal<ApiHealth | null>(null);
  protected readonly apiError = signal<string | null>(null);
  protected readonly isCheckingApi = signal<boolean>(true);

  ngOnInit() {
    this.checkBackendHealth();
  }

  checkBackendHealth() {
    this.isCheckingApi.set(true);
    this.apiError.set(null);

    this.http.get<ApiHealth>('http://localhost:3000/health').subscribe({
      next: (data) => {
        this.apiHealth.set(data);
        this.isCheckingApi.set(false);
      },
      error: (err) => {
        this.apiError.set('Não foi possível conectar à API NestJS (http://localhost:3000)');
        this.isCheckingApi.set(false);
      },
    });
  }
}
