import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

export interface ForgotPasswordResponse {
  message: string;
  sentRealEmail?: boolean;
  devResetUrl?: string;
}

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-card glass-panel">
        <div class="logo-badge font-pixel">NEXUS ARCADE</div>
        <h1 class="auth-title font-heading text-cyan-glow">🔑 RECUPERAÇÃO DE SENHA</h1>
        <p class="auth-subtitle">Informe seu e-mail cadastrado para receber o link seguro de redefinição de senha.</p>

        <div class="alert success" *ngIf="successMessage()">
          ✓ {{ successMessage() }}
        </div>

        <div class="dev-box glass-panel" *ngIf="devResetUrl()">
          <span class="dev-badge font-pixel">MODO DESENVOLVIMENTO / SANDBOX SMTP</span>
          <p class="dev-text">
            O robô MailService disparou o e-mail em ambiente local (Ethereal Sandbox). Para enviar para caixas de entrada reais (Gmail/Outlook), basta preencher <code>SMTP_USER</code> e <code>SMTP_PASS</code> no arquivo <code>.env</code>.
          </p>
          <a [href]="devResetUrl()" class="btn-primary btn-dev-link font-heading">
            ⚡ Abrir Link de Redefinição Agora
          </a>
        </div>

        <div class="alert error" *ngIf="errorMessage()">
          ⚠️ {{ errorMessage() }}
        </div>

        <form (ngSubmit)="sendResetEmail()" class="auth-form" *ngIf="!successMessage()">
          <div class="form-group">
            <label class="font-heading">Endereço de E-mail</label>
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              required
              class="input-field"
              placeholder="seu.email@exemplo.com"
            />
          </div>

          <button type="submit" [disabled]="isLoading()" class="btn-primary">
            <span>{{ isLoading() ? 'Enviando E-mail...' : 'Enviar Link de Redefinição' }}</span>
          </button>
        </form>

        <div class="auth-footer" style="margin-top: 16px;">
          <a routerLink="/login" class="link-cyan font-heading">← Voltar para a Tela de Login</a>
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
      max-width: 480px;
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

    .dev-box {
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      text-align: left;
      border: 1px dashed var(--accent-cyan);
      background: rgba(0, 240, 255, 0.05);
    }

    .dev-badge {
      font-size: 9px;
      color: var(--accent-cyan);
    }

    .dev-text {
      font-size: 12px;
      color: var(--text-muted);
      line-height: 1.4;
    }

    .btn-dev-link {
      text-decoration: none;
      text-align: center;
      display: inline-block;
      margin-top: 4px;
    }

    .link-cyan {
      color: var(--accent-cyan);
      text-decoration: none;
      font-size: 13px;
    }
  `]
})
export class ForgotPasswordComponent {
  private http = inject(HttpClient);

  protected email = '';
  protected isLoading = signal(false);
  protected successMessage = signal<string | null>(null);
  protected errorMessage = signal<string | null>(null);
  protected devResetUrl = signal<string | null>(null);

  sendResetEmail() {
    if (!this.email) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.devResetUrl.set(null);

    this.http
      .post<ForgotPasswordResponse>('http://localhost:3000/auth/forgot-password', { email: this.email })
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.successMessage.set(res.message);
          if (res.devResetUrl && !res.sentRealEmail) {
            this.devResetUrl.set(res.devResetUrl);
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'Falha ao solicitar redefinição de senha.');
        },
      });
  }
}
