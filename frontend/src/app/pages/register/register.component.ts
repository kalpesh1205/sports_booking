import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
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
          <div class="auth-icon">⚽</div>
          <h1 class="auth-title">Create Account</h1>
          <p class="auth-subtitle">Join thousands of sports enthusiasts</p>
        </div>

        <div *ngIf="error" class="alert alert-error">⚠️ {{ error }}</div>
        <div *ngIf="success" class="alert alert-success">✅ {{ success }}</div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">Username</label>
            <input type="text" formControlName="username" class="form-control" placeholder="Choose a username">
            <span *ngIf="f['username'].touched && f['username'].errors?.['required']" class="form-error">Username is required</span>
            <span *ngIf="f['username'].touched && f['username'].errors?.['minlength']" class="form-error">Minimum 3 characters</span>
          </div>

          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" formControlName="email" class="form-control" placeholder="your@email.com">
            <span *ngIf="f['email'].touched && f['email'].errors?.['email']" class="form-error">Enter a valid email</span>
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" formControlName="password" class="form-control" placeholder="Min 6 characters">
            <span *ngIf="f['password'].touched && f['password'].errors?.['required']" class="form-error">Password is required</span>
            <span *ngIf="f['password'].touched && f['password'].errors?.['minlength']" class="form-error">Minimum 6 characters</span>
          </div>

          <div class="strength-bar" *ngIf="f['password'].value">
            <div class="strength-fill" [style.width]="strengthWidth" [style.background]="strengthColor"></div>
          </div>
          <p class="strength-label" *ngIf="f['password'].value" [style.color]="strengthColor">{{ strengthLabel }}</p>

          <button type="submit" class="btn btn-primary btn-lg w-full" [disabled]="loading">
            <span *ngIf="loading" class="btn-spinner"></span>
            {{ loading ? 'Creating…' : 'Create Account' }}
          </button>
        </form>

        <div class="auth-footer">
          <p>Already have an account? <a routerLink="/login">Sign in</a></p>
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
    .bg-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.12; }
    .orb-1 { width: 500px; height: 500px; background: var(--primary); top: -100px; left: -100px; }
    .orb-2 { width: 400px; height: 400px; background: var(--accent); bottom: -100px; right: -100px; }

    .auth-card {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-xl); padding: 40px; width: 100%; max-width: 440px;
      position: relative; z-index: 1; box-shadow: var(--shadow-lg);
    }
    .auth-header { text-align: center; margin-bottom: 28px; }
    .auth-icon { font-size: 3rem; margin-bottom: 12px; }
    .auth-title { font-size: 1.8rem; margin-bottom: 8px; }
    .auth-subtitle { color: var(--text-secondary); font-size: 0.95rem; }

    .strength-bar { height: 4px; background: var(--border); border-radius: 2px; margin-top: 6px; overflow: hidden; }
    .strength-fill { height: 100%; transition: all 0.3s ease; border-radius: 2px; }
    .strength-label { font-size: 0.78rem; margin-top: 4px; }

    .w-full { width: 100%; justify-content: center; margin-top: 8px; }
    .btn-spinner {
      width: 16px; height: 16px; border: 2px solid rgba(0,0,0,0.3);
      border-top-color: #000; border-radius: 50%; animation: spin 0.7s linear infinite;
    }
    .auth-footer { text-align: center; margin-top: 20px; color: var(--text-secondary); font-size: 0.9rem; }
  `]
})
export class RegisterComponent {
  form: FormGroup;
  error = ''; success = ''; loading = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() { return this.form.controls; }

  get strengthWidth(): string {
    const p = this.f['password'].value || '';
    if (p.length < 6) return '25%';
    if (p.length < 10) return '60%';
    return '100%';
  }

  get strengthColor(): string {
    const p = this.f['password'].value || '';
    if (p.length < 6) return 'var(--error)';
    if (p.length < 10) return 'var(--warning)';
    return 'var(--success)';
  }

  get strengthLabel(): string {
    const p = this.f['password'].value || '';
    if (p.length < 6) return 'Weak';
    if (p.length < 10) return 'Moderate';
    return 'Strong';
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true; this.error = ''; this.success = '';

    this.authService.register(this.form.value).subscribe({
      next: () => {
        this.success = 'Account created! Redirecting to login…';
        setTimeout(() => this.router.navigate(['/login']), 1800);
      },
      error: (err) => {
        this.error = err.error?.message || 'Registration failed. Try a different username.';
        this.loading = false;
      }
    });
  }
}
