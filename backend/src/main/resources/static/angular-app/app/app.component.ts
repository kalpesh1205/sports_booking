import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <a class="navbar-brand" routerLink="/venues">Sports Booking</a>
        <div class="navbar-nav ms-auto">
          <a class="nav-link" routerLink="/venues">Venues</a>
          <a class="nav-link" routerLink="/bookings">My Bookings</a>
          <a *ngIf="!isLoggedIn" class="nav-link" routerLink="/auth">Login</a>
          <a *ngIf="isLoggedIn" class="nav-link" (click)="logout()" href="javascript:void(0)">Logout</a>
        </div>
      </div>
    </nav>

    <div class="container mt-4">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .navbar-nav .nav-link {
      color: rgba(255,255,255,.75) !important;
      cursor: pointer;
    }
    .navbar-nav .nav-link:hover {
      color: white !important;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'Sports Booking System';
  isLoggedIn = false;

  constructor(private router: Router) { }

  ngOnInit() {
    this.checkLoginStatus();
  }

  checkLoginStatus() {
    const user = localStorage.getItem('currentUser');
    this.isLoggedIn = !!user;
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.isLoggedIn = false;
    this.router.navigate(['/auth']);
  }
}