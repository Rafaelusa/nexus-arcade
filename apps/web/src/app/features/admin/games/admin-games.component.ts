import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PlatformItem } from '../../library/library.component';

export interface AdminGameItem {
  id: string;
  title: string;
  description: string;
  coverUrl?: string;
  romStorageKey?: string;
  romHash?: string;
  romSize?: number;
  releaseYear?: number;
  developer?: string;
  platform: {
    id: string;
    name: string;
    code: string;
  };
}

@Component({
  selector: 'app-admin-games',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-games-page">
      <header class="page-header glass-panel">
        <div class="header-info">
          <span class="badge-admin font-pixel">ADMINISTRATION</span>
          <h1 class="header-title font-heading text-magenta-glow">👾 GERENCIAMENTO DE JOGOS & ROMS</h1>
          <p class="header-subtitle">Cadastre metadados, faça upload de arquivos binários de ROMs (.sfc, .gba) e capas</p>
        </div>

        <button (click)="showCreateModal.set(true)" class="btn-primary">
          <span>➕ Novo Jogo</span>
        </button>
      </header>

      <!-- Alert Bar -->
      <div class="alert error" *ngIf="errorMessage()">
        ⚠️ {{ errorMessage() }}
      </div>
      <div class="alert success" *ngIf="successMessage()">
        ✓ {{ successMessage() }}
      </div>

      <!-- Tabela de Jogos -->
      <div class="table-card glass-panel">
        <table class="games-table">
          <thead>
            <tr>
              <th>Capa</th>
              <th>Título</th>
              <th>Plataforma</th>
              <th>Desenvolvedor / Ano</th>
              <th>Status da ROM</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let g of games()">
              <td>
                <img [src]="g.coverUrl || 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=100&auto=format&fit=crop'" alt="Capa" class="thumb-cover" />
              </td>
              <td>
                <span class="game-title font-heading">{{ g.title }}</span>
              </td>
              <td>
                <span class="plat-badge font-pixel">{{ g.platform.code | uppercase }}</span>
              </td>
              <td>{{ g.developer || '-' }} ({{ g.releaseYear || '-' }})</td>
              <td>
                <span class="rom-status" [class.has-rom]="g.romStorageKey">
                  {{ g.romStorageKey ? '🟢 ROM Pronta (' + formatBytes(g.romSize) + ')' : '🔴 Sem ROM Binária' }}
                </span>
              </td>
              <td class="actions-cell">
                <button (click)="openRomModal(g)" class="btn-action btn-rom">
                  💾 Upload ROM
                </button>
                <button (click)="openCoverModal(g)" class="btn-action">
                  🖼️ Upload Capa
                </button>
                <button (click)="deleteGame(g)" class="btn-action btn-danger">
                  Excluir
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal de Criação de Jogo -->
      <div class="modal-backdrop" *ngIf="showCreateModal()">
        <div class="modal-card glass-panel">
          <h2 class="modal-title font-heading text-cyan-glow">➕ Cadastrar Novo Jogo</h2>

          <form (ngSubmit)="createGame()" class="modal-form">
            <div class="form-group">
              <label class="font-heading">Título do Jogo</label>
              <input type="text" [(ngModel)]="newTitle" name="newTitle" required class="input-field" placeholder="Ex: Super Mario World" />
            </div>

            <div class="form-group">
              <label class="font-heading">Plataforma</label>
              <select [(ngModel)]="newPlatformId" name="newPlatformId" required class="input-field">
                <option value="" disabled>Selecione a Plataforma</option>
                <option *ngFor="let p of platforms()" [value]="p.id">
                  {{ p.name }} ({{ p.code | uppercase }})
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="font-heading">Descrição</label>
              <textarea [(ngModel)]="newDescription" name="newDescription" required class="input-field textarea" placeholder="Descrição do jogo..."></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="font-heading">Desenvolvedor</label>
                <input type="text" [(ngModel)]="newDeveloper" name="newDeveloper" class="input-field" placeholder="Ex: Nintendo" />
              </div>
              <div class="form-group">
                <label class="font-heading">Ano de Lançamento</label>
                <input type="number" [(ngModel)]="newReleaseYear" name="newReleaseYear" class="input-field" placeholder="1990" />
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" (click)="showCreateModal.set(false)" class="btn-cancel">Cancelar</button>
              <button type="submit" class="btn-primary">Salvar Jogo</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal de Upload de ROM -->
      <div class="modal-backdrop" *ngIf="selectedGameForRom()">
        <div class="modal-card glass-panel">
          <h2 class="modal-title font-heading text-cyan-glow">💾 Upload de ROM Binária</h2>
          <p class="modal-sub">Jogo: <strong>{{ selectedGameForRom()?.title }}</strong></p>

          <form (ngSubmit)="uploadRomFile()" class="modal-form">
            <div class="form-group">
              <label class="font-heading">Selecione o arquivo da ROM (.sfc, .smc, .gba, .nes, .zip)</label>
              <input type="file" (change)="onRomFileSelected($event)" class="input-field file-input" />
            </div>

            <div class="modal-actions">
              <button type="button" (click)="selectedGameForRom.set(null)" class="btn-cancel">Cancelar</button>
              <button type="submit" [disabled]="!romFileToUpload || isUploading()" class="btn-primary">
                {{ isUploading() ? 'Enviando & Calculando SHA-256...' : 'Enviar ROM' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal de Upload de Capa -->
      <div class="modal-backdrop" *ngIf="selectedGameForCover()">
        <div class="modal-card glass-panel">
          <h2 class="modal-title font-heading text-cyan-glow">🖼️ Upload da Imagem de Capa</h2>
          <p class="modal-sub">Jogo: <strong>{{ selectedGameForCover()?.title }}</strong></p>

          <form (ngSubmit)="uploadCoverFile()" class="modal-form">
            <div class="form-group">
              <label class="font-heading">Selecione a imagem de capa (PNG, JPG, WebP)</label>
              <input type="file" (change)="onCoverFileSelected($event)" class="input-field file-input" />
            </div>

            <div class="modal-actions">
              <button type="button" (click)="selectedGameForCover.set(null)" class="btn-cancel">Cancelar</button>
              <button type="submit" [disabled]="!coverFileToUpload || isUploading()" class="btn-primary">
                {{ isUploading() ? 'Enviando...' : 'Enviar Capa' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-games-page {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .page-header {
      padding: 28px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .badge-admin {
      font-size: 10px;
      color: var(--accent-magenta);
    }

    .header-title {
      font-size: 24px;
      font-weight: 900;
    }

    .header-subtitle {
      font-size: 14px;
      color: var(--text-muted);
    }

    .table-card {
      overflow-x: auto;
    }

    .games-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 14px;
    }

    th, td {
      padding: 14px 18px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }

    th {
      font-family: var(--font-heading);
      font-size: 11px;
      color: var(--text-muted);
      letter-spacing: 1px;
    }

    .thumb-cover {
      width: 48px;
      height: 48px;
      border-radius: 6px;
      object-fit: cover;
      border: 1px solid var(--border-neon);
    }

    .game-title {
      font-size: 15px;
      color: var(--text-bright);
    }

    .plat-badge {
      font-size: 10px;
      background: rgba(0, 240, 255, 0.15);
      color: var(--accent-cyan);
      border: 1px solid var(--border-neon);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .rom-status {
      font-size: 12px;
      color: #ef4444;
      font-weight: 600;
    }

    .rom-status.has-rom {
      color: #10b981;
    }

    .actions-cell {
      display: flex;
      gap: 8px;
    }

    .btn-action {
      background: rgba(148, 163, 184, 0.1);
      border: 1px solid rgba(148, 163, 184, 0.3);
      color: var(--text-main);
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
    }

    .btn-rom {
      background: rgba(0, 240, 255, 0.15);
      border-color: rgba(0, 240, 255, 0.4);
      color: var(--accent-cyan);
    }

    .btn-danger {
      background: rgba(239, 68, 68, 0.15);
      border-color: rgba(239, 68, 68, 0.4);
      color: #ef4444;
    }

    .alert {
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
    }

    .alert.error {
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid #ef4444;
      color: #ef4444;
    }

    .alert.success {
      background: rgba(16, 185, 129, 0.2);
      border: 1px solid #10b981;
      color: #10b981;
    }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-card {
      width: 100%;
      max-width: 480px;
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .modal-sub {
      font-size: 13px;
      color: var(--text-muted);
    }

    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .input-field {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid var(--border-neon);
      border-radius: 6px;
      padding: 10px 14px;
      color: var(--text-bright);
      outline: none;
    }

    .textarea {
      min-height: 80px;
      resize: vertical;
    }

    .file-input {
      padding: 8px;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 12px;
    }

    .btn-cancel {
      background: transparent;
      border: 1px solid var(--text-muted);
      color: var(--text-muted);
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
    }
  `]
})
export class AdminGamesComponent implements OnInit {
  private http = inject(HttpClient);

  protected games = signal<AdminGameItem[]>([]);
  protected platforms = signal<PlatformItem[]>([]);
  protected showCreateModal = signal(false);
  protected selectedGameForRom = signal<AdminGameItem | null>(null);
  protected selectedGameForCover = signal<AdminGameItem | null>(null);

  protected errorMessage = signal<string | null>(null);
  protected successMessage = signal<string | null>(null);
  protected isUploading = signal(false);

  protected newTitle = '';
  protected newPlatformId = '';
  protected newDescription = '';
  protected newDeveloper = '';
  protected newReleaseYear?: number;

  protected romFileToUpload: File | null = null;
  protected coverFileToUpload: File | null = null;

  ngOnInit() {
    this.loadPlatforms();
    this.loadGames();
  }

  loadPlatforms() {
    this.http.get<PlatformItem[]>('http://localhost:3000/platforms').subscribe({
      next: (res) => this.platforms.set(res),
    });
  }

  loadGames() {
    this.http.get<{ data: AdminGameItem[] }>('http://localhost:3000/games').subscribe({
      next: (res) => this.games.set(res.data),
    });
  }

  createGame() {
    if (!this.newTitle || !this.newPlatformId || !this.newDescription) return;

    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.http
      .post('http://localhost:3000/games', {
        title: this.newTitle,
        platformId: this.newPlatformId,
        description: this.newDescription,
        developer: this.newDeveloper,
        releaseYear: this.newReleaseYear ? Number(this.newReleaseYear) : undefined,
      })
      .subscribe({
        next: () => {
          this.successMessage.set(`Jogo "${this.newTitle}" cadastrado com sucesso!`);
          this.showCreateModal.set(false);
          this.newTitle = '';
          this.newDescription = '';
          this.newDeveloper = '';
          this.loadGames();
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Erro ao cadastrar jogo.');
        },
      });
  }

  deleteGame(game: AdminGameItem) {
    if (!confirm(`Deseja excluir o jogo "${game.title}" e seus arquivos de ROM?`)) return;

    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.http.delete<{ message: string }>(`http://localhost:3000/games/${game.id}`).subscribe({
      next: (res) => {
        this.successMessage.set(res.message);
        this.loadGames();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Erro ao excluir jogo.');
      },
    });
  }

  openRomModal(game: AdminGameItem) {
    this.selectedGameForRom.set(game);
    this.romFileToUpload = null;
  }

  openCoverModal(game: AdminGameItem) {
    this.selectedGameForCover.set(game);
    this.coverFileToUpload = null;
  }

  onRomFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.romFileToUpload = file;
    }
  }

  onCoverFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.coverFileToUpload = file;
    }
  }

  uploadRomFile() {
    const game = this.selectedGameForRom();
    if (!game || !this.romFileToUpload) return;

    this.isUploading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const formData = new FormData();
    formData.append('file', this.romFileToUpload);

    this.http.post(`http://localhost:3000/games/${game.id}/rom`, formData).subscribe({
      next: () => {
        this.isUploading.set(false);
        this.successMessage.set(`ROM binária para "${game.title}" enviada com sucesso! SHA-256 gravado no banco.`);
        this.selectedGameForRom.set(null);
        this.loadGames();
      },
      error: (err) => {
        this.isUploading.set(false);
        this.errorMessage.set(err.error?.message || 'Erro no upload da ROM.');
      },
    });
  }

  uploadCoverFile() {
    const game = this.selectedGameForCover();
    if (!game || !this.coverFileToUpload) return;

    this.isUploading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const formData = new FormData();
    formData.append('file', this.coverFileToUpload);

    this.http.post(`http://localhost:3000/games/${game.id}/cover`, formData).subscribe({
      next: () => {
        this.isUploading.set(false);
        this.successMessage.set(`Imagem de capa enviada para "${game.title}".`);
        this.selectedGameForCover.set(null);
        this.loadGames();
      },
      error: (err) => {
        this.isUploading.set(false);
        this.errorMessage.set(err.error?.message || 'Erro no upload da capa.');
      },
    });
  }

  formatBytes(bytes?: number): string {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
