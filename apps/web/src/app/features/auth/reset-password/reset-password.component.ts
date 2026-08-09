import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { getApiUrl } from '../../../core/config/api.config';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-card glass-panel">
        <div class="logo-badge font-pixel">NEXUS ARCADE</div>
        <h1 class="auth-title font-heading text-cyan-glow">🔒 NOVA SENHA DE ACESSO</h1>
        <p class="auth-subtitle">Crie uma nova senha segura para sua conta. Ela será criptografada com Argon2id.</p>

        <div class="alert success" *ngIf="successMessage()">
          ✓ {{ successMessage() }}
        </div>
        <div class="alert error" *ngIf="errorMessage()">
          ⚠️ {{ errorMessage() }}
        </div>

        <form (ngSubmit)="resetPassword()" class="auth-form" *ngIf="!successMessage()">
          <div class="form-group">
            <label class="font-heading">Nova Senha</label>
            <input
              type="password"
              [(ngModel)]="newPassword"
              name="newPassword"
              required
              class="input-field"
              placeholder="••••••••"
            />
          </div>

          <div class="form-group">
            <label class="font-heading">Confirme a Nova Senha</label>
            <input
              type="password"
              [(ngModel)]="confirmPassword"
              name="confirmPassword"
              required
              class="input-field"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" [disabled]="isLoading()" class="btn-primary">
            <span>{{ isLoading() ? 'Atualizando Senha...' : 'Redefinir Senha' }}</span>
          </button>
        </form>

        <div class="auth-footer" style="margin-top: 16px;">
          <a routerLink="/login" class="link-cyan font-heading">← Ir para a Tela de Login</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: radial-gradient(circle at center, #1e1b4b 0%, #090d16 100%);
    }

    .auth-card {
      width: 100%;
      max-width: 440px;
      padding: 40px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      text-align: center;
      border: 1px solid var(--border-neon);
      box-shadow: var(--glow-cyan);
    }

    .logo-badge {
      font-size: 11px;
      color: var(--accent-magenta);
      letter-spacing: 2px;
    }

    .auth-title {
      font-size: 22px;
      font-weight: 900;
    }

    .auth-subtitle {
      font-size: 13px;
      color: var(--text-muted);
      line-height: 1.5;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
      text-align: left;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    label {
      font-size: 11px;
      color: var(--text-muted);
      letter-spacing: 1px;
    }

    .input-field {
      width: 100%;
      box-sizing: border-box;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid var(--border-neon);
      border-radius: 8px;
      padding: 12px 16px;
      color: var(--text-bright);
      outline: none;
    }

    .alert {
      padding: 12px;
      border-radius: 6px;
      font-size: 13px;
      line-height: 1.4;
    }

    .alert.success {
      background: rgba(16, 185, 129, 0.2);
      border: 1px solid #10b981;
      color: #10b981;
    }

    .alert.error {
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid #ef4444;
      color: #ef4444;
    }

    .link-cyan {
      color: var(--accent-cyan);
      text-decoration: none;
      font-size: 13px;
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected resetToken = '';
  protected newPassword = '';
  protected confirmPassword = '';

  protected isLoading = signal(false);
  protected successMessage = signal<string | null>(null);
  protected errorMessage = signal<string | null>(null);

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.resetToken = token;
    } else {
      this.errorMessage.set('Token de redefinição de senha não encontrado na URL.');
    }
  }

  resetPassword() {
    if (!this.resetToken) {
      this.errorMessage.set('Token de redefinição ausente.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage.set('As senhas digitadas não coincidem.');
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage.set('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.http
      .post<{ message: string }>(`${getApiUrl()}/auth/reset-password`, {
        resetToken: this.resetToken,
        newPassword: this.newPassword,
      })
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.successMessage.set(res.message);
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2500);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'Token de redefinição inválido ou expirado.');
        },
      });
  }
}
