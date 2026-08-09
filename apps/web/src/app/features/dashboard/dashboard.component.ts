import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

export interface ApiHealth {
  status: string;
  version: string;
  database: {
    stats: {
      users: number;
      platforms: number;
      games: number;
    };
  };
}

export interface PlatformItem {
  id: string;
  name: string;
  code: string;
  description?: string;
  iconUrl?: string;
  _count?: {
    games: number;
  };
}

export interface UserGamerStats {
  totalPlaytimeMinutes: number;
  totalSessionsCount: number;
  favoriteGamesCount: number;
  saveStatesCount: number;
  recentSessions: Array<{
    id: string;
    startedAt: string;
    durationSeconds?: number;
    game: {
      id: string;
      title: string;
      coverUrl?: string;
      platform: {
        code: string;
        name: string;
      };
    };
  }>;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-page">
      <!-- Welcome Hero Banner -->
      <section class="welcome-banner glass-panel" *ngIf="authService.currentUser() as user">
        <div class="banner-content">
          <span class="user-role-tag font-pixel" [class.tag-admin]="authService.isAdmin()">
            {{ user.role }} SESSION ACTIVE
          </span>
          <h1 class="welcome-title font-heading">
            BEM-VINDO AO NEXUS ARCADE, <span class="text-cyan-glow">{{ user.username | uppercase }}</span>!
          </h1>
          <p class="welcome-subtitle">
            Sua biblioteca pessoal de emulação retro está pronta. Escolha um jogo ou navegue pelas plataformas.
          </p>
        </div>

        <div class="banner-avatar">
          <img [src]="user.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + user.username" alt="User Avatar" />
        </div>
      </section>

      <!-- Gamer Stats Grid -->
      <section class="stats-grid">
        <div class="stat-card glass-panel">
          <div class="stat-icon">👾</div>
          <div class="stat-info">
            <span class="stat-value font-heading text-cyan-glow">{{ systemStats()?.games ?? 0 }}</span>
            <span class="stat-label">Jogos no Catálogo</span>
          </div>
        </div>

        <div class="stat-card glass-panel">
          <div class="stat-icon">🕹️</div>
          <div class="stat-info">
            <span class="stat-value font-heading text-magenta-glow">{{ platforms().length }}</span>
            <span class="stat-label">Consoles Suportados</span>
          </div>
        </div>

        <div class="stat-card glass-panel">
          <div class="stat-icon">⏱️</div>
          <div class="stat-info">
            <span class="stat-value font-heading text-cyan-glow">{{ userStats()?.totalPlaytimeMinutes ?? 0 }}m</span>
            <span class="stat-label">Tempo de Jogo Acumulado</span>
          </div>
        </div>

        <div class="stat-card glass-panel">
          <div class="stat-icon">💾</div>
          <div class="stat-info">
            <span class="stat-value font-heading text-magenta-glow">{{ userStats()?.saveStatesCount ?? 0 }}</span>
            <span class="stat-label">Saves na Nuvem</span>
          </div>
        </div>
      </section>

      <!-- Dynamic Platforms List Section -->
      <section class="quick-section glass-panel">
        <div class="section-header">
          <h2 class="section-title font-heading text-cyan-glow">🎮 Consoles & Plataformas Disponíveis</h2>
          <button (click)="navigateToPlatforms()" class="btn-link">Ver todas →</button>
        </div>

        <div class="platforms-list" *ngIf="platforms().length > 0; else loadingPlats">
          <div
            class="platform-chip glass-panel"
            *ngFor="let plat of platforms()"
            (click)="filterByPlatform(plat.code)"
          >
            <span class="chip-icon">{{ getPlatformIcon(plat.code) }}</span>
            <div class="chip-info">
              <span class="chip-name font-heading">{{ plat.name }}</span>
              <span class="chip-code font-pixel">{{ plat.code | uppercase }}</span>
            </div>
            <span class="chip-count">{{ plat._count?.games ?? 0 }} Jogos</span>
          </div>
        </div>

        <ng-template #loadingPlats>
          <p class="text-muted">Carregando plataformas ativas no banco de dados...</p>
        </ng-template>
      </section>

      <!-- Recent Games Sessions Section -->
      <section class="quick-section glass-panel" *ngIf="userStats()?.recentSessions && userStats()!.recentSessions.length > 0">
        <h2 class="section-title font-heading text-magenta-glow">🕒 Histórico Recente de Partidas</h2>
        <div class="recent-sessions-list">
          <div class="session-card glass-panel" *ngFor="let s of userStats()?.recentSessions">
            <img [src]="s.game.coverUrl || 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=100&auto=format&fit=crop'" alt="Capa" class="session-cover" />
            <div class="session-info">
              <span class="session-game font-heading">{{ s.game.title }}</span>
              <span class="session-plat font-pixel">{{ s.game.platform.code | uppercase }}</span>
              <span class="session-date">Jogado em: {{ formatDate(s.startedAt) }}</span>
            </div>
            <button (click)="playGame(s.game.id)" class="btn-primary btn-sm">
              🎮 Jogar
            </button>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    .welcome-banner {
      padding: 36px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }

    .banner-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 650px;
    }

    .user-role-tag {
      font-size: 10px;
      background: rgba(0, 240, 255, 0.15);
      border: 1px solid rgba(0, 240, 255, 0.4);
      color: var(--accent-cyan);
      padding: 4px 10px;
      border-radius: 4px;
      width: fit-content;
    }

    .tag-admin {
      background: rgba(255, 0, 127, 0.15);
      border-color: rgba(255, 0, 127, 0.4);
      color: var(--accent-magenta);
    }

    .welcome-title {
      font-size: 28px;
      font-weight: 900;
      letter-spacing: 1px;
    }

    .welcome-subtitle {
      font-size: 15px;
      color: var(--text-muted);
      line-height: 1.5;
    }

    .banner-avatar img {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      border: 3px solid var(--accent-cyan);
      box-shadow: var(--glow-cyan);
      background: var(--bg-dark);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
    }

    .stat-card {
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .stat-icon {
      font-size: 38px;
      background: rgba(15, 23, 42, 0.6);
      padding: 12px;
      border-radius: 12px;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 900;
    }

    .stat-label {
      font-size: 12px;
      color: var(--text-muted);
    }

    .quick-section {
      padding: 28px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .section-title {
      font-size: 18px;
    }

    .btn-link {
      background: transparent;
      border: none;
      color: var(--accent-cyan);
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
    }

    .platforms-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 16px;
    }

    .platform-chip {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .platform-chip:hover {
      border-color: var(--accent-cyan);
      box-shadow: var(--glow-cyan);
      transform: translateY(-2px);
    }

    .chip-icon {
      font-size: 32px;
    }

    .chip-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
    }

    .chip-name {
      font-size: 14px;
      font-weight: 700;
    }

    .chip-code {
      font-size: 9px;
      color: var(--accent-cyan);
    }

    .chip-count {
      font-size: 11px;
      background: rgba(0, 240, 255, 0.15);
      color: var(--accent-cyan);
      padding: 4px 8px;
      border-radius: 12px;
      font-weight: 600;
    }

    .recent-sessions-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .session-card {
      padding: 14px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .session-cover {
      width: 48px;
      height: 48px;
      border-radius: 6px;
      object-fit: cover;
      border: 1px solid var(--border-neon);
    }

    .session-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }

    .session-game {
      font-size: 15px;
      color: var(--text-bright);
    }

    .session-plat {
      font-size: 9px;
      color: var(--accent-cyan);
    }

    .session-date {
      font-size: 11px;
      color: var(--text-muted);
    }

    .btn-sm {
      padding: 6px 14px;
      font-size: 12px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  protected authService = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);

  protected systemStats = signal<{ users: number; platforms: number; games: number } | null>(null);
  protected platforms = signal<PlatformItem[]>([]);
  protected userStats = signal<UserGamerStats | null>(null);

  ngOnInit() {
    this.loadSystemStats();
    this.loadPlatforms();
    this.loadGamerStats();
  }

  loadSystemStats() {
    this.http.get<ApiHealth>('http://localhost:3000/health').subscribe({
      next: (res) => {
        if (res?.database?.stats) {
          this.systemStats.set(res.database.stats);
        }
      },
    });
  }

  loadPlatforms() {
    this.http.get<PlatformItem[]>('http://localhost:3000/platforms').subscribe({
      next: (res) => this.platforms.set(res),
    });
  }

  loadGamerStats() {
    this.http.get<UserGamerStats>('http://localhost:3000/stats/me').subscribe({
      next: (res) => this.userStats.set(res),
      error: () => {},
    });
  }

  getPlatformIcon(code: string): string {
    const icons: Record<string, string> = {
      snes: '📺',
      gba: '🎮',
      nes: '📼',
      megadrive: '⚡',
      gb: '🕹️',
      gbc: '🌈',
    };
    return icons[code.toLowerCase()] || '👾';
  }

  filterByPlatform(code: string) {
    this.router.navigate(['/library'], { queryParams: { platform: code } });
  }

  navigateToPlatforms() {
    this.router.navigate(['/platforms']);
  }

  playGame(gameId: string) {
    this.router.navigate(['/player', gameId]);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
