import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, User } from '../services/api.service';

@Component({
  selector: 'app-auth',
  template: `
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <ul class="nav nav-tabs card-header-tabs">
              <li class="nav-item">
                <a class="nav-link" [class.active]="activeTab === 'login'"
                   (click)="activeTab = 'login'" href="javascript:void(0)">Login</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" [class.active]="activeTab === 'register'"
                   (click)="activeTab = 'register'" href="javascript:void(0)">Register</a>
              </li>
            </ul>
          </div>
          <div class="card-body">
            <!-- Login Form -->
            <div *ngIf="activeTab === 'login'">
              <h5 class="card-title">Login</h5>
              <form (ngSubmit)="login()" #loginForm="ngForm">
                <div class="mb-3">
                  <label class="form-label">Username</label>
                  <input type="text" class="form-control" [(ngModel)]="loginUser.username"
                         name="username" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Password</label>
                  <input type="password" class="form-control" [(ngModel)]="loginUser.password"
                         name="password" required>
                </div>
                <button type="submit" class="btn btn-primary" [disabled]="!loginForm.valid">
                  Login
                </button>
              </form>
            </div>

            <!-- Register Form -->
            <div *ngIf="activeTab === 'register'">
              <h5 class="card-title">Register</h5>
              <form (ngSubmit)="register()" #registerForm="ngForm">
                <div class="mb-3">
                  <label class="form-label">Username</label>
                  <input type="text" class="form-control" [(ngModel)]="registerUser.username"
                         name="username" required minlength="3">
                </div>
                <div class="mb-3">
                  <label class="form-label">Password</label>
                  <input type="password" class="form-control" [(ngModel)]="registerUser.password"
                         name="password" required minlength="6">
                </div>
                <button type="submit" class="btn btn-success" [disabled]="!registerForm.valid">
                  Register
                </button>
              </form>
            </div>
          </div>
        </div>

        <div *ngIf="message" class="alert alert-info mt-3">
          {{ message }}
        </div>
      </div>
    </div>
  `
})
export class AuthComponent {
  activeTab = 'login';
  loginUser: User = { username: '', password: '' };
  registerUser: User = { username: '', password: '' };
  message = '';

  constructor(private apiService: ApiService, private router: Router) { }

  login() {
    this.apiService.login(this.loginUser).subscribe({
      next: (user) => {
        this.message = 'Login successful!';
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.router.navigate(['/venues']);
      },
      error: (error) => {
        this.message = 'Login failed: ' + error.error;
      }
    });
  }

  register() {
    this.apiService.register(this.registerUser).subscribe({
      next: (response) => {
        this.message = 'Registration successful! Please login.';
        this.activeTab = 'login';
        this.registerUser = { username: '', password: '' };
      },
      error: (error) => {
        this.message = 'Registration failed: ' + error.error;
      }
    });
  }
}