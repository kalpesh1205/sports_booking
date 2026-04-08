import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-wrapper">
      <div class="auth-bg">
        <div class="bg-orb orb-1"></div>
        <div class="bg-orb orb-2"></div>
      </div>

      <div class="auth-card fade-in">
        <div class="auth-header">
          <div class="auth-icon">🏟️</div>
          <h1 class="auth-title">Welcome Back</h1>
          <p class="auth-subtitle">Sign in to book your sports venue</p>
        </div>

        <div *ngIf="error" class="alert alert-error">⚠️ {{ error }}</div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">Username</label>
            <input type="text" formControlName="username" class="form-control"
              placeholder="Enter your username" autocomplete="username">
            <span *ngIf="f['username'].touched && f['username'].errors?.['required']" class="form-error">
              Username is required
            </span>
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <div class="input-icon-wrap">
              <input [type]="showPass ? 'text' : 'password'" formControlName="password"
                class="form-control" placeholder="Enter your password" autocomplete="current-password">
              <button type="button" class="toggle-pass" (click)="showPass = !showPass">
                {{ showPass ? '🙈' : '👁️' }}
              </button>
            </div>
            <span *ngIf="f['password'].touched && f['password'].errors?.['required']" class="form-error">
              Password is required
            </span>
          </div>

          <button type="submit" class="btn btn-primary btn-lg w-full" [disabled]="loading">
            <span *ngIf="loading" class="btn-spinner"></span>
            {{ loading ? 'Signing in…' : 'Sign In' }}
          </button>
        </form>

        <div class="auth-footer">
          <p>Don't have an account? <a routerLink="/register">Create one</a></p>
        </div>

        <div class="demo-credentials">
          <p class="demo-label">Demo Credentials</p>
          <div class="demo-rows">
            <button class="demo-btn" (click)="fillDemo('admin','admin123')">
              <span class="demo-badge">Admin</span> admin / admin123
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      padding: 24px; position: relative; overflow: hidden;
    }
    .auth-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
    .bg-orb {
      position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.12;
    }
    .orb-1 { width: 500px; height: 500px; background: var(--primary); top: -100px; right: -100px; }
    .orb-2 { width: 400px; height: 400px; background: var(--accent); bottom: -100px; left: -100px; }

    .auth-card {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-xl); padding: 40px; width: 100%; max-width: 440px;
      position: relative; z-index: 1; box-shadow: var(--shadow-lg);
    }
    .auth-header { text-align: center; margin-bottom: 32px; }
    .auth-icon { font-size: 3rem; margin-bottom: 12px; }
    .auth-title { font-size: 1.8rem; margin-bottom: 8px; }
    .auth-subtitle { color: var(--text-secondary); font-size: 0.95rem; }

    .input-icon-wrap { position: relative; }
    .toggle-pass {
      position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer; font-size: 1rem; padding: 4px;
    }

    .w-full { width: 100%; justify-content: center; margin-top: 8px; }
    .btn-spinner {
      width: 16px; height: 16px; border: 2px solid rgba(0,0,0,0.3);
      border-top-color: #000; border-radius: 50%; animation: spin 0.7s linear infinite;
    }

    .auth-footer { text-align: center; margin-top: 20px; color: var(--text-secondary); font-size: 0.9rem; }

    .demo-credentials {
      margin-top: 20px; padding: 14px; background: var(--bg-elevated);
      border-radius: var(--radius); border: 1px dashed var(--border);
    }
    .demo-label { font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .demo-btn {
      display: flex; align-items: center; gap: 8px; width: 100%;
      background: none; border: none; cursor: pointer; color: var(--text-secondary);
      font-size: 0.85rem; padding: 6px 0; text-align: left;
      transition: var(--transition);
    }
    .demo-btn:hover { color: var(--text-primary); }
    .demo-badge {
      font-size: 0.72rem; padding: 2px 8px; border-radius: 100px;
      background: rgba(255,112,67,0.15); color: var(--accent); font-weight: 600;
    }
  `]
})
export class LoginComponent {
  form: FormGroup;
  error = '';
  loading = false;
  showPass = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  get f() { return this.form.controls; }

  fillDemo(username: string, password: string) {
    this.form.patchValue({ username, password });
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error = '';

    this.authService.login(this.form.value).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/venues';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.error = err.error?.message || 'Invalid username or password';
        this.loading = false;
      }
    });
  }
}
