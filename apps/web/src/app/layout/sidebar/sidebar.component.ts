import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar-container glass-panel">
      <!-- Seção Principal Gamer -->
      <div class="menu-group">
        <div class="group-title font-heading">MENU PRINCIPAL</div>
        <nav class="nav-links">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <span class="icon">📊</span> Dashboard
          </a>
          <a routerLink="/library" routerLinkActive="active" class="nav-item">
            <span class="icon">📚</span> Biblioteca
          </a>
          <a routerLink="/favorites" routerLinkActive="active" class="nav-item">
            <span class="icon">⭐</span> Favoritos
          </a>
          <a routerLink="/platforms" routerLinkActive="active" class="nav-item">
            <span class="icon">🕹️</span> Plataformas
          </a>
          <a routerLink="/settings" routerLinkActive="active" class="nav-item">
            <span class="icon">⚙️</span> Configurações
          </a>
        </nav>
      </div>

      <!-- Seção Exclusiva para Administradores -->
      <div class="menu-group" *ngIf="authService.isAdmin()">
        <div class="group-title font-heading text-magenta-glow">ADMINISTRAÇÃO</div>
        <nav class="nav-links">
          <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item admin-item">
            <span class="icon">🛡️</span> Painel Admin
          </a>
          <a routerLink="/admin/users" routerLinkActive="active" class="nav-item admin-item">
            <span class="icon">👥</span> Gerenciar Usuários
          </a>
          <a routerLink="/admin/games" routerLinkActive="active" class="nav-item admin-item">
            <span class="icon">👾</span> Gerenciar Jogos
          </a>
          <a routerLink="/admin/platforms" routerLinkActive="active" class="nav-item admin-item">
            <span class="icon">🖥️</span> Gerenciar Plataformas
          </a>
          <a routerLink="/admin/logs" routerLinkActive="active" class="nav-item admin-item">
            <span class="icon">📋</span> Logs de Auditoria
          </a>
        </nav>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar-container {
      width: 260px;
      padding: 24px 16px;
      display: flex;
      flex-direction: column;
      gap: 32px;
      height: fit-content;
    }

    .menu-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .group-title {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 1px;
      padding-left: 8px;
    }

    .nav-links {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 8px;
      color: var(--text-main);
      text-decoration: none;
      font-weight: 500;
      font-size: 14px;
      transition: all 0.2s ease;
    }

    .nav-item:hover {
      background: rgba(0, 240, 255, 0.1);
      color: var(--accent-cyan);
    }

    .nav-item.active {
      background: linear-gradient(90deg, rgba(0, 240, 255, 0.2), transparent);
      border-left: 3px solid var(--accent-cyan);
      color: var(--accent-cyan);
      font-weight: 700;
    }

    .admin-item:hover {
      background: rgba(255, 0, 127, 0.1);
      color: var(--accent-magenta);
    }

    .admin-item.active {
      background: linear-gradient(90deg, rgba(255, 0, 127, 0.2), transparent);
      border-left: 3px solid var(--accent-magenta);
      color: var(--accent-magenta);
    }

    .icon {
      font-size: 16px;
    }
  `]
})
export class SidebarComponent {
  protected authService = inject(AuthService);
}
