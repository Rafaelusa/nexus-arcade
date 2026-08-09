import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ShellComponent } from './layout/shell/shell.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LibraryComponent } from './features/library/library.component';
import { FavoritesComponent } from './features/favorites/favorites.component';
import { PlatformsViewComponent } from './features/platforms-view/platforms-view.component';
import { SettingsComponent } from './features/settings/settings.component';
import { PlayerComponent } from './features/player/player.component';
import { AdminComponent } from './features/admin/admin.component';
import { AdminUsersComponent } from './features/admin/users/admin-users.component';
import { AdminGamesComponent } from './features/admin/games/admin-games.component';
import { AdminPlatformsComponent } from './features/admin/platforms/admin-platforms.component';
import { AdminLogsComponent } from './features/admin/logs/admin-logs.component';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'library', component: LibraryComponent },
      { path: 'favorites', component: FavoritesComponent },
      { path: 'platforms', component: PlatformsViewComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'player/:gameId', component: PlayerComponent },
      {
        path: 'admin',
        canActivate: [roleGuard],
        children: [
          { path: '', component: AdminComponent },
          { path: 'users', component: AdminUsersComponent },
          { path: 'games', component: AdminGamesComponent },
          { path: 'platforms', component: AdminPlatformsComponent },
          { path: 'logs', component: AdminLogsComponent },
        ],
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
