import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

export interface AuditLogItem {
  id: string;
  userId?: string;
  user?: {
    username: string;
    email: string;
    role: string;
  };
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: any;
  createdAt: string;
}

@Component({
  selector: 'app-admin-logs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-logs-page">
      <header class="page-header glass-panel">
        <div class="header-info">
          <span class="badge-admin font-pixel">AUDIT TRAIL</span>
          <h1 class="header-title font-heading text-magenta-glow">📋 LOGS DE AUDITORIA DO SISTEMA</h1>
          <p class="header-subtitle">Histórico imutável de todas as ações administrativas, alterações e eventos de segurança</p>
        </div>
      </header>

      <!-- Tabela de Logs -->
      <div class="table-card glass-panel">
        <table class="logs-table">
          <thead>
            <tr>
              <th>Data / Hora</th>
              <th>Usuário Responsável</th>
              <th>Ação (Action)</th>
              <th>Recurso (Resource)</th>
              <th>Metadados do Evento</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let log of logs()">
              <td class="date-cell">{{ log.createdAt | date: 'dd/MM/yyyy HH:mm:ss' }}</td>
              <td>
                <div class="user-info" *ngIf="log.user; else systemUser">
                  <span class="username">{{ log.user.username }}</span>
                  <span class="role-pill">{{ log.user.role }}</span>
                </div>
                <ng-template #systemUser>
                  <span class="text-muted">Sistema</span>
                </ng-template>
              </td>
              <td>
                <span class="action-tag font-pixel">{{ log.action }}</span>
              </td>
              <td>{{ log.resource }} {{ log.resourceId ? '(' + log.resourceId.slice(0, 8) + '...)' : '' }}</td>
              <td>
                <pre class="metadata-code">{{ log.metadata ? (log.metadata | json) : '-' }}</pre>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .admin-logs-page {
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

    .logs-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 13px;
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

    .date-cell {
      white-space: nowrap;
      color: var(--text-bright);
      font-weight: 500;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .username {
      font-weight: 600;
      color: var(--text-bright);
    }

    .role-pill {
      font-size: 9px;
      background: rgba(255, 0, 127, 0.2);
      color: var(--accent-magenta);
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 700;
    }

    .action-tag {
      font-size: 10px;
      background: rgba(0, 240, 255, 0.15);
      border: 1px solid var(--border-neon);
      color: var(--accent-cyan);
      padding: 3px 8px;
      border-radius: 4px;
    }

    .metadata-code {
      font-size: 11px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid var(--border-neon);
      padding: 6px 10px;
      border-radius: 4px;
      color: var(--text-muted);
      max-width: 260px;
      overflow-x: auto;
      margin: 0;
    }
  `]
})
export class AdminLogsComponent implements OnInit {
  private http = inject(HttpClient);

  protected logs = signal<AuditLogItem[]>([]);

  ngOnInit() {
    this.http.get<{ data: AuditLogItem[] }>('http://localhost:3000/audit-logs').subscribe({
      next: (res) => this.logs.set(res.data),
    });
  }
}
