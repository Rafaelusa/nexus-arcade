import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="portfolio-footer glass-panel">
      <div class="footer-brand">
        <div class="brand-title font-heading">NEXUS <span class="text-cyan-glow">ARCADE</span></div>
        <p class="brand-desc">Plataforma Web Full Stack para Emulação e Gerenciamento de Jogos Retro Online no Navegador</p>
      </div>

      <div class="footer-credits">
        <span class="font-pixel credit-tag">PORTFÓLIO FULL STACK</span>
        <p class="author-info">
          Desenvolvido com ⚡ por <strong>Dev Rafael Ribeiro</strong>
        </p>
        <div class="tech-stack-pills">
          <span class="pill">Angular 21</span>
          <span class="pill">NestJS</span>
          <span class="pill">PostgreSQL</span>
          <span class="pill">Prisma ORM</span>
          <span class="pill">WebAssembly</span>
          <span class="pill">Gamepad API</span>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .portfolio-footer {
      margin-top: 36px;
      padding: 24px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
      border-top: 1px solid var(--border-neon);
    }

    .footer-brand {
      display: flex;
      flex-direction: column;
      gap: 6px;
      max-width: 420px;
    }

    .brand-title {
      font-size: 18px;
      font-weight: 900;
    }

    .brand-desc {
      font-size: 12px;
      color: var(--text-muted);
      line-height: 1.4;
    }

    .footer-credits {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
    }

    .credit-tag {
      font-size: 9px;
      background: rgba(255, 0, 127, 0.15);
      border: 1px solid rgba(255, 0, 127, 0.4);
      color: var(--accent-magenta);
      padding: 2px 8px;
      border-radius: 4px;
    }

    .author-info {
      font-size: 13px;
      color: var(--text-bright);
    }

    .tech-stack-pills {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .pill {
      font-size: 10px;
      background: rgba(0, 240, 255, 0.1);
      border: 1px solid var(--border-neon);
      color: var(--accent-cyan);
      padding: 2px 6px;
      border-radius: 4px;
    }
  `]
})
export class FooterComponent {}
