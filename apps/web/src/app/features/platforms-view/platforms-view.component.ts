import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

export interface PlatformDetail {
  id: string;
  name: string;
  code: string;
  description?: string;
  iconUrl?: string;
  isActive: boolean;
  _count: {
    games: number;
  };
}

@Component({
  selector: 'app-platforms-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="platforms-page">
      <header class="page-header glass-panel">
        <h1 class="header-title font-heading text-cyan-glow">🕹️ PLATAFORMAS & CONSOLES</h1>
        <p class="header-subtitle">Explore a biblioteca de jogos filtrada pelas plataformas clássicas suportadas pelo Nexus Arcade</p>
      </header>

      <div class="platforms-grid">
        <div class="platform-card glass-panel" *ngFor="let plat of platforms()">
          <div class="card-header">
            <span class="plat-code font-pixel">{{ plat.code | uppercase }}</span>
            <span class="game-count-badge">{{ plat._count.games }} Jogo(s)</span>
          </div>

          <div class="card-body">
            <h3 class="plat-name font-heading">{{ plat.name }}</h3>
            <p class="plat-desc">{{ plat.description || 'Plataforma de emulação de jogos retro clássicos.' }}</p>

            <button (click)="filterByPlatform(plat.code)" class="btn-primary btn-browse">
              <span>🔍 Ver Jogos de {{ plat.code | uppercase }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .platforms-page {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .page-header {
      padding: 28px 32px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .header-title {
      font-size: 24px;
      font-weight: 900;
    }

    .header-subtitle {
      font-size: 14px;
      color: var(--text-muted);
    }

    .platforms-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }

    .platform-card {
      padding: 28px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .plat-code {
      font-size: 12px;
      background: rgba(0, 240, 255, 0.15);
      border: 1px solid var(--border-neon);
      color: var(--accent-cyan);
      padding: 4px 10px;
      border-radius: 4px;
    }

    .game-count-badge {
      font-size: 12px;
      color: var(--text-muted);
    }

    .card-body {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .plat-name {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-bright);
    }

    .plat-desc {
      font-size: 13px;
      color: var(--text-muted);
      line-height: 1.5;
    }

    .btn-browse {
      margin-top: 8px;
      justify-content: center;
    }
  `]
})
export class PlatformsViewComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  protected platforms = signal<PlatformDetail[]>([]);

  ngOnInit() {
    this.http.get<PlatformDetail[]>('http://localhost:3000/platforms').subscribe({
      next: (res) => this.platforms.set(res),
    });
  }

  filterByPlatform(code: string) {
    this.router.navigate(['/library'], { queryParams: { platform: code } });
  }
}
