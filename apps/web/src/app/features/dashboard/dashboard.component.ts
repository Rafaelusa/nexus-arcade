import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
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

      <!-- Stats Grid -->
      <section class="stats-grid">
        <div class="stat-card glass-panel">
          <div class="stat-icon">👾</div>
          <div class="stat-info">
            <span class="stat-value font-heading text-cyan-glow">{{ stats()?.games ?? 0 }}</span>
            <span class="stat-label">Jogos no Catálogo</span>
          </div>
        </div>

        <div class="stat-card glass-panel">
          <div class="stat-icon">🕹️</div>
          <div class="stat-info">
            <span class="stat-value font-heading text-magenta-glow">{{ stats()?.platforms ?? 0 }}</span>
            <span class="stat-label">Plataforma Ativa (SNES)</span>
          </div>
        </div>

        <div class="stat-card glass-panel">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <span class="stat-value font-heading text-cyan-glow">{{ stats()?.users ?? 0 }}</span>
            <span class="stat-label">Usuários na Plataforma</span>
          </div>
        </div>
      </section>

      <!-- Platform Quick Filter Section -->
      <section class="quick-section glass-panel">
        <h2 class="section-title font-heading text-cyan-glow">🎮 Consoles Disponíveis</h2>
        <div class="platforms-list">
          <div class="platform-chip glass-panel active">
            <span class="chip-icon">📺</span>
            <span class="chip-name font-heading">Super Nintendo (SNES)</span>
            <span class="chip-count">1 Jogo</span>
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
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
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
      font-size: 32px;
      font-weight: 900;
    }

    .stat-label {
      font-size: 13px;
      color: var(--text-muted);
    }

    .quick-section {
      padding: 28px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .section-title {
      font-size: 18px;
    }

    .platforms-list {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .platform-chip {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 20px;
      cursor: pointer;
    }

    .platform-chip.active {
      border-color: var(--accent-cyan);
      box-shadow: var(--glow-cyan);
    }

    .chip-name {
      font-size: 14px;
      font-weight: 700;
    }

    .chip-count {
      font-size: 11px;
      background: rgba(0, 240, 255, 0.2);
      color: var(--accent-cyan);
      padding: 2px 8px;
      border-radius: 12px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  protected authService = inject(AuthService);
  private http = inject(HttpClient);

  protected stats = signal<{ users: number; platforms: number; games: number } | null>(null);

  ngOnInit() {
    this.http.get<ApiHealth>('http://localhost:3000/health').subscribe({
      next: (res) => {
        if (res?.database?.stats) {
          this.stats.set(res.database.stats);
        }
      },
    });
  }
}
