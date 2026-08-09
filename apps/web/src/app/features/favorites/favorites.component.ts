import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { getApiUrl } from '../../core/config/api.config';
import { GameItem } from '../library/library.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="favorites-page">
      <header class="page-header glass-panel">
        <h1 class="header-title font-heading text-magenta-glow">⭐ SEUS JOGOS FAVORITOS</h1>
        <p class="header-subtitle">Acesso rápido aos títulos que você favoritou para jogar com um clique</p>
      </header>

      <div class="games-grid" *ngIf="favoriteGames().length > 0; else emptyState">
        <div class="game-card glass-panel" *ngFor="let game of favoriteGames()">
          <div class="card-cover">
            <img
              [src]="game.coverUrl || 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=400&auto=format&fit=crop'"
              (error)="onImgError($event, game.platform.code)"
              [alt]="game.title"
            />
            <span class="platform-badge font-pixel">{{ game.platform.code | uppercase }}</span>
          </div>

          <div class="card-body">
            <h3 class="game-title font-heading">{{ game.title }}</h3>
            <p class="game-dev">{{ game.developer }} ({{ game.releaseYear || 'Ano desconhecido' }})</p>
            <p class="game-desc">{{ game.description }}</p>

            <div class="card-actions">
              <button (click)="playGame(game.id)" class="btn-primary btn-play">
                <span>🎮 Jogar Agora</span>
              </button>
              <button (click)="removeFavorite(game.id)" class="btn-remove">
                🗑️ Remover
              </button>
            </div>
          </div>
        </div>
      </div>

      <ng-template #emptyState>
        <div class="empty-card glass-panel">
          <div class="empty-icon">⭐</div>
          <h3 class="font-heading">Nenhum jogo favoritado ainda</h3>
          <p>Navegue pela Biblioteca e clique no botão "☆ Favoritar" para salvar seus títulos favoritos aqui.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .favorites-page {
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

    .games-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
    }

    .game-card {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .card-cover {
      position: relative;
      height: 180px;
    }

    .card-cover img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .platform-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(0, 0, 0, 0.85);
      border: 1px solid var(--accent-cyan);
      color: var(--accent-cyan);
      font-size: 9px;
      padding: 4px 8px;
      border-radius: 4px;
    }

    .card-body {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      flex: 1;
    }

    .game-title {
      font-size: 17px;
      font-weight: 700;
    }

    .game-dev {
      font-size: 12px;
      color: var(--accent-cyan);
    }

    .game-desc {
      font-size: 13px;
      color: var(--text-muted);
      line-height: 1.5;
    }

    .card-actions {
      display: flex;
      gap: 10px;
      margin-top: auto;
      padding-top: 12px;
    }

    .btn-play {
      flex: 1;
      justify-content: center;
    }

    .btn-remove {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #ef4444;
      padding: 8px 12px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 12px;
    }

    .empty-card {
      padding: 60px 20px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      color: var(--text-muted);
    }

    .empty-icon {
      font-size: 48px;
    }
  `]
})
export class FavoritesComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  protected favoriteGames = signal<GameItem[]>([]);

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    const stored = localStorage.getItem('nexus_favorites');
    if (!stored) return;

    try {
      const favMap: Record<string, boolean> = JSON.parse(stored);
      const favIds = Object.keys(favMap).filter((id) => favMap[id]);

      if (favIds.length === 0) {
        this.favoriteGames.set([]);
        return;
      }

      this.http.get<{ data: GameItem[] }>(`${getApiUrl()}/games`).subscribe({
        next: (res) => {
          const filtered = res.data.filter((game) => favIds.includes(game.id));
          this.favoriteGames.set(filtered);
        },
      });
    } catch {}
  }

  removeFavorite(gameId: string) {
    const stored = localStorage.getItem('nexus_favorites');
    if (!stored) return;
    try {
      const favMap: Record<string, boolean> = JSON.parse(stored);
      delete favMap[gameId];
      localStorage.setItem('nexus_favorites', JSON.stringify(favMap));
      this.loadFavorites();
    } catch {}
  }

  playGame(gameId: string) {
    this.router.navigate(['/player', gameId]);
  }

  onImgError(event: Event, platformCode?: string) {
    const imgElem = event.target as HTMLImageElement;
    const defaultCoversByPlatform: Record<string, string> = {
      snes: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=600&auto=format&fit=crop',
      gba: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop',
      nes: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=600&auto=format&fit=crop',
      megadrive: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop',
    };
    imgElem.src = (platformCode && defaultCoversByPlatform[platformCode.toLowerCase()]) ||
      'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=600&auto=format&fit=crop';
  }
}
