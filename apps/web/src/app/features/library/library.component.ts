import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { getApiUrl } from '../../core/config/api.config';
import { ActivatedRoute, Router } from '@angular/router';

export interface GameItem {
  id: string;
  title: string;
  description: string;
  coverUrl?: string;
  releaseYear?: number;
  developer?: string;
  romStorageKey?: string;
  platform: {
    id: string;
    name: string;
    code: string;
  };
}

export interface PlatformItem {
  id: string;
  name: string;
  code: string;
}

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="library-page">
      <header class="page-header glass-panel">
        <div class="header-info">
          <h1 class="header-title font-heading text-cyan-glow">BIBLIOTECA DE JOGOS</h1>
          <p class="header-subtitle">
            Explore seu catálogo de clássicos e execute diretamente no seu navegador.
            <span class="count-badge font-pixel">EXIBINDO {{ games().length }} TÍTULO(S)</span>
          </p>
        </div>

        <div class="filter-controls">
          <div class="search-box">
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (input)="loadGames()"
              placeholder="Pesquisar por título ou desenvolvedor..."
              class="input-search"
            />
          </div>

          <select [(ngModel)]="selectedPlatformCode" (change)="loadGames()" class="select-platform">
            <option value="">Todas as Plataformas</option>
            <option *ngFor="let plat of platforms()" [value]="plat.code">
              {{ plat.name }} ({{ plat.code | uppercase }})
            </option>
          </select>
        </div>
      </header>

      <!-- Grid de Jogos -->
      <div class="games-grid" *ngIf="games().length > 0; else emptyState">
        <div class="game-card glass-panel" *ngFor="let game of games()">
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
                <span>🎮 Jogar</span>
              </button>
              <button (click)="toggleFavorite(game)" class="btn-favorite" [class.is-fav]="favoritesMap()[game.id]">
                {{ favoritesMap()[game.id] ? '⭐ Favorito' : '☆ Favoritar' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ng-template #emptyState>
        <div class="empty-card glass-panel">
          <div class="empty-icon">👾</div>
          <h3 class="font-heading">Nenhum jogo encontrado</h3>
          <p>Tente ajustar os termos de pesquisa ou o filtro por plataforma.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .library-page {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .page-header {
      padding: 28px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }

    .header-info {
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
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .count-badge {
      font-size: 9px;
      background: rgba(0, 240, 255, 0.15);
      border: 1px solid var(--accent-cyan);
      color: var(--accent-cyan);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .filter-controls {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .input-search, .select-platform {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid var(--border-neon);
      border-radius: 8px;
      padding: 10px 16px;
      color: var(--text-bright);
      font-size: 13px;
      outline: none;
    }

    .input-search {
      width: 260px;
    }

    .input-search:focus, .select-platform:focus {
      border-color: var(--accent-cyan);
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
      overflow: hidden;
    }

    .card-cover img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .game-card:hover .card-cover img {
      transform: scale(1.05);
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
      color: var(--text-bright);
    }

    .game-dev {
      font-size: 12px;
      color: var(--accent-cyan);
    }

    .game-desc {
      font-size: 13px;
      color: var(--text-muted);
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-actions {
      display: flex;
      gap: 10px;
      margin-top: auto;
      padding-top: 12px;
    }

    .btn-play {
      flex: 1;
      padding: 8px 16px;
      font-size: 13px;
      justify-content: center;
    }

    .btn-favorite {
      background: rgba(148, 163, 184, 0.1);
      border: 1px solid rgba(148, 163, 184, 0.3);
      color: var(--text-muted);
      padding: 8px 12px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s ease;
    }

    .btn-favorite:hover, .btn-favorite.is-fav {
      background: rgba(255, 183, 3, 0.2);
      border-color: var(--accent-gold);
      color: var(--accent-gold);
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
export class LibraryComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  protected games = signal<GameItem[]>([]);
  protected platforms = signal<PlatformItem[]>([]);
  protected favoritesMap = signal<Record<string, boolean>>({});

  protected searchQuery = '';
  protected selectedPlatformCode = '';

  ngOnInit() {
    const platParam = this.route.snapshot.queryParamMap.get('platform');
    if (platParam) {
      this.selectedPlatformCode = platParam;
    }

    this.loadPlatforms();
    this.loadGames();
    this.loadFavorites();
  }

  loadPlatforms() {
    this.http.get<PlatformItem[]>(`${getApiUrl()}/platforms`).subscribe({
      next: (res) => this.platforms.set(res),
    });
  }

  loadGames() {
    let url = `${getApiUrl()}/games?search=${encodeURIComponent(this.searchQuery)}`;
    if (this.selectedPlatformCode) {
      url += `&platformCode=${this.selectedPlatformCode}`;
    }

    this.http.get<{ data: GameItem[] }>(url).subscribe({
      next: (res) => this.games.set(res.data),
    });
  }

  loadFavorites() {
    const storedFavs = localStorage.getItem('nexus_favorites');
    if (storedFavs) {
      try {
        this.favoritesMap.set(JSON.parse(storedFavs));
      } catch {}
    }
  }

  toggleFavorite(game: GameItem) {
    const current = { ...this.favoritesMap() };
    current[game.id] = !current[game.id];
    this.favoritesMap.set(current);
    localStorage.setItem('nexus_favorites', JSON.stringify(current));
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
      gb: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop',
      gbc: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop',
    };
    imgElem.src = (platformCode && defaultCoversByPlatform[platformCode.toLowerCase()]) ||
      'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=600&auto=format&fit=crop';
  }
}
