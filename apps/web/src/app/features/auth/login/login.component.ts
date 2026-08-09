import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-card glass-panel">
        <div class="auth-header">
          <div class="auth-icon font-pixel">🎮</div>
          <h1 class="auth-title font-heading">NEXUS <span class="text-cyan-glow">ARCADE</span></h1>
          <p class="auth-subtitle">Sua biblioteca de jogos emulados no navegador</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label class="font-heading">E-mail</label>
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              placeholder="admin@nexus.local"
              required
              class="input-field"
            />
          </div>

          <div class="form-group">
            <label class="font-heading">Senha</label>
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              placeholder="••••••••"
              required
              class="input-field"
            />
          </div>

          <div class="error-alert" *ngIf="errorMessage()">
            ⚠️ {{ errorMessage() }}
          </div>

          <button type="submit" [disabled]="isLoading()" class="btn-primary btn-block">
            <span>{{ isLoading() ? 'Autenticando...' : 'Entrar na Plataforma 🚀' }}</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>Ainda não possui uma conta? <a routerLink="/register" class="link-register">Cadastre-se como GAMER</a></p>
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
    }

    .auth-card {
      width: 100%;
      max-width: 420px;
      padding: 40px;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    .auth-header {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .auth-icon {
      font-size: 36px;
      margin-bottom: 4px;
    }

    .auth-title {
      font-size: 26px;
      font-weight: 900;
      letter-spacing: 2px;
    }

    .auth-subtitle {
      font-size: 13px;
      color: var(--text-muted);
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
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
      border-radius: var(--radius-sm);
      padding: 12px 16px;
      color: var(--text-bright);
      font-size: 14px;
      outline: none;
      transition: all 0.2s ease;
    }

    .input-field:focus {
      border-color: var(--accent-cyan);
      box-shadow: 0 0 10px rgba(0, 240, 255, 0.4);
    }

    .error-alert {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #ef4444;
      padding: 10px;
      border-radius: 6px;
      font-size: 13px;
      text-align: center;
    }

    .btn-block {
      width: 100%;
      justify-content: center;
      margin-top: 8px;
    }

    .auth-footer {
      text-align: center;
      font-size: 13px;
      color: var(--text-muted);
    }

    .link-register {
      color: var(--accent-cyan);
      text-decoration: none;
      font-weight: 700;
    }

    .link-register:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  protected email = 'admin@nexus.local';
  protected password = 'Admin123!NexusArcade';
  protected isLoading = signal(false);
  protected errorMessage = signal<string | null>(null);

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage.set('Por favor, informe o e-mail e a senha.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'E-mail ou senha incorretos.');
      },
    });
  }
}
