import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VenueService, Venue } from '../../services/venue.service';
import { BookingService, Booking } from '../../services/booking.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-wrapper fade-in">
      <div class="admin-header">
        <div>
          <h1 class="section-title">⚡ Admin Dashboard</h1>
          <p class="section-subtitle">Manage venues and monitor all bookings</p>
        </div>
        <a routerLink="/admin/venues/add" class="btn btn-accent">+ Add Venue</a>
      </div>

      <!-- Overview Stats -->
      <div class="admin-stats-grid">
        <div class="admin-stat-card primary">
          <div class="stat-icon">🏟️</div>
          <div class="stat-content">
            <span class="stat-big">{{ venues.length }}</span>
            <span class="stat-title">Total Venues</span>
          </div>
        </div>
        <div class="admin-stat-card success">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <span class="stat-big">{{ confirmedCount }}</span>
            <span class="stat-title">Active Bookings</span>
          </div>
        </div>
        <div class="admin-stat-card warning">
          <div class="stat-icon">❌</div>
          <div class="stat-content">
            <span class="stat-big">{{ cancelledCount }}</span>
            <span class="stat-title">Cancelled</span>
          </div>
        </div>
        <div class="admin-stat-card info">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <span class="stat-big">₹{{ totalRevenue.toLocaleString() }}</span>
            <span class="stat-title">Est. Revenue</span>
          </div>
        </div>
      </div>

      <!-- Venues Management -->
      <div class="admin-section">
        <div class="section-header">
          <h2 class="admin-section-title">Venues</h2>
          <a routerLink="/admin/venues/add" class="btn btn-primary btn-sm">+ Add New</a>
        </div>
        <div *ngIf="venueLoading" class="spinner"></div>
        <div *ngIf="deleteSuccess" class="alert alert-success">✅ Venue deleted</div>
        <div *ngIf="deleteError" class="alert alert-error">{{ deleteError }}</div>
        <div class="admin-table-wrap" *ngIf="!venueLoading">
          <table class="admin-table">
            <thead>
              <tr>
                <th>#</th><th>Name</th><th>Sport</th><th>Location</th><th>Capacity</th><th>Price/Hr</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let v of venues" class="table-row">
                <td class="id-cell">{{ v.id }}</td>
                <td><span class="venue-cell-name">{{ v.name }}</span></td>
                <td><span class="badge badge-primary">{{ v.sportType }}</span></td>
                <td class="text-muted">{{ v.location }}</td>
                <td>{{ v.capacity }}</td>
                <td><span class="text-primary fw-bold">₹{{ v.pricePerHour }}</span></td>
                <td>
                  <div class="action-btns">
                    <a [routerLink]="['/admin/venues/edit', v.id]" class="btn btn-outline btn-sm">Edit</a>
                    <button class="btn btn-danger btn-sm" (click)="deleteVenue(v.id!)" [disabled]="deletingId === v.id">
                      {{ deletingId === v.id ? '…' : 'Delete' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div *ngIf="venues.length === 0" class="empty-state" style="padding:32px">
            <p>No venues yet. <a routerLink="/admin/venues/add">Add one →</a></p>
          </div>
        </div>
      </div>

      <!-- All Bookings -->
      <div class="admin-section">
        <h2 class="admin-section-title">All Bookings</h2>
        <div *ngIf="bookingLoading" class="spinner"></div>
        <div class="admin-table-wrap" *ngIf="!bookingLoading">
          <table class="admin-table">
            <thead>
              <tr><th>#</th><th>User</th><th>Venue</th><th>Date & Slot</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let b of bookings" class="table-row">
                <td class="id-cell">{{ b.id }}</td>
                <td>
                  <div style="line-height:1.2">
                    <span style="font-weight:600">{{ b.user.username }}</span><br>
                    <span class="text-muted" style="font-size:0.75rem">{{ b.user.email }}</span>
                  </div>
                </td>
                <td>{{ b.venue.name }}</td>
                <td class="text-muted" style="font-size:0.82rem">{{ formatSlot(b.timeSlot) }}</td>
                <td>
                  <span class="badge" [class.badge-success]="b.status==='CONFIRMED'" [class.badge-error]="b.status==='CANCELLED'">
                    {{ b.status }}
                  </span>
                </td>
                <td>
                  <button *ngIf="b.status==='CONFIRMED'" class="btn btn-danger btn-sm"
                    (click)="cancelBooking(b.id)" [disabled]="cancellingId === b.id">
                    Cancel
                  </button>
                  <span *ngIf="b.status==='CANCELLED'" class="text-muted" style="font-size:0.8rem">—</span>
                </td>
              </tr>
            </tbody>
          </table>
          <div *ngIf="bookings.length === 0" class="empty-state" style="padding:32px"><p>No bookings yet</p></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-bottom: 28px; }

    .admin-stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .admin-stat-card {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 20px;
      display: flex; align-items: center; gap: 16px;
      transition: var(--transition);
    }
    .admin-stat-card:hover { transform: translateY(-2px); }
    .admin-stat-card.primary { border-color: rgba(0,200,150,0.3); }
    .admin-stat-card.success { border-color: rgba(63,185,80,0.3); }
    .admin-stat-card.warning { border-color: rgba(210,153,34,0.3); }
    .admin-stat-card.info { border-color: rgba(88,166,255,0.3); }
    .stat-icon { font-size: 2rem; }
    .stat-big { display: block; font-size: 1.8rem; font-weight: 800; color: var(--primary); }
    .admin-stat-card.success .stat-big { color: var(--success); }
    .admin-stat-card.warning .stat-big { color: var(--warning); }
    .admin-stat-card.info .stat-big { color: var(--info); }
    .stat-title { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }

    .admin-section { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-xl); padding: 24px; margin-bottom: 24px; }
    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .admin-section-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 16px; }

    .admin-table-wrap { overflow-x: auto; }
    .admin-table { width: 100%; border-collapse: collapse; }
    .admin-table th {
      text-align: left; padding: 10px 12px;
      font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.5px; color: var(--text-muted);
      border-bottom: 1px solid var(--border);
    }
    .table-row td { padding: 12px; border-bottom: 1px solid var(--border-light); vertical-align: middle; font-size: 0.9rem; }
    .table-row:last-child td { border-bottom: none; }
    .table-row:hover { background: var(--bg-elevated); }
    .id-cell { color: var(--text-muted); font-size: 0.8rem; }
    .venue-cell-name { font-weight: 600; }
    .text-muted { color: var(--text-muted); }
    .text-primary { color: var(--primary); }
    .fw-bold { font-weight: 700; }
    .action-btns { display: flex; gap: 6px; }
  `]
})
export class AdminComponent implements OnInit {
  venues: Venue[] = [];
  bookings: Booking[] = [];
  venueLoading = true;
  bookingLoading = true;
  deleteSuccess = false;
  deleteError = '';
  deletingId: number | null = null;
  cancellingId: number | null = null;

  get confirmedCount() { return this.bookings.filter(b => b.status === 'CONFIRMED').length; }
  get cancelledCount() { return this.bookings.filter(b => b.status === 'CANCELLED').length; }
  get totalRevenue() {
    return this.bookings
      .filter(b => b.status === 'CONFIRMED')
      .reduce((sum, b) => sum + b.venue.pricePerHour, 0);
  }

  constructor(private venueService: VenueService, private bookingService: BookingService) {}

  ngOnInit() {
    this.venueService.getAll().subscribe({ next: v => { this.venues = v; this.venueLoading = false; }, error: () => this.venueLoading = false });
    this.bookingService.getAllBookings().subscribe({ next: b => { this.bookings = b; this.bookingLoading = false; }, error: () => this.bookingLoading = false });
  }

  deleteVenue(id: number) {
    if (!confirm('Delete this venue? All bookings will be affected.')) return;
    this.deletingId = id; this.deleteSuccess = false; this.deleteError = '';
    this.venueService.delete(id).subscribe({
      next: () => { this.venues = this.venues.filter(v => v.id !== id); this.deletingId = null; this.deleteSuccess = true; },
      error: (err) => { this.deleteError = err.error?.message || 'Delete failed'; this.deletingId = null; }
    });
  }

  cancelBooking(id: number) {
    if (!confirm('Cancel this booking?')) return;
    this.cancellingId = id;
    this.bookingService.cancel(id).subscribe({
      next: () => { const b = this.bookings.find(x => x.id === id); if (b) b.status = 'CANCELLED'; this.cancellingId = null; },
      error: () => this.cancellingId = null
    });
  }

  formatSlot(slot: string): string { return slot?.replace('_', ' | ') || ''; }
}
