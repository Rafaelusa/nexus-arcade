import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
  template: `
    <div class="shell-container">
      <app-header></app-header>
      <div class="content-body">
        <app-sidebar></app-sidebar>
        <main class="page-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .shell-container {
      max-width: 1300px;
      margin: 0 auto;
      padding: 20px;
      min-height: 100vh;
    }

    .content-body {
      display: flex;
      gap: 24px;
    }

    .page-content {
      flex: 1;
    }
  `]
})
export class ShellComponent {}
