import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { getApiUrl } from '../../core/config/api.config';

export interface PlatformDetail {
  id: string;
  name: string;
  code: string;
  description?: string;
  iconUrl?: string;
  isActive: boolean;
  _count?: {
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
        <p class="header-subtitle">
          Explore a biblioteca de jogos filtrada pelas plataformas clássicas e emuladores WebAssembly suportados
        </p>
      </header>

      <div class="platforms-grid">
        <div class="platform-card glass-panel" *ngFor="let plat of platforms()">
          <div class="card-header">
            <span class="plat-code font-pixel">{{ plat.code | uppercase }}</span>
            <span class="game-count-badge">{{ plat._count?.games ?? 0 }} Jogo(s)</span>
          </div>

          <div class="card-body">
            <div class="title-row">
              <span class="plat-icon">{{ getPlatformIcon(plat.code) }}</span>
              <h3 class="plat-name font-heading">{{ plat.name }}</h3>
            </div>

            <p class="plat-desc">{{ plat.description || 'Plataforma de emulação de jogos retro clássicos.' }}</p>

            <div class="tech-info font-pixel">
              <span class="core-label">Core WebAssembly:</span>
              <span class="core-name">{{ getWasmCoreName(plat.code) }}</span>
            </div>

            <button (click)="filterByPlatform(plat.code)" class="btn-primary btn-browse">
              <span>🔍 Explorar Jogos de {{ plat.code | uppercase }}</span>
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
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }

    .platform-card {
      padding: 28px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      transition: all 0.3s ease;
    }

    .platform-card:hover {
      border-color: var(--accent-cyan);
      box-shadow: var(--glow-cyan);
      transform: translateY(-2px);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .plat-code {
      font-size: 11px;
      background: rgba(0, 240, 255, 0.15);
      border: 1px solid var(--border-neon);
      color: var(--accent-cyan);
      padding: 4px 10px;
      border-radius: 4px;
    }

    .game-count-badge {
      font-size: 12px;
      color: var(--text-muted);
      font-weight: 600;
    }

    .card-body {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .title-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .plat-icon {
      font-size: 32px;
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

    .tech-info {
      font-size: 9px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(148, 163, 184, 0.2);
      padding: 8px 12px;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .core-label {
      color: var(--text-muted);
    }

    .core-name {
      color: var(--accent-magenta);
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
    this.http.get<PlatformDetail[]>(`${getApiUrl()}/platforms`).subscribe({
      next: (res) => this.platforms.set(res),
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

  getWasmCoreName(code: string): string {
    const cores: Record<string, string> = {
      snes: 'snes9x.wasm',
      gba: 'mgba.wasm',
      nes: 'fceumm.wasm',
      megadrive: 'genesis_plus_gx.wasm',
      gb: 'gambatte.wasm',
      gbc: 'gambatte.wasm',
    };
    return cores[code.toLowerCase()] || 'retroarch.wasm';
  }

  filterByPlatform(code: string) {
    this.router.navigate(['/library'], { queryParams: { platform: code } });
  }
}
