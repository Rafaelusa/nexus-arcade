import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { getApiUrl } from '../../../core/config/api.config';
import { PlatformDetail } from '../../platforms-view/platforms-view.component';

@Component({
  selector: 'app-admin-platforms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-platforms-page">
      <header class="page-header glass-panel">
        <div class="header-info">
          <span class="badge-admin font-pixel">ADMINISTRATION</span>
          <h1 class="header-title font-heading text-magenta-glow">🖥️ GERENCIAMENTO DE PLATAFORMAS</h1>
          <p class="header-subtitle">Cadastre, edite informações ou remova consoles suportados no catálogo</p>
        </div>

        <button (click)="showCreateModal.set(true)" class="btn-primary">
          <span>➕ Nova Plataforma</span>
        </button>
      </header>

      <!-- Alert Bar -->
      <div class="alert error" *ngIf="errorMessage()">
        ⚠️ {{ errorMessage() }}
      </div>
      <div class="alert success" *ngIf="successMessage()">
        ✓ {{ successMessage() }}
      </div>

      <!-- Grid de Plataformas -->
      <div class="platforms-grid">
        <div class="plat-card glass-panel" *ngFor="let p of platforms()">
          <div class="card-header">
            <span class="plat-code font-pixel">{{ p.code | uppercase }}</span>
            <span class="status-pill" [class.is-active]="p.isActive">{{ p.isActive ? 'Ativa' : 'Inativa' }}</span>
          </div>

          <h3 class="plat-name font-heading">{{ p.name }}</h3>
          <p class="plat-desc">{{ p.description || 'Sem descrição cadastrada.' }}</p>
          <p class="plat-games">{{ p._count?.games ?? 0 }} Jogo(s) Vinculado(s)</p>

          <div class="card-actions">
            <button (click)="openEditModal(p)" class="btn-action btn-edit">
              ✏️ Editar
            </button>
            <button (click)="deletePlatform(p)" class="btn-action btn-danger">
              Excluir
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de Criação de Plataforma -->
      <div class="modal-backdrop" *ngIf="showCreateModal()">
        <div class="modal-card glass-panel">
          <h2 class="modal-title font-heading text-cyan-glow">➕ Cadastrar Plataforma</h2>

          <form (ngSubmit)="createPlatform()" class="modal-form">
            <div class="form-group">
              <label class="font-heading">Nome da Plataforma</label>
              <input type="text" [(ngModel)]="newName" name="newName" required class="input-field" placeholder="Ex: Game Boy Advance" />
            </div>

            <div class="form-group">
              <label class="font-heading">Código Único (URL Friendly)</label>
              <input type="text" [(ngModel)]="newCode" name="newCode" required class="input-field" placeholder="gba" />
            </div>

            <div class="form-group">
              <label class="font-heading">Descrição</label>
              <textarea [(ngModel)]="newDescription" name="newDescription" class="input-field textarea" placeholder="Descrição do console..."></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" (click)="showCreateModal.set(false)" class="btn-cancel">Cancelar</button>
              <button type="submit" class="btn-primary">Salvar Plataforma</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal de Edição de Plataforma (Item 2) -->
      <div class="modal-backdrop" *ngIf="selectedPlatformForEdit()">
        <div class="modal-card glass-panel">
          <h2 class="modal-title font-heading text-cyan-glow">✏️ Editar Plataforma</h2>

          <form (ngSubmit)="updatePlatform()" class="modal-form">
            <div class="form-group">
              <label class="font-heading">Nome da Plataforma</label>
              <input type="text" [(ngModel)]="editName" name="editName" required class="input-field" />
            </div>

            <div class="form-group">
              <label class="font-heading">Código Único (URL Friendly)</label>
              <input type="text" [(ngModel)]="editCode" name="editCode" required class="input-field" />
            </div>

            <div class="form-group">
              <label class="font-heading">Descrição</label>
              <textarea [(ngModel)]="editDescription" name="editDescription" class="input-field textarea"></textarea>
            </div>

            <div class="form-group">
              <label class="font-heading">Status</label>
              <select [(ngModel)]="editIsActive" name="editIsActive" class="input-field">
                <option [ngValue]="true">Ativa (Disponível)</option>
                <option [ngValue]="false">Inativa (Oculta)</option>
              </select>
            </div>

            <div class="modal-actions">
              <button type="button" (click)="selectedPlatformForEdit.set(null)" class="btn-cancel">Cancelar</button>
              <button type="submit" class="btn-primary">Atualizar Informações</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-platforms-page {
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

    .platforms-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }

    .plat-card {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
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
      padding: 4px 8px;
      border-radius: 4px;
    }

    .status-pill {
      font-size: 11px;
      color: #ef4444;
    }

    .status-pill.is-active {
      color: #10b981;
    }

    .plat-name {
      font-size: 17px;
      font-weight: 700;
      color: var(--text-bright);
    }

    .plat-desc {
      font-size: 13px;
      color: var(--text-muted);
    }

    .plat-games {
      font-size: 12px;
      color: var(--accent-cyan);
      font-weight: 600;
    }

    .card-actions {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }

    .btn-action {
      flex: 1;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
    }

    .btn-edit {
      background: rgba(0, 240, 255, 0.15);
      border: 1px solid rgba(0, 240, 255, 0.4);
      color: var(--accent-cyan);
    }

    .btn-danger {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.4);
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
      padding: 20px;
    }

    .modal-card {
      width: 100%;
      max-width: 440px;
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      box-sizing: border-box;
    }

    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
      box-sizing: border-box;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
    }

    .input-field {
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid var(--border-neon);
      border-radius: 6px;
      padding: 10px 14px;
      color: var(--text-bright);
      outline: none;
    }

    .textarea {
      min-height: 80px;
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
export class AdminPlatformsComponent implements OnInit {
  private http = inject(HttpClient);

  protected platforms = signal<PlatformDetail[]>([]);
  protected showCreateModal = signal(false);
  protected selectedPlatformForEdit = signal<PlatformDetail | null>(null);

  protected errorMessage = signal<string | null>(null);
  protected successMessage = signal<string | null>(null);

  protected newName = '';
  protected newCode = '';
  protected newDescription = '';

  protected editName = '';
  protected editCode = '';
  protected editDescription = '';
  protected editIsActive = true;

  ngOnInit() {
    this.loadPlatforms();
  }

  loadPlatforms() {
    this.http.get<PlatformDetail[]>(`${getApiUrl()}/platforms?onlyActive=false`).subscribe({
      next: (res) => this.platforms.set(res),
    });
  }

  createPlatform() {
    if (!this.newName || !this.newCode) return;

    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.http
      .post(`${getApiUrl()}/platforms`, {
        name: this.newName,
        code: this.newCode,
        description: this.newDescription,
      })
      .subscribe({
        next: () => {
          this.successMessage.set(`Plataforma "${this.newName}" cadastrada com sucesso!`);
          this.showCreateModal.set(false);
          this.newName = '';
          this.newCode = '';
          this.newDescription = '';
          this.loadPlatforms();
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Erro ao cadastrar plataforma.');
        },
      });
  }

  openEditModal(plat: PlatformDetail) {
    this.selectedPlatformForEdit.set(plat);
    this.editName = plat.name;
    this.editCode = plat.code;
    this.editDescription = plat.description || '';
    this.editIsActive = plat.isActive;
  }

  updatePlatform() {
    const plat = this.selectedPlatformForEdit();
    if (!plat) return;

    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.http
      .patch(`${getApiUrl()}/platforms/${plat.id}`, {
        name: this.editName,
        code: this.editCode,
        description: this.editDescription,
        isActive: this.editIsActive,
      })
      .subscribe({
        next: () => {
          this.successMessage.set(`Informações da plataforma "${this.editName}" atualizadas!`);
          this.selectedPlatformForEdit.set(null);
          this.loadPlatforms();
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Erro ao atualizar plataforma.');
        },
      });
  }

  deletePlatform(plat: PlatformDetail) {
    if (!confirm(`Deseja excluir a plataforma "${plat.name}"?`)) return;

    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.http.delete<{ message: string }>(`${getApiUrl()}/platforms/${plat.id}`).subscribe({
      next: (res) => {
        this.successMessage.set(res.message);
        this.loadPlatforms();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Erro ao excluir plataforma.');
      },
    });
  }
}
