import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-page">
      <header class="page-header glass-panel">
        <h1 class="header-title font-heading text-cyan-glow">⚙️ CONFIGURAÇÕES DE CONTA</h1>
        <p class="header-subtitle">Gerencie suas informações de perfil, avatar e credenciais de acesso</p>
      </header>

      <div class="settings-grid">
        <!-- Card de Alteração de Perfil -->
        <section class="settings-card glass-panel" *ngIf="authService.currentUser() as user">
          <h2 class="card-title font-heading">👤 Editar Perfil Pessoal</h2>

          <form (ngSubmit)="updateProfile()" class="settings-form">
            <div class="form-group">
              <label class="font-heading">E-mail (Leitura)</label>
              <input type="email" [value]="user.email" disabled class="input-field disabled" />
            </div>

            <div class="form-group">
              <label class="font-heading">Nome de Usuário (Username)</label>
              <input type="text" [(ngModel)]="profileUsername" name="profileUsername" class="input-field" />
            </div>

            <div class="form-group">
              <label class="font-heading">URL do Avatar</label>
              <input type="text" [(ngModel)]="profileAvatarUrl" name="profileAvatarUrl" class="input-field" />
            </div>

            <div class="alert success" *ngIf="profileSuccess()">
              ✓ {{ profileSuccess() }}
            </div>
            <div class="alert error" *ngIf="profileError()">
              ⚠️ {{ profileError() }}
            </div>

            <button type="submit" [disabled]="isSavingProfile()" class="btn-primary">
              <span>{{ isSavingProfile() ? 'Salvando...' : 'Salvar Alterações do Perfil' }}</span>
            </button>
          </form>
        </section>

        <!-- Card de Alteração de Senha com Argon2id -->
        <section class="settings-card glass-panel">
          <h2 class="card-title font-heading">🔒 Seguranças e Senha</h2>

          <form (ngSubmit)="changePassword()" class="settings-form">
            <div class="form-group">
              <label class="font-heading">Senha Atual</label>
              <input type="password" [(ngModel)]="currentPassword" name="currentPassword" required class="input-field" />
            </div>

            <div class="form-group">
              <label class="font-heading">Nova Senha</label>
              <input type="password" [(ngModel)]="newPassword" name="newPassword" required class="input-field" />
            </div>

            <div class="alert success" *ngIf="passSuccess()">
              ✓ {{ passSuccess() }}
            </div>
            <div class="alert error" *ngIf="passError()">
              ⚠️ {{ passError() }}
            </div>

            <button type="submit" [disabled]="isSavingPassword()" class="btn-primary btn-magenta">
              <span>{{ isSavingPassword() ? 'Alterando...' : 'Alterar Senha de Acesso' }}</span>
            </button>
          </form>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .settings-page {
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

    .settings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
      gap: 24px;
    }

    .settings-card {
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .card-title {
      font-size: 18px;
      color: var(--text-bright);
    }

    .settings-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    label {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 1px;
    }

    .input-field {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid var(--border-neon);
      border-radius: 8px;
      padding: 12px 16px;
      color: var(--text-bright);
      font-size: 14px;
      outline: none;
    }

    .input-field.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .input-field:focus:not(.disabled) {
      border-color: var(--accent-cyan);
    }

    .alert {
      padding: 10px;
      border-radius: 6px;
      font-size: 13px;
      text-align: center;
    }

    .alert.success {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #10b981;
    }

    .alert.error {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #ef4444;
    }

    .btn-magenta {
      background: linear-gradient(135deg, var(--accent-magenta), var(--accent-purple));
      box-shadow: var(--glow-magenta);
    }
  `]
})
export class SettingsComponent {
  protected authService = inject(AuthService);
  private http = inject(HttpClient);

  protected profileUsername = this.authService.currentUser()?.username || '';
  protected profileAvatarUrl = this.authService.currentUser()?.avatarUrl || '';
  protected isSavingProfile = signal(false);
  protected profileSuccess = signal<string | null>(null);
  protected profileError = signal<string | null>(null);

  protected currentPassword = '';
  protected newPassword = '';
  protected isSavingPassword = signal(false);
  protected passSuccess = signal<string | null>(null);
  protected passError = signal<string | null>(null);

  updateProfile() {
    this.isSavingProfile.set(true);
    this.profileSuccess.set(null);
    this.profileError.set(null);

    this.http
      .patch('http://localhost:3000/users/me/profile', {
        username: this.profileUsername,
        avatarUrl: this.profileAvatarUrl,
      })
      .subscribe({
        next: () => {
          this.isSavingProfile.set(false);
          this.profileSuccess.set('Perfil atualizado com sucesso!');
          this.authService.loadProfile().subscribe();
        },
        error: (err) => {
          this.isSavingProfile.set(false);
          this.profileError.set(err.error?.message || 'Falha ao atualizar perfil.');
        },
      });
  }

  changePassword() {
    if (!this.currentPassword || !this.newPassword) {
      this.passError.set('Preencha a senha atual e a nova senha.');
      return;
    }

    this.isSavingPassword.set(true);
    this.passSuccess.set(null);
    this.passError.set(null);

    this.http
      .patch<{ message: string }>('http://localhost:3000/users/me/password', {
        currentPassword: this.currentPassword,
        newPassword: this.newPassword,
      })
      .subscribe({
        next: (res) => {
          this.isSavingPassword.set(false);
          this.passSuccess.set(res.message);
          this.currentPassword = '';
          this.newPassword = '';
        },
        error: (err) => {
          this.isSavingPassword.set(false);
          this.passError.set(err.error?.message || 'Senha atual incorreta.');
        },
      });
  }
}
