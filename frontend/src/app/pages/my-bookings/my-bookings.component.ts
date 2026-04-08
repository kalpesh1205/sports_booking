import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingService, Booking } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-wrapper fade-in">
      <div class="page-header">
        <div>
          <h1 class="section-title">My Bookings</h1>
          <p class="section-subtitle">Manage your sports venue bookings</p>
        </div>
        <a routerLink="/venues" class="btn btn-primary">+ Book New Slot</a>
      </div>

      <!-- Stats -->
      <div class="booking-stats" *ngIf="!loading && bookings.length > 0">
        <div class="stat-box">
          <span class="stat-num">{{ totalBookings }}</span>
          <span class="stat-lbl">Total Bookings</span>
        </div>
        <div class="stat-box active">
          <span class="stat-num">{{ activeBookings }}</span>
          <span class="stat-lbl">Active</span>
        </div>
        <div class="stat-box cancelled">
          <span class="stat-num">{{ cancelledBookings }}</span>
          <span class="stat-lbl">Cancelled</span>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="tab-bar" *ngIf="!loading && bookings.length > 0">
        <button class="tab" [class.active]="activeTab === 'all'" (click)="setTab('all')">All</button>
        <button class="tab" [class.active]="activeTab === 'CONFIRMED'" (click)="setTab('CONFIRMED')">Active</button>
        <button class="tab" [class.active]="activeTab === 'CANCELLED'" (click)="setTab('CANCELLED')">Cancelled</button>
      </div>

      <div *ngIf="loading" class="spinner"></div>
      <div *ngIf="error" class="alert alert-error">{{ error }}</div>
      <div *ngIf="cancelSuccess" class="alert alert-success">✅ Booking cancelled successfully</div>

      <!-- Booking List -->
      <div class="bookings-list" *ngIf="!loading">
        <div *ngFor="let booking of filteredBookings" class="booking-card">
          <div class="booking-left">
            <div class="booking-sport-badge">{{ getSportIcon(booking.venue.sportType) }}</div>
            <div class="booking-info">
              <h3 class="booking-venue-name">{{ booking.venue.name }}</h3>
              <div class="booking-meta">
                <span>📍 {{ booking.venue.location }}</span>
                <span>🗓️ {{ formatDate(booking.timeSlot) }}</span>
                <span>⏰ {{ formatTime(booking.timeSlot) }}</span>
              </div>
            </div>
          </div>
          <div class="booking-right">
            <span class="price-tag">₹{{ booking.venue.pricePerHour }}</span>
            <span class="badge" [class.badge-success]="booking.status === 'CONFIRMED'" [class.badge-error]="booking.status === 'CANCELLED'">
              {{ booking.status }}
            </span>
            <button *ngIf="booking.status === 'CONFIRMED'" class="btn btn-danger btn-sm"
              (click)="cancel(booking.id)" [disabled]="cancellingId === booking.id">
              {{ cancellingId === booking.id ? 'Cancelling…' : 'Cancel' }}
            </button>
          </div>
        </div>

        <div *ngIf="filteredBookings.length === 0" class="empty-state">
          <div class="empty-icon">📅</div>
          <h3>No bookings here</h3>
          <p>You have no {{ activeTab !== 'all' ? activeTab.toLowerCase() : '' }} bookings</p>
          <a routerLink="/venues" class="btn btn-primary" style="margin-top:16px">Browse Venues</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-bottom: 28px; }

    .booking-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 24px; }
    .stat-box {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 16px; text-align: center;
    }
    .stat-box.active { border-color: rgba(63,185,80,0.3); background: rgba(63,185,80,0.05); }
    .stat-box.cancelled { border-color: rgba(248,81,73,0.3); background: rgba(248,81,73,0.05); }
    .stat-num { display: block; font-size: 2rem; font-weight: 800; color: var(--primary); }
    .stat-box.active .stat-num { color: var(--success); }
    .stat-box.cancelled .stat-num { color: var(--error); }
    .stat-lbl { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }

    .tab-bar { display: flex; gap: 4px; margin-bottom: 20px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 4px; width: fit-content; }
    .tab {
      padding: 6px 18px; border-radius: calc(var(--radius) - 2px);
      background: none; border: none; cursor: pointer;
      color: var(--text-secondary); font-size: 0.88rem; font-weight: 500;
      transition: var(--transition);
    }
    .tab.active { background: var(--primary); color: #000; font-weight: 700; }

    .bookings-list { display: flex; flex-direction: column; gap: 12px; }
    .booking-card {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 18px 20px;
      display: flex; align-items: center; justify-content: space-between;
      gap: 16px; transition: var(--transition);
    }
    .booking-card:hover { border-color: var(--primary); }
    .booking-left { display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0; }
    .booking-sport-badge {
      width: 48px; height: 48px; border-radius: var(--radius);
      background: var(--bg-elevated); font-size: 1.6rem;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .booking-venue-name { font-size: 1rem; font-weight: 700; margin-bottom: 4px; }
    .booking-meta { display: flex; gap: 12px; flex-wrap: wrap; }
    .booking-meta span { font-size: 0.8rem; color: var(--text-secondary); }
    .booking-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
    .price-tag { font-weight: 700; color: var(--primary); font-size: 1rem; }
  `]
})
export class MyBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  loading = true;
  error = '';
  cancelSuccess = false;
  cancellingId: number | null = null;
  activeTab = 'all';

  get totalBookings() { return this.bookings.length; }
  get activeBookings() { return this.bookings.filter(b => b.status === 'CONFIRMED').length; }
  get cancelledBookings() { return this.bookings.filter(b => b.status === 'CANCELLED').length; }

  constructor(private bookingService: BookingService, private authService: AuthService) {}

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.loading = true;
    this.bookingService.getMyBookings().subscribe({
      next: (b) => { this.bookings = b; this.applyTab(); this.loading = false; },
      error: () => { this.error = 'Failed to load bookings.'; this.loading = false; }
    });
  }

  setTab(tab: string) { this.activeTab = tab; this.applyTab(); }

  applyTab() {
    if (this.activeTab === 'all') this.filteredBookings = this.bookings;
    else this.filteredBookings = this.bookings.filter(b => b.status === this.activeTab);
  }

  cancel(id: number) {
    if (!confirm('Cancel this booking?')) return;
    this.cancellingId = id;
    this.cancelSuccess = false;
    this.bookingService.cancel(id).subscribe({
      next: () => {
        this.cancelSuccess = true;
        this.cancellingId = null;
        this.loadBookings();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to cancel booking.';
        this.cancellingId = null;
      }
    });
  }

  getSportIcon(sport: string): string {
    const icons: Record<string, string> = {
      Cricket: '🏏', Football: '⚽', Basketball: '🏀',
      Tennis: '🎾', Badminton: '🏸', Swimming: '🏊', Default: '🏟️'
    };
    return icons[sport] || icons['Default'];
  }

  formatDate(slot: string): string {
    const date = slot?.split('_')[0] || '';
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  formatTime(slot: string): string { return slot?.split('_')[1] || slot || ''; }
}
