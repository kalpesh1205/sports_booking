import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VenueService, Venue } from '../../services/venue.service';
import { AuthService } from '../../services/auth.service';
import { BookingService } from '../../services/booking.service';

const SPORT_ICONS: Record<string, string> = {
  Cricket: '🏏', Football: '⚽', Basketball: '🏀',
  Tennis: '🎾', Badminton: '🏸', Swimming: '🏊',
  Volleyball: '🏐', Hockey: '🏑', Default: '🏟️'
};

@Component({
  selector: 'app-venues',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-wrapper fade-in">
      <!-- Hero -->
      <div class="hero">
        <h1 class="section-title">Book Your Perfect Venue</h1>
        <p class="section-subtitle">Find and book sports courts & venues near you</p>
        <div class="hero-visual-strip">
          <div class="hero-visual visual-one"></div>
          <div class="hero-visual visual-two"></div>
          <div class="hero-visual visual-three"></div>
        </div>

        <!-- Search & Filter Bar -->
        <div class="filter-bar">
          <div class="search-wrap">
            <span class="search-icon">🔍</span>
            <input type="text" [(ngModel)]="searchTerm" placeholder="Search venues…"
              class="search-input" (ngModelChange)="applyFilters()">
          </div>
          <input type="date" [(ngModel)]="selectedDate" class="form-control filter-select" (ngModelChange)="onAvailabilityFilterChange()">
          <select [(ngModel)]="selectedTimeSlot" class="form-control filter-select" (ngModelChange)="onAvailabilityFilterChange()">
            <option value="">Any Slot</option>
            <option *ngFor="let slot of timeSlots" [value]="slot">{{ slot }}</option>
          </select>
          <select [(ngModel)]="selectedSport" class="form-control filter-select" (ngModelChange)="applyFilters()">
            <option value="">All Sports</option>
            <option *ngFor="let s of sports" [value]="s">{{ s }}</option>
          </select>
          <select [(ngModel)]="sortBy" class="form-control filter-select" (ngModelChange)="applyFilters()">
            <option value="">Sort by</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="spinner"></div>

      <!-- Error -->
      <div *ngIf="error" class="alert alert-error">{{ error }}</div>

      <!-- Stats Row -->
      <div *ngIf="!loading" class="stats-row">
        <div class="stat-chip">
          <span class="stat-value">{{ filteredVenues.length }}</span>
          <span class="stat-label">Venues Found</span>
        </div>
        <div class="stat-chip" *ngFor="let s of topSports">
          <span class="sport-emoji">{{ getSportIcon(s.sport) }}</span>
          <span class="stat-label">{{ s.sport }} ({{ s.count }})</span>
        </div>
      </div>

      <!-- Venue Grid -->
      <div *ngIf="!loading && filteredVenues.length > 0" class="venue-grid">
        <div *ngFor="let venue of filteredVenues" class="venue-card">
          <div class="venue-image" [style.background-image]="'url(' + getSportPhoto(venue.sportType) + ')'"></div>
          <div class="venue-sport-banner" [style.background]="getSportGradient(venue.sportType)">
            <span class="venue-sport-icon">{{ getSportIcon(venue.sportType) }}</span>
            <span class="venue-sport-tag">{{ venue.sportType }}</span>
          </div>
          <div class="venue-body">
            <h3 class="venue-name">{{ venue.name }}</h3>
            <div class="venue-meta">
              <span class="venue-meta-item">📍 {{ venue.location }}</span>
              <span class="venue-meta-item">👥 Capacity: {{ venue.capacity }}</span>
            </div>
            <p class="venue-desc">{{ venue.description }}</p>
            <div class="availability-chip" *ngIf="availabilityMap[venue.id || 0] as a">
              <span [class.full]="a.remainingSeats===0">{{ a.remainingSeats }} / {{ a.totalCapacity }} seats left</span>
              <small>for {{ selectedDate }} {{ selectedTimeSlot }}</small>
            </div>
          </div>
          <div class="venue-footer">
            <div class="venue-price">
              <span class="price-amount">₹{{ venue.pricePerHour }}</span>
              <span class="price-unit">/ hour</span>
            </div>
            <a *ngIf="isLoggedIn" [routerLink]="['/venues', venue.id]" class="btn btn-primary btn-sm">
              Book Now →
            </a>
            <a *ngIf="!isLoggedIn" routerLink="/login" class="btn btn-outline btn-sm">
              Login to Book
            </a>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && filteredVenues.length === 0 && !error" class="empty-state">
        <div class="empty-icon">🏟️</div>
        <h3>No venues found</h3>
        <p>Try adjusting your search or filter</p>
      </div>

      <!-- Admin Add Button -->
      <a *ngIf="isAdmin" routerLink="/admin/venues/add" class="fab-btn" title="Add Venue">
        +
      </a>
    </div>
  `,
  styles: [`
    .hero { margin-bottom: 32px; }
    .hero-visual-strip { display: grid; grid-template-columns: 1.1fr 1fr 1fr; gap: 10px; margin-top: 16px; }
    .hero-visual {
      height: 86px;
      border-radius: 14px;
      border: 1px solid var(--border);
      background-size: cover;
      background-position: center;
      box-shadow: var(--shadow-sm);
    }
    .visual-one { background-image: linear-gradient(120deg, rgba(6,182,212,0.6), rgba(139,92,246,0.6)), url('https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80'); }
    .visual-two { background-image: linear-gradient(120deg, rgba(0,200,150,0.55), rgba(10,15,25,0.4)), url('https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80'); }
    .visual-three { background-image: linear-gradient(120deg, rgba(255,112,67,0.55), rgba(10,15,25,0.4)), url('https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80'); }
    .filter-bar {
      display: flex; gap: 12px; flex-wrap: wrap; margin-top: 24px;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 16px;
    }
    .search-wrap { position: relative; flex: 1; min-width: 200px; }
    .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 1rem; }
    .search-input {
      width: 100%; padding: 12px 16px 12px 40px;
      background: var(--bg-elevated); border: 1px solid var(--border);
      border-radius: var(--radius); color: var(--text-primary); font-size: 0.95rem;
      outline: none; transition: var(--transition);
    }
    .search-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(0,200,150,0.15); }
    .filter-select { width: 180px; }

    .stats-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; }
    .stat-chip {
      display: flex; align-items: center; gap: 6px;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: 100px; padding: 6px 14px;
    }
    .stat-value { font-weight: 700; color: var(--primary); }
    .stat-label { font-size: 0.82rem; color: var(--text-secondary); }
    .sport-emoji { font-size: 1rem; }

    .venue-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }

    .venue-card {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); overflow: hidden;
      transition: var(--transition); display: flex; flex-direction: column;
    }
    .venue-card:hover { border-color: var(--primary); box-shadow: var(--shadow-glow); transform: translateY(-4px); }
    .venue-image {
      height: 120px;
      background-size: cover;
      background-position: center;
      filter: saturate(1.1);
    }

    .venue-sport-banner {
      padding: 20px 20px 16px; display: flex; align-items: center; gap: 12px;
    }
    .venue-sport-icon { font-size: 2rem; }
    .venue-sport-tag {
      font-size: 0.8rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 1px; color: rgba(255,255,255,0.9);
      background: rgba(0,0,0,0.2); padding: 4px 10px; border-radius: 100px;
    }

    .venue-body { padding: 16px 20px; flex: 1; }
    .venue-name { font-size: 1.1rem; font-weight: 700; margin-bottom: 8px; }
    .venue-meta { display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px; }
    .venue-meta-item { font-size: 0.83rem; color: var(--text-secondary); }
    .venue-desc { font-size: 0.85rem; color: var(--text-muted); line-height: 1.4; }
    .availability-chip {
      margin-top: 10px;
      display: inline-flex;
      flex-direction: column;
      gap: 2px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 6px 10px;
      font-size: 0.78rem;
      color: var(--text-secondary);
    }
    .availability-chip span { color: var(--primary); font-weight: 700; }
    .availability-chip span.full { color: var(--error); }
    .availability-chip small { color: var(--text-muted); }

    .venue-footer {
      padding: 12px 20px 16px; border-top: 1px solid var(--border-light);
      display: flex; align-items: center; justify-content: space-between;
    }
    .venue-price { display: flex; align-items: baseline; gap: 4px; }
    .price-amount { font-size: 1.3rem; font-weight: 800; color: var(--primary); }
    .price-unit { font-size: 0.8rem; color: var(--text-muted); }

    .fab-btn {
      position: fixed; bottom: 32px; right: 32px;
      width: 56px; height: 56px; border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: #000; font-size: 1.8rem; font-weight: 300;
      display: flex; align-items: center; justify-content: center;
      text-decoration: none; box-shadow: var(--shadow-glow);
      transition: var(--transition); z-index: 50;
    }
    .fab-btn:hover { transform: scale(1.1); box-shadow: 0 0 30px rgba(0,200,150,0.4); color: #000; }
    @media (max-width: 768px) { .hero-visual-strip { grid-template-columns: 1fr; } .hero-visual { height: 72px; } }
  `]
})
export class VenuesComponent implements OnInit {
  allVenues: Venue[] = [];
  filteredVenues: Venue[] = [];
  loading = true;
  error = '';
  searchTerm = '';
  selectedSport = '';
  sortBy = '';
  selectedDate = '';
  selectedTimeSlot = '';
  isLoggedIn = false;
  isAdmin = false;
  availabilityMap: Record<number, { remainingSeats: number; totalCapacity: number }> = {};

  sports = ['Cricket', 'Football', 'Basketball', 'Tennis', 'Badminton', 'Swimming', 'Volleyball', 'Hockey'];
  timeSlots = [
    '06:00-07:00','07:00-08:00','08:00-09:00','09:00-10:00',
    '10:00-11:00','11:00-12:00','12:00-13:00','13:00-14:00',
    '14:00-15:00','15:00-16:00','16:00-17:00','17:00-18:00',
    '18:00-19:00','19:00-20:00','20:00-21:00','21:00-22:00'
  ];

  get topSports() {
    const counts: Record<string, number> = {};
    this.allVenues.forEach(v => counts[v.sportType] = (counts[v.sportType] || 0) + 1);
    return Object.entries(counts).map(([sport, count]) => ({ sport, count })).slice(0, 4);
  }

  constructor(private venueService: VenueService, private authService: AuthService, private bookingService: BookingService) {}

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.isAdmin();
    this.venueService.getAll().subscribe({
      next: (venues) => { this.allVenues = venues; this.applyFilters(); this.loading = false; },
      error: () => { this.error = 'Failed to load venues.'; this.loading = false; }
    });
  }

  applyFilters() {
    let list = [...this.allVenues];
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      list = list.filter(v => v.name.toLowerCase().includes(term) || v.location.toLowerCase().includes(term));
    }
    if (this.selectedSport) list = list.filter(v => v.sportType === this.selectedSport);
    if (this.sortBy === 'price-asc') list.sort((a, b) => a.pricePerHour - b.pricePerHour);
    else if (this.sortBy === 'price-desc') list.sort((a, b) => b.pricePerHour - a.pricePerHour);
    else if (this.sortBy === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    this.filteredVenues = list;
    this.updateAvailabilityPreview();
  }

  onAvailabilityFilterChange() {
    this.updateAvailabilityPreview();
  }

  updateAvailabilityPreview() {
    this.availabilityMap = {};
    if (!this.selectedDate || !this.selectedTimeSlot) return;

    for (const venue of this.filteredVenues) {
      if (!venue.id) continue;
      this.bookingService.getByVenue(venue.id).subscribe({
        next: (bookings) => {
          const target = `${this.selectedDate}_${this.selectedTimeSlot}`;
          const bookedCount = bookings.filter(b => b.status === 'CONFIRMED' && b.timeSlot === target).length;
          const totalCapacity = venue.capacity;
          this.availabilityMap[venue.id!] = {
            totalCapacity,
            remainingSeats: Math.max(totalCapacity - bookedCount, 0)
          };
        },
        error: () => {
          this.availabilityMap[venue.id!] = { totalCapacity: venue.capacity, remainingSeats: venue.capacity };
        }
      });
    }
  }

  getSportIcon(sport: string): string { return SPORT_ICONS[sport] || SPORT_ICONS['Default']; }

  getSportGradient(sport: string): string {
    const gradients: Record<string, string> = {
      Cricket: 'linear-gradient(135deg,#1a472a,#2d8a47)',
      Football: 'linear-gradient(135deg,#1a3a6b,#2563a8)',
      Basketball: 'linear-gradient(135deg,#7c2a00,#d04f00)',
      Tennis: 'linear-gradient(135deg,#4a1a00,#9a5200)',
      Badminton: 'linear-gradient(135deg,#0d3048,#1a6896)',
      Swimming: 'linear-gradient(135deg,#003352,#0077b6)',
      Volleyball: 'linear-gradient(135deg,#3d1a00,#8b4513)',
      Hockey: 'linear-gradient(135deg,#1a0d2e,#4a1a6e)'
    };
    return gradients[sport] || 'linear-gradient(135deg,#1c2128,#262d36)';
  }

  getSportPhoto(sport: string): string {
    const photos: Record<string, string> = {
      Cricket: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80',
      Football: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80',
      Basketball: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
      Tennis: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1200&q=80',
      Badminton: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
      Swimming: 'https://images.unsplash.com/photo-1600965962361-9035dbfd1c50?auto=format&fit=crop&w=1200&q=80',
      Volleyball: 'https://images.unsplash.com/photo-1592656094267-764a45160876?auto=format&fit=crop&w=1200&q=80',
      Hockey: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=1200&q=80'
    };
    return photos[sport] || 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80';
  }
}
