import { Component, signal, inject, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { GameItem } from '../library/library.component';

declare global {
  interface Window {
    EJS_player?: string;
    EJS_core?: string;
    EJS_gameName?: string;
    EJS_gameUrl?: string;
    EJS_pathtodata?: string;
    EJS_startOnLoaded?: boolean;
    EJS_emulator?: any;
  }
}

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="player-page">
      <!-- Player Header Toolbar -->
      <header class="player-header glass-panel">
        <button (click)="goBack()" class="btn-back">
          ⬅️ Voltar à Biblioteca
        </button>

        <div class="game-info" *ngIf="game() as g">
          <h1 class="game-title font-heading text-cyan-glow">{{ g.title }}</h1>
          <span class="platform-pill font-pixel">{{ g.platform.code | uppercase }}</span>
        </div>

        <div class="header-actions" *ngIf="game()?.romStorageKey">
          <button (click)="toggleFullscreen()" class="btn-action" title="Tela Cheia">
            🖥️ Tela Cheia
          </button>
          <button (click)="reloadEmulator()" class="btn-action" title="Reiniciar Jogo">
            🔄 Reiniciar
          </button>
        </div>
      </header>

      <!-- Player Canvas Container -->
      <main class="player-canvas-area glass-panel">
        <!-- Loader ou Alerta se não houver ROM -->
        <div class="no-rom-state" *ngIf="game() && !game()?.romStorageKey">
          <div class="alert-icon">⚠️</div>
          <h2 class="font-heading text-magenta-glow">ROM Binária Não Disponível</h2>
          <p>Este jogo ainda não possui um arquivo de ROM enviado no servidor.</p>
          <p class="text-muted">Um Administrador precisa realizar o upload do arquivo binário (.sfc, .gba) no painel de gestão.</p>
          <button (click)="goBack()" class="btn-primary" style="margin-top: 16px;">
            <span>Voltar para a Biblioteca</span>
          </button>
        </div>

        <!-- Div de Renderização do EmulatorJS WebAssembly -->
        <div id="emulator-container" #emulatorContainer class="emulator-viewport" [class.hidden]="!game()?.romStorageKey">
          <div id="game-player-target"></div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .player-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
      min-height: calc(100vh - 120px);
    }

    .player-header {
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .btn-back {
      background: rgba(148, 163, 184, 0.15);
      border: 1px solid rgba(148, 163, 184, 0.3);
      color: var(--text-bright);
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
      transition: all 0.2s ease;
    }

    .btn-back:hover {
      background: rgba(0, 240, 255, 0.2);
      border-color: var(--accent-cyan);
      color: var(--accent-cyan);
    }

    .game-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .game-title {
      font-size: 20px;
      font-weight: 900;
    }

    .platform-pill {
      font-size: 10px;
      background: rgba(0, 240, 255, 0.2);
      border: 1px solid var(--accent-cyan);
      color: var(--accent-cyan);
      padding: 3px 8px;
      border-radius: 4px;
    }

    .header-actions {
      display: flex;
      gap: 10px;
    }

    .btn-action {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid var(--border-neon);
      color: var(--text-bright);
      padding: 8px 14px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
    }

    .btn-action:hover {
      border-color: var(--accent-cyan);
      color: var(--accent-cyan);
    }

    .player-canvas-area {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 600px;
      position: relative;
      overflow: hidden;
      padding: 0;
    }

    .no-rom-state {
      padding: 60px 20px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .alert-icon {
      font-size: 54px;
    }

    .emulator-viewport {
      width: 100%;
      height: 100%;
      min-height: 650px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #game-player-target {
      width: 100%;
      height: 100%;
      min-height: 650px;
    }

    .hidden {
      display: none;
    }
  `]
})
export class PlayerComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  @ViewChild('emulatorContainer') emulatorContainer!: ElementRef;

  protected game = signal<GameItem | null>(null);

  ngOnInit() {
    const gameId = this.route.snapshot.paramMap.get('gameId');
    if (gameId) {
      this.loadGame(gameId);
    }
  }

  ngOnDestroy() {
    this.cleanupEmulatorScript();
  }

  loadGame(gameId: string) {
    this.http.get<GameItem>(`http://localhost:3000/games/${gameId}`).subscribe({
      next: (res) => {
        this.game.set(res);
        if (res.romStorageKey) {
          this.initEmulator(res);
        }
      },
      error: () => this.goBack(),
    });
  }

  initEmulator(game: GameItem) {
    const coreMap: Record<string, string> = {
      snes: 'snes9x',
      gba: 'mgba',
      nes: 'fceumm',
      megadrive: 'genesis_plus_gx',
      gb: 'gambatte',
      gbc: 'gambatte',
    };

    const core = coreMap[game.platform.code.toLowerCase()] || 'snes9x';

    // Configurar variáveis globais exigidas pelo EmulatorJS Engine
    window.EJS_player = '#game-player-target';
    window.EJS_core = core;
    window.EJS_gameName = game.title;
    window.EJS_gameUrl = `http://localhost:3000/games/${game.id}/rom/stream`;
    window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
    window.EJS_startOnLoaded = true;

    this.injectEmulatorScript();
  }

  injectEmulatorScript() {
    this.cleanupEmulatorScript();

    const script = document.createElement('script');
    script.id = 'emulatorjs-loader-script';
    script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
    script.async = true;
    document.body.appendChild(script);
  }

  cleanupEmulatorScript() {
    const existingScript = document.getElementById('emulatorjs-loader-script');
    if (existingScript) {
      existingScript.remove();
    }
  }

  toggleFullscreen() {
    const elem = document.getElementById('game-player-target');
    if (elem) {
      if (!document.fullscreenElement) {
        elem.requestFullscreen().catch((err) => console.error(err));
      } else {
        document.exitFullscreen();
      }
    }
  }

  reloadEmulator() {
    if (this.game()) {
      this.initEmulator(this.game()!);
    }
  }

  goBack() {
    this.router.navigate(['/library']);
  }
}
