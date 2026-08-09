import { Component, signal, inject, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule, NavigationStart } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { filter, Subscription } from 'rxjs';
import { GameItem } from '../library/library.component';
import { GamepadService } from '../../core/services/gamepad.service';
import { SaveStateService } from '../../core/services/save-state.service';

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
      <!-- Gamepad Toast Notification HUD -->
      <div class="gamepad-toast glass-panel" *ngIf="gamepadService.showNotification()">
        <span class="toast-icon">🎮</span>
        <div class="toast-content">
          <span class="toast-title font-heading text-cyan-glow">CONTROLE DETECTADO</span>
          <span class="toast-desc">{{ gamepadService.connectedGamepadName() }}</span>
        </div>
      </div>

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
          <button (click)="saveCloudSlot()" [disabled]="isSavingState()" class="btn-action btn-save" title="Salvar Estado na Memória & Nuvem">
            💾 {{ isSavingState() ? 'Salvando...' : 'Salvar Slot 1' }}
          </button>
          <button (click)="loadCloudSlot()" [disabled]="isLoadingState()" class="btn-action btn-load" title="Carregar Estado da Nuvem">
            📂 {{ isLoadingState() ? 'Carregando...' : 'Carregar Slot 1' }}
          </button>
          <button (click)="toggleFullscreen()" class="btn-action" title="Tela Cheia">
            🖥️ Tela Cheia
          </button>
          <button (click)="reloadEmulator()" class="btn-action" title="Reiniciar Jogo">
            🔄 Reiniciar
          </button>
        </div>
      </header>

      <!-- Alert Message for Save/Load -->
      <div class="save-status-toast" *ngIf="saveStatusMessage()">
        {{ saveStatusMessage() }}
      </div>

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
      position: relative;
    }

    .gamepad-toast {
      position: absolute;
      top: 12px;
      right: 24px;
      z-index: 2000;
      padding: 12px 20px;
      display: flex;
      align-items: center;
      gap: 14px;
      border: 1px solid var(--accent-cyan);
      box-shadow: var(--glow-cyan);
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .toast-icon { font-size: 24px; }
    .toast-content { display: flex; flex-direction: column; gap: 2px; }
    .toast-title { font-size: 11px; font-weight: 700; }
    .toast-desc { font-size: 12px; color: var(--text-bright); }

    .player-header {
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
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
      transition: all 0.2s ease;
    }

    .btn-action:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-save {
      background: rgba(16, 185, 129, 0.2);
      border-color: rgba(16, 185, 129, 0.5);
      color: #10b981;
    }

    .btn-load {
      background: rgba(255, 0, 127, 0.2);
      border-color: rgba(255, 0, 127, 0.5);
      color: var(--accent-magenta);
    }

    .save-status-toast {
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid var(--accent-cyan);
      color: var(--accent-cyan);
      padding: 10px 20px;
      border-radius: 8px;
      text-align: center;
      font-size: 13px;
      font-weight: 700;
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

    .alert-icon { font-size: 54px; }

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

    .hidden { display: none; }
  `]
})
export class PlayerComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  protected gamepadService = inject(GamepadService);
  private saveStateService = inject(SaveStateService);

  @ViewChild('emulatorContainer') emulatorContainer!: ElementRef;

  protected game = signal<GameItem | null>(null);
  protected saveStatusMessage = signal<string | null>(null);
  protected isSavingState = signal(false);
  protected isLoadingState = signal(false);

  private routerSub?: Subscription;

  ngOnInit() {
    this.routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationStart))
      .subscribe(() => {
        this.destroyEmulatorInstance();
      });

    const gameId = this.route.snapshot.paramMap.get('gameId');
    if (gameId) {
      this.loadGame(gameId);
    }
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
    this.destroyEmulatorInstance();
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
    this.destroyEmulatorInstance();

    const coreMap: Record<string, string> = {
      snes: 'snes9x',
      gba: 'mgba',
      nes: 'fceumm',
      megadrive: 'genesis_plus_gx',
      gb: 'gambatte',
      gbc: 'gambatte',
    };

    const core = coreMap[game.platform.code.toLowerCase()] || 'snes9x';

    window.EJS_player = '#game-player-target';
    window.EJS_core = core;
    window.EJS_gameName = game.title;
    window.EJS_gameUrl = `http://localhost:3000/games/${game.id}/rom/stream`;
    window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
    window.EJS_startOnLoaded = true;

    this.injectEmulatorScript();
  }

  injectEmulatorScript() {
    const script = document.createElement('script');
    script.id = 'emulatorjs-loader-script';
    script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
    script.async = true;
    document.body.appendChild(script);
  }

  destroyEmulatorInstance() {
    if (window.EJS_emulator) {
      try {
        if (typeof window.EJS_emulator.pause === 'function') {
          window.EJS_emulator.pause();
        }
        if (typeof window.EJS_emulator.destroy === 'function') {
          window.EJS_emulator.destroy();
        }
        if (window.EJS_emulator.audioContext) {
          window.EJS_emulator.audioContext.close();
        }
      } catch (e) {
        console.warn('[PlayerComponent] Erro ao destruir EJS_emulator:', e);
      }
    }

    try {
      const mediaElements = document.querySelectorAll('audio, video');
      mediaElements.forEach((el: any) => {
        el.pause();
        el.src = '';
      });
    } catch {}

    const scripts = document.querySelectorAll('script[src*="emulatorjs"]');
    scripts.forEach((s) => s.remove());

    const target = document.getElementById('emulator-container');
    if (target) {
      target.innerHTML = '<div id="game-player-target"></div>';
    }

    delete window.EJS_emulator;
    delete window.EJS_player;
    delete window.EJS_core;
    delete window.EJS_gameName;
    delete window.EJS_gameUrl;
  }

  // --- SAVE STATE DE MEMÓRIA REAL & CLOUD SYNC ---

  async saveCloudSlot() {
    if (!this.game()) return;

    this.isSavingState.set(true);
    this.showSaveToast('💾 Capturando estado em memória da ROM...');

    try {
      const stateBytes = await this.extractStateFromEmulator();

      if (!stateBytes || stateBytes.byteLength === 0) {
        throw new Error('O emulador não retornou dados de salvamento válidos.');
      }

      const base64State = this.uint8ArrayToBase64(stateBytes);

      this.saveStateService
        .saveSlot(this.game()!.id, 1, base64State)
        .subscribe({
          next: () => {
            this.isSavingState.set(false);
            this.showSaveToast('✓ Estado exato salvo na memória e sincronizado com o banco!');
          },
          error: (err) => {
            this.isSavingState.set(false);
            this.showSaveToast('⚠️ Erro ao salvar estado no banco de dados.');
            console.error(err);
          },
        });
    } catch (err: any) {
      this.isSavingState.set(false);
      this.showSaveToast(`⚠️ ${err.message || 'Falha ao capturar estado em memória.'}`);
    }
  }

  async loadCloudSlot() {
    if (!this.game()) return;

    this.isLoadingState.set(true);
    this.showSaveToast('📂 Carregando Save State do banco de dados...');

    this.saveStateService.getGameSaveSlots(this.game()!.id).subscribe({
      next: async (slots) => {
        if (!slots || slots.length === 0) {
          this.isLoadingState.set(false);
          this.showSaveToast('ℹ️ Nenhum save state encontrado para este jogo no Slot 1.');
          return;
        }

        const slot = slots[0];
        const base64State = slot.storageKey;

        try {
          const stateBytes = this.base64ToUint8Array(base64State);
          await this.applyStateToEmulator(stateBytes);

          this.isLoadingState.set(false);
          this.showSaveToast(`✓ Estado restaurado com sucesso! (Salvo em: ${new Date(slot.updatedAt).toLocaleTimeString()})`);
        } catch (err: any) {
          this.isLoadingState.set(false);
          this.showSaveToast(`⚠️ ${err.message}`);
        }
      },
      error: () => {
        this.isLoadingState.set(false);
        this.showSaveToast('⚠️ Erro ao buscar save state no banco.');
      },
    });
  }

  private async extractStateFromEmulator(): Promise<Uint8Array> {
    if (!window.EJS_emulator) {
      throw new Error('Aguarde a inicialização do emulador.');
    }

    const emu = window.EJS_emulator;

    const toUint8Array = (data: any): Uint8Array | null => {
      if (!data) return null;
      if (data instanceof Uint8Array) return data;
      if (ArrayBuffer.isView(data)) {
        return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
      }
      if (data instanceof ArrayBuffer) {
        return new Uint8Array(data);
      }
      return null;
    };

    // 1. Tentar EJS_emulator.gameManager.getState()
    if (emu.gameManager && typeof emu.gameManager.getState === 'function') {
      try {
        const res = emu.gameManager.getState();
        const raw = res instanceof Promise ? await res : res;
        const arr = toUint8Array(raw);
        if (arr && arr.byteLength > 0) return arr;
      } catch (e) {
        console.log('[SaveState] gameManager.getState async falhou, tentando callback...', e);
      }

      try {
        const arr = await new Promise<Uint8Array | null>((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error('Timeout ao obter estado via callback.')), 3000);
          emu.gameManager.getState((cbState: any) => {
            clearTimeout(timer);
            resolve(toUint8Array(cbState));
          });
        });
        if (arr && arr.byteLength > 0) return arr;
      } catch (e) {}
    }

    // 2. Tentar EJS_emulator.getState()
    if (typeof emu.getState === 'function') {
      try {
        const res = emu.getState();
        const raw = res instanceof Promise ? await res : res;
        const arr = toUint8Array(raw);
        if (arr && arr.byteLength > 0) return arr;
      } catch (e) {}
    }

    // 3. Tentar EJS_emulator.saveState()
    if (typeof emu.saveState === 'function') {
      try {
        const res = emu.saveState();
        const raw = res instanceof Promise ? await res : res;
        const arr = toUint8Array(raw);
        if (arr && arr.byteLength > 0) return arr;
      } catch (e) {}
    }

    throw new Error('Certifique-se de que a ROM foi totalmente carregada e a partida está iniciada.');
  }

  private async applyStateToEmulator(stateBytes: Uint8Array): Promise<void> {
    if (!window.EJS_emulator) {
      throw new Error('O emulador precisa estar ativo na tela para carregar o salvamento.');
    }

    const emu = window.EJS_emulator;

    // 1. Tentar EJS_emulator.gameManager.loadState()
    if (emu.gameManager && typeof emu.gameManager.loadState === 'function') {
      try {
        const res = emu.gameManager.loadState(stateBytes);
        if (res instanceof Promise) await res;
        return;
      } catch (e) {
        console.warn('[SaveState] gameManager.loadState falhou:', e);
      }
    }

    // 2. Tentar EJS_emulator.loadState()
    if (typeof emu.loadState === 'function') {
      try {
        const res = emu.loadState(stateBytes);
        if (res instanceof Promise) await res;
        return;
      } catch (e) {
        console.warn('[SaveState] loadState falhou:', e);
      }
    }

    throw new Error('Função de restauração de estado não suportada no emulador atual.');
  }

  private uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    const CHUNK_SIZE = 0x8000;
    for (let i = 0; i < len; i += CHUNK_SIZE) {
      const chunk = bytes.subarray(i, i + CHUNK_SIZE);
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    return btoa(binary);
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    const cleanBase64 = base64.trim().replace(/\s/g, '');

    if (!/^[A-Za-z0-9+/=]+$/.test(cleanBase64)) {
      throw new Error('O Slot 1 continha um registro antigo incompatível. Clique em "Salvar Slot 1" para salvar seu progresso real.');
    }

    try {
      const binaryString = atob(cleanBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    } catch {
      throw new Error('Falha ao decodificar save state. Clique em "Salvar Slot 1" para criar um novo registro.');
    }
  }

  private showSaveToast(msg: string) {
    this.saveStatusMessage.set(msg);
    setTimeout(() => {
      this.saveStatusMessage.set(null);
    }, 4500);
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
      if (window.EJS_emulator && window.EJS_emulator.gameManager && typeof window.EJS_emulator.gameManager.restart === 'function') {
        window.EJS_emulator.gameManager.restart();
        this.showSaveToast('🔄 Emulação reiniciada suavemente.');
      } else if (window.EJS_emulator && typeof window.EJS_emulator.restart === 'function') {
        window.EJS_emulator.restart();
        this.showSaveToast('🔄 Emulação reiniciada suavemente.');
      } else {
        this.initEmulator(this.game()!);
        this.showSaveToast('🔄 Emulador recarregado limpo.');
      }
    }
  }

  goBack() {
    this.destroyEmulatorInstance();
    this.router.navigate(['/library']);
  }
}
