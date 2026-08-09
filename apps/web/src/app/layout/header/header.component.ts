import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { GamepadService } from '../../core/services/gamepad.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="header-container glass-panel">
      <div class="logo-area" routerLink="/dashboard">
        <div class="logo-icon font-pixel">🎮</div>
        <div class="logo-title font-heading">NEXUS <span class="text-cyan-glow">ARCADE</span></div>
      </div>

      <div class="user-area" *ngIf="authService.currentUser() as user">
        <!-- Gamepad API Connected Hardware Badge -->
        <div
          class="gamepad-badge font-pixel"
          [class.connected]="gamepadService.connectedGamepadName()"
          routerLink="/settings"
          [title]="gamepadService.connectedGamepadName() || 'Nenhum controle físico detectado no momento'"
        >
          <span class="pad-icon">{{ getGamepadInfo(gamepadService.connectedGamepadName()).icon }}</span>
          <span class="pad-label">{{ getGamepadInfo(gamepadService.connectedGamepadName()).label }}</span>
        </div>

        <div class="user-info">
          <span class="username">{{ user.username }}</span>
          <span class="user-role-badge" [class.badge-admin]="authService.isAdmin()" [class.badge-gamer]="authService.isGamer()">
            {{ user.role }}
          </span>
        </div>

        <img [src]="user.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + user.username" alt="Avatar" class="avatar" />

        <button (click)="authService.logout()" class="btn-logout" title="Encerrar Sessão">
          🚪 Sair
        </button>
      </div>
    </header>
  `,
  styles: [`
    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 28px;
      margin-bottom: 24px;
    }

    .logo-area {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
    }

    .logo-icon {
      font-size: 22px;
      background: rgba(0, 240, 255, 0.1);
      padding: 6px 10px;
      border-radius: 8px;
      border: 1px solid var(--border-neon);
    }

    .logo-title {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 2px;
    }

    .user-area {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .gamepad-badge {
      font-size: 9px;
      padding: 6px 10px;
      border-radius: 6px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(148, 163, 184, 0.3);
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .gamepad-badge.connected {
      background: rgba(0, 240, 255, 0.15);
      border-color: var(--accent-cyan);
      color: var(--accent-cyan);
      box-shadow: var(--glow-cyan);
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
    }

    .username {
      font-weight: 700;
      font-size: 14px;
      color: var(--text-bright);
    }

    .user-role-badge {
      font-size: 10px;
      font-family: var(--font-heading);
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 700;
    }

    .badge-admin {
      background: rgba(255, 0, 127, 0.2);
      border: 1px solid rgba(255, 0, 127, 0.5);
      color: var(--accent-magenta);
    }

    .badge-gamer {
      background: rgba(0, 240, 255, 0.2);
      border: 1px solid rgba(0, 240, 255, 0.5);
      color: var(--accent-cyan);
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid var(--accent-cyan);
      background: var(--bg-dark);
    }

    .btn-logout {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
      padding: 8px 14px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .btn-logout:hover {
      background: rgba(239, 68, 68, 0.3);
      border-color: #ef4444;
    }
  `]
})
export class HeaderComponent {
  protected authService = inject(AuthService);
  protected gamepadService = inject(GamepadService);

  getGamepadInfo(name: string | null): { icon: string; label: string } {
    if (!name) return { icon: '⚪', label: 'Sem Gamepad' };
    const lower = name.toLowerCase();
    if (lower.includes('xbox')) return { icon: '🎮', label: 'Xbox' };
    if (lower.includes('playstation') || lower.includes('dual') || lower.includes('ps5') || lower.includes('ps4') || lower.includes('ps3')) {
      return { icon: '🎮', label: 'PlayStation' };
    }
    if (lower.includes('nintendo') || lower.includes('switch') || lower.includes('pro controller')) {
      return { icon: '🎮', label: 'Switch Pro' };
    }
    return { icon: '🎮', label: 'Gamepad' };
  }
}
