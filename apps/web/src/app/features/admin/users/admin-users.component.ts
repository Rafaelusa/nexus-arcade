import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { getApiUrl } from '../../../core/config/api.config';

export interface UserItem {
  id: string;
  email: string;
  username: string;
  role: 'ADMIN' | 'GAMER';
  avatarUrl?: string;
  isBlocked: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-users-page">
      <header class="page-header glass-panel">
        <div class="header-info">
          <span class="badge-admin font-pixel">ADMINISTRATION</span>
          <h1 class="header-title font-heading text-magenta-glow">👥 GERENCIAMENTO DE USUÁRIOS</h1>
          <p class="header-subtitle">Cadastre novos administradores, bloqueie acessos suspeitos e gerencie permissões</p>
        </div>

        <button (click)="showCreateModal.set(true)" class="btn-primary">
          <span>➕ Novo Usuário</span>
        </button>
      </header>

      <!-- Alert Bar -->
      <div class="alert error" *ngIf="errorMessage()">
        ⚠️ {{ errorMessage() }}
      </div>
      <div class="alert success" *ngIf="successMessage()">
        ✓ {{ successMessage() }}
      </div>

      <!-- Tabela de Usuários -->
      <div class="table-card glass-panel">
        <table class="users-table">
          <thead>
            <tr>
              <th>Usuário</th>
              <th>E-mail</th>
              <th>Papel (Role)</th>
              <th>Status</th>
              <th>Data Cadastro</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of users()">
              <td class="user-cell">
                <img [src]="u.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + u.username" alt="Avatar" class="mini-avatar" />
                <span class="username">{{ u.username }}</span>
              </td>
              <td>{{ u.email }}</td>
              <td>
                <span class="role-badge" [class.badge-admin]="u.role === 'ADMIN'" [class.badge-gamer]="u.role === 'GAMER'">
                  {{ u.role }}
                </span>
              </td>
              <td>
                <span class="status-pill" [class.is-blocked]="u.isBlocked">
                  {{ u.isBlocked ? 'Bloqueado' : 'Ativo' }}
                </span>
              </td>
              <td>{{ u.createdAt | date: 'dd/MM/yyyy HH:mm' }}</td>
              <td class="actions-cell">
                <button (click)="toggleBlock(u)" class="btn-action" [class.btn-unblock]="u.isBlocked">
                  {{ u.isBlocked ? 'Desbloquear' : 'Bloquear' }}
                </button>
                <button (click)="deleteUser(u)" class="btn-action btn-danger">
                  Excluir
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal de Criação de Usuário -->
      <div class="modal-backdrop" *ngIf="showCreateModal()">
        <div class="modal-card glass-panel">
          <h2 class="modal-title font-heading text-cyan-glow">➕ Cadastrar Usuário</h2>

          <form (ngSubmit)="createUser()" class="modal-form">
            <div class="form-group">
              <label class="font-heading">E-mail</label>
              <input type="email" [(ngModel)]="newEmail" name="newEmail" required class="input-field" placeholder="exemplo@email.com" />
            </div>

            <div class="form-group">
              <label class="font-heading">Username</label>
              <input type="text" [(ngModel)]="newUsername" name="newUsername" required class="input-field" placeholder="Nome de usuário" />
            </div>

            <div class="form-group">
              <label class="font-heading">Senha Inicial</label>
              <input type="password" [(ngModel)]="newPassword" name="newPassword" required class="input-field" placeholder="••••••••" />
            </div>

            <div class="form-group">
              <label class="font-heading">Papel (Role)</label>
              <select [(ngModel)]="newRole" name="newRole" class="input-field">
                <option value="GAMER">GAMER</option>
                <option value="ADMIN">ADMIN (Administrador)</option>
              </select>
            </div>

            <div class="modal-actions">
              <button type="button" (click)="showCreateModal.set(false)" class="btn-cancel">Cancelar</button>
              <button type="submit" class="btn-primary">Cadastrar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-users-page {
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

    .users-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 14px;
    }

    th, td {
      padding: 16px 20px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }

    th {
      font-family: var(--font-heading);
      font-size: 11px;
      color: var(--text-muted);
      letter-spacing: 1px;
    }

    .user-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .mini-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1px solid var(--accent-cyan);
    }

    .role-badge {
      font-size: 10px;
      font-family: var(--font-heading);
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
    }

    .badge-admin {
      background: rgba(255, 0, 127, 0.2);
      color: var(--accent-magenta);
      border: 1px solid rgba(255, 0, 127, 0.4);
    }

    .badge-gamer {
      background: rgba(0, 240, 255, 0.2);
      color: var(--accent-cyan);
      border: 1px solid rgba(0, 240, 255, 0.4);
    }

    .status-pill {
      font-size: 12px;
      color: #10b981;
      font-weight: 600;
    }

    .status-pill.is-blocked {
      color: #ef4444;
    }

    .actions-cell {
      display: flex;
      gap: 8px;
    }

    .btn-action {
      background: rgba(148, 163, 184, 0.1);
      border: 1px solid rgba(148, 163, 184, 0.3);
      color: var(--text-main);
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
    }

    .btn-unblock {
      background: rgba(16, 185, 129, 0.15);
      border-color: rgba(16, 185, 129, 0.4);
      color: #10b981;
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
      padding: 20px;
    }

    .modal-card {
      width: 100%;
      max-width: 480px;
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
export class AdminUsersComponent implements OnInit {
  private http = inject(HttpClient);

  protected users = signal<UserItem[]>([]);
  protected showCreateModal = signal(false);
  protected errorMessage = signal<string | null>(null);
  protected successMessage = signal<string | null>(null);

  protected newEmail = '';
  protected newUsername = '';
  protected newPassword = '';
  protected newRole: 'ADMIN' | 'GAMER' = 'GAMER';

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.http.get<{ data: UserItem[] }>(`${getApiUrl()}/users`).subscribe({
      next: (res) => this.users.set(res.data),
    });
  }

  toggleBlock(user: UserItem) {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.http.patch(`${getApiUrl()}/users/${user.id}/block`, {}).subscribe({
      next: () => {
        this.successMessage.set(`Status de bloqueio do usuário "${user.username}" foi alterado.`);
        this.loadUsers();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Erro ao alterar status de bloqueio.');
      },
    });
  }

  deleteUser(user: UserItem) {
    if (!confirm(`Tem certeza de que deseja excluir o usuário "${user.username}"?`)) return;

    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.http.delete<{ message: string }>(`${getApiUrl()}/users/${user.id}`).subscribe({
      next: (res) => {
        this.successMessage.set(res.message);
        this.loadUsers();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Falha ao excluir usuário.');
      },
    });
  }

  createUser() {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.http
      .post(`${getApiUrl()}/users`, {
        email: this.newEmail,
        username: this.newUsername,
        password: this.newPassword,
        role: this.newRole,
      })
      .subscribe({
        next: () => {
          this.successMessage.set(`Usuário "${this.newUsername}" cadastrado com sucesso.`);
          this.showCreateModal.set(false);
          this.newEmail = '';
          this.newUsername = '';
          this.newPassword = '';
          this.loadUsers();
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Erro ao cadastrar usuário.');
        },
      });
  }
}
