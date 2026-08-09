import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'library',
        loadComponent: () => import('./features/library/library.component').then((m) => m.LibraryComponent),
      },
      {
        path: 'favorites',
        loadComponent: () => import('./features/favorites/favorites.component').then((m) => m.FavoritesComponent),
      },
      {
        path: 'platforms',
        loadComponent: () => import('./features/platforms-view/platforms-view.component').then((m) => m.PlatformsViewComponent),
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then((m) => m.SettingsComponent),
      },
      {
        path: 'player/:gameId',
        loadComponent: () => import('./features/player/player.component').then((m) => m.PlayerComponent),
      },
      {
        path: 'admin',
        canActivate: [roleGuard],
        children: [
          {
            path: '',
            loadComponent: () => import('./features/admin/admin.component').then((m) => m.AdminComponent),
          },
          {
            path: 'users',
            loadComponent: () => import('./features/admin/users/admin-users.component').then((m) => m.AdminUsersComponent),
          },
          {
            path: 'games',
            loadComponent: () => import('./features/admin/games/admin-games.component').then((m) => m.AdminGamesComponent),
          },
          {
            path: 'platforms',
            loadComponent: () => import('./features/admin/platforms/admin-platforms.component').then((m) => m.AdminPlatformsComponent),
          },
          {
            path: 'logs',
            loadComponent: () => import('./features/admin/logs/admin-logs.component').then((m) => m.AdminLogsComponent),
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
