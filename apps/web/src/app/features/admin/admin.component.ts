import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-page">
      <section class="admin-header glass-panel">
        <span class="admin-badge font-pixel">EXCLUSIVO PARA ADMINISTRADORES</span>
        <h1 class="admin-title font-heading text-magenta-glow">PAINEL DE CONTROLE ADMINISTRATIVO</h1>
        <p class="admin-subtitle">
          Gerenciamento centralizado de usuários, jogos, plataformas, armazenamento de ROMs binárias e auditoria do sistema.
        </p>
      </section>

      <section class="admin-cards">
        <div class="admin-card glass-panel">
          <div class="card-icon">👥</div>
          <h3 class="card-title font-heading">Gerenciar Usuários</h3>
          <p class="card-desc">Listagem, cadastro de novos administradores, bloqueio e gestão de permissões RBAC.</p>
        </div>

        <div class="admin-card glass-panel">
          <div class="card-icon">👾</div>
          <h3 class="card-title font-heading">Gerenciar Jogos & ROMs</h3>
          <p class="card-desc">Upload de arquivos binários com verificação SHA-256, adição de capas e metadados.</p>
        </div>

        <div class="admin-card glass-panel">
          <div class="card-icon">🖥️</div>
          <h3 class="card-title font-heading">Gerenciar Plataformas</h3>
          <p class="card-desc">Cadastrar novos consoles de videogame (ex: GBA, Mega Drive, NES) e gerenciar status.</p>
        </div>

        <div class="admin-card glass-panel">
          <div class="card-icon">📋</div>
          <h3 class="card-title font-heading">Logs de Auditoria</h3>
          <p class="card-desc">Visualizar o histórico detalhado de alterações efetuadas por administradores.</p>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .admin-page {
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    .admin-header {
      padding: 36px 40px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .admin-badge {
      font-size: 10px;
      background: rgba(255, 0, 127, 0.15);
      border: 1px solid rgba(255, 0, 127, 0.4);
      color: var(--accent-magenta);
      padding: 4px 10px;
      border-radius: 4px;
      width: fit-content;
    }

    .admin-title {
      font-size: 26px;
      font-weight: 900;
      letter-spacing: 1px;
    }

    .admin-subtitle {
      font-size: 15px;
      color: var(--text-muted);
      line-height: 1.5;
    }

    .admin-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
    }

    .admin-card {
      padding: 28px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .card-icon {
      font-size: 32px;
    }

    .card-title {
      font-size: 17px;
      font-weight: 700;
    }

    .card-desc {
      font-size: 13px;
      color: var(--text-muted);
      line-height: 1.5;
    }
  `]
})
export class AdminComponent {
  protected authService = inject(AuthService);
}
