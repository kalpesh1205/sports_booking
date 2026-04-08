import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ThemeService, ThemeMode } from '../../services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="navbar-inner">
        <a routerLink="/" class="logo">
          <span class="logo-icon">🏟️</span>
          <span class="logo-text">SportBook</span>
        </a>

        <div class="nav-links">
          <a routerLink="/venues" routerLinkActive="active" class="nav-link">Venues</a>
          <ng-container *ngIf="isLoggedIn">
            <a routerLink="/my-bookings" routerLinkActive="active" class="nav-link">My Bookings</a>
            <a *ngIf="isAdmin" routerLink="/admin" routerLinkActive="active" class="nav-link admin-link">
              ⚡ Admin
            </a>
          </ng-container>
        </div>

        <div class="nav-actions">
          <button class="btn btn-outline btn-sm theme-toggle-btn" (click)="toggleTheme()">
            {{ themeMode === 'dark' ? '🌙 Dark' : '☀️ Light' }}
          </button>
          <ng-container *ngIf="!isLoggedIn">
            <a routerLink="/login" class="btn btn-outline btn-sm">Login</a>
            <a routerLink="/register" class="btn btn-primary btn-sm">Sign Up</a>
          </ng-container>
          <ng-container *ngIf="isLoggedIn">
            <div class="user-menu">
              <div class="user-avatar">{{ username?.charAt(0)?.toUpperCase() }}</div>
              <div class="user-info">
                <span class="user-name">{{ username }}</span>
                <span class="user-role" [class.role-admin]="isAdmin">{{ isAdmin ? 'Admin' : 'User' }}</span>
              </div>
              <button class="btn btn-outline btn-sm" (click)="logout()">Logout</button>
            </div>
          </ng-container>
        </div>

        <!-- Mobile Menu Button -->
        <button class="mobile-menu-btn" (click)="menuOpen = !menuOpen">
          <span></span><span></span><span></span>
        </button>
      </div>

      <!-- Mobile Dropdown -->
      <div class="mobile-menu" [class.open]="menuOpen" (click)="menuOpen = false">
        <a routerLink="/venues" class="mobile-nav-link">🏟️ Venues</a>
        <ng-container *ngIf="isLoggedIn">
          <a routerLink="/my-bookings" class="mobile-nav-link">📅 My Bookings</a>
          <a *ngIf="isAdmin" routerLink="/admin" class="mobile-nav-link">⚡ Admin Panel</a>
        </ng-container>
        <ng-container *ngIf="!isLoggedIn">
          <a routerLink="/login" class="mobile-nav-link">Login</a>
          <a routerLink="/register" class="mobile-nav-link">Sign Up</a>
        </ng-container>
        <button class="mobile-nav-link theme-mobile-btn" (click)="toggleTheme()">
          {{ themeMode === 'dark' ? '🌙 Switch to Light' : '☀️ Switch to Dark' }}
        </button>
        <button *ngIf="isLoggedIn" class="mobile-nav-link logout-btn" (click)="logout()">Logout</button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: sticky; top: 0; z-index: 100;
      background: var(--navbar-bg);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
    }
    .navbar-inner {
      max-width: 1200px; margin: 0 auto;
      padding: 0 24px; height: 64px;
      display: flex; align-items: center; gap: 32px;
    }
    .logo {
      display: flex; align-items: center; gap: 10px;
      text-decoration: none; flex-shrink: 0;
    }
    .logo-icon { font-size: 1.5rem; }
    .logo-text {
      font-family: 'Outfit', sans-serif;
      font-size: 1.3rem; font-weight: 800;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .nav-links { display: flex; align-items: center; gap: 4px; flex: 1; }
    .nav-link {
      padding: 6px 14px; border-radius: var(--radius-sm);
      color: var(--text-secondary); font-size: 0.9rem; font-weight: 500;
      text-decoration: none; transition: var(--transition);
    }
    .nav-link:hover { color: var(--text-primary); background: var(--bg-card); }
    .nav-link.active { color: var(--primary); background: rgba(0,200,150,0.08); }
    .admin-link { color: var(--accent) !important; }
    .admin-link.active { background: rgba(255,112,67,0.08) !important; }

    .nav-actions { display: flex; align-items: center; gap: 10px; margin-left: auto; }
    .user-menu { display: flex; align-items: center; gap: 10px; }
    .user-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: #000; font-weight: 700; font-size: 0.9rem;
      display: flex; align-items: center; justify-content: center;
    }
    .user-info { display: flex; flex-direction: column; line-height: 1.2; }
    .user-name { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); }
    .user-role { font-size: 0.72rem; color: var(--text-secondary); }
    .user-role.role-admin { color: var(--accent); }

    .mobile-menu-btn {
      display: none; flex-direction: column; gap: 5px;
      background: none; border: none; cursor: pointer; padding: 6px; margin-left: auto;
    }
    .mobile-menu-btn span {
      display: block; width: 22px; height: 2px;
      background: var(--text-secondary); border-radius: 2px; transition: var(--transition);
    }
    .mobile-menu {
      display: none; flex-direction: column;
      background: var(--bg-secondary); border-top: 1px solid var(--border);
      padding: 8px 16px 16px;
    }
    .mobile-menu.open { display: flex; }
    .mobile-nav-link {
      padding: 12px 8px; color: var(--text-secondary); font-size: 0.95rem;
      text-decoration: none; border-bottom: 1px solid var(--border-light); display: block;
    }
    .mobile-nav-link:last-child { border-bottom: none; }
    .logout-btn { background: none; border: none; cursor: pointer; text-align: left; width: 100%; color: var(--error); }
    .theme-toggle-btn { min-width: 90px; justify-content: center; }
    .theme-mobile-btn { background: none; border: none; cursor: pointer; text-align: left; width: 100%; color: var(--text-primary); }

    @media (max-width: 768px) {
      .nav-links, .nav-actions { display: none; }
      .mobile-menu-btn { display: flex; }
    }
  `]
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;
  username: string | null = null;
  menuOpen = false;
  themeMode: ThemeMode = 'dark';

  constructor(private authService: AuthService, private router: Router, private themeService: ThemeService) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.refreshState();
    });
  }

  ngOnInit() {
    this.refreshState();
    this.themeMode = this.themeService.getTheme();
  }

  refreshState() {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.isAdmin();
    this.username = this.authService.getUsername();
  }

  logout() {
    this.authService.logout();
    this.refreshState();
    this.router.navigate(['/login']);
  }

  toggleTheme() {
    this.themeMode = this.themeService.toggleTheme();
  }
}
