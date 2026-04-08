import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VenueService, Venue } from '../../services/venue.service';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';

const SPORT_ICONS: Record<string, string> = {
  Cricket: '🏏', Football: '⚽', Basketball: '🏀',
  Tennis: '🎾', Badminton: '🏸', Swimming: '🏊',
  Volleyball: '🏐', Hockey: '🏑', Default: '🏟️'
};

@Component({
  selector: 'app-venue-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-wrapper fade-in" *ngIf="!loading && venue">
      <!-- Back -->
      <a routerLink="/venues" class="back-link">← Back to Venues</a>

      <!-- Venue Header -->
      <div class="venue-hero" [style.background]="getSportGradient(venue.sportType)">
        <div class="venue-hero-image" [style.background-image]="'url(' + getSportPhoto(venue.sportType) + ')'"></div>
        <div class="venue-hero-content">
          <span class="hero-icon">{{ getSportIcon(venue.sportType) }}</span>
          <div>
            <span class="sport-badge">{{ venue.sportType }}</span>
            <h1 class="venue-title">{{ venue.name }}</h1>
            <p class="venue-location">📍 {{ venue.location }}</p>
          </div>
        </div>
        <div class="venue-hero-stats">
          <div class="hero-stat"><span class="hero-stat-val">{{ venue.capacity }}</span><span class="hero-stat-label">Capacity</span></div>
          <div class="hero-stat-divider"></div>
          <div class="hero-stat"><span class="hero-stat-val">₹{{ venue.pricePerHour }}</span><span class="hero-stat-label">Per Hour</span></div>
        </div>
      </div>

      <p class="venue-description">{{ venue.description }}</p>

      <!-- Booking Form -->
      <div class="booking-section">
        <h2 class="booking-title">📅 Book a Slot</h2>

        <div *ngIf="bookingSuccess" class="alert alert-success">
          ✅ Booking confirmed! Check your <a routerLink="/my-bookings">bookings</a>.
        </div>
        <div *ngIf="bookingError" class="alert alert-error">⚠️ {{ bookingError }}</div>

        <form [formGroup]="bookingForm" (ngSubmit)="book()" class="booking-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Select Date</label>
              <input type="date" formControlName="bookingDate" class="form-control"
                [min]="minDate" (change)="onDateChange()">
              <span *ngIf="bf['bookingDate'].touched && bf['bookingDate'].errors?.['required']" class="form-error">Date is required</span>
            </div>

            <div class="form-group">
              <label class="form-label">Select Time Slot</label>
              <select formControlName="timeSlot" class="form-control" [disabled]="!availableSlots.length">
                <option value="">{{ bookingForm.value.bookingDate ? 'Pick a slot' : 'Select date first' }}</option>
                <option *ngFor="let slot of availableSlots" [value]="slot.value" [disabled]="slot.booked">
                  {{ slot.label }} {{ slot.booked ? '(Booked)' : '' }}
                </option>
              </select>
              <span *ngIf="bf['timeSlot'].touched && bf['timeSlot'].errors?.['required']" class="form-error">Time slot is required</span>
            </div>
          </div>

          <!-- Price Estimate -->
          <div class="price-preview" *ngIf="bookingForm.value.timeSlot">
            <span class="price-label">Estimated Cost</span>
            <span class="price-val">₹{{ venue.pricePerHour }}</span>
          </div>

          <button type="submit" class="btn btn-primary btn-lg" [disabled]="bookingLoading || bookingForm.invalid">
            <span *ngIf="bookingLoading" class="btn-spinner"></span>
            {{ bookingLoading ? 'Confirming…' : '✅ Confirm Booking' }}
          </button>
        </form>
      </div>

      <!-- Booked Slots View -->
      <div class="booked-slots" *ngIf="getSelectedSlotBookings().length > 0 && bookingForm.value.timeSlot">
        <h3 class="booked-title">📋 Bookings for this Slot</h3>
        <div class="booked-list">
          <div *ngFor="let b of getSelectedSlotBookings()" class="booked-item">
            <span class="booked-date">{{ formatSlot(b.timeSlot) }}</span>
            <span class="badge badge-error">Taken</span>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="loading" class="page-wrapper"><div class="spinner"></div></div>
    <div *ngIf="!loading && !venue" class="page-wrapper empty-state">
      <div class="empty-icon">🏟️</div>
      <h3>Venue not found</h3>
      <a routerLink="/venues" class="btn btn-primary" style="margin-top:16px">Back to Venues</a>
    </div>
  `,
  styles: [`
    .back-link {
      display: inline-flex; align-items: center; gap: 6px;
      color: var(--text-secondary); font-size: 0.9rem;
      text-decoration: none; margin-bottom: 20px;
      transition: var(--transition);
    }
    .back-link:hover { color: var(--primary); }

    .venue-hero {
      border-radius: var(--radius-xl); padding: 32px;
      display: flex; flex-direction: column; gap: 20px;
      margin-bottom: 24px;
      position: relative; overflow: hidden;
    }
    .venue-hero-image {
      position: absolute; inset: 0;
      background-size: cover; background-position: center;
      opacity: 0.22;
      mix-blend-mode: screen;
    }
    .venue-hero-content { display: flex; align-items: center; gap: 20px; position: relative; z-index: 1; }
    .hero-icon { font-size: 3.5rem; }
    .sport-badge {
      font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 1px; background: rgba(0,0,0,0.3);
      color: rgba(255,255,255,0.9); padding: 4px 12px; border-radius: 100px;
      display: inline-block; margin-bottom: 8px;
    }
    .venue-title { font-size: 2rem; color: #fff; }
    .venue-location { color: rgba(255,255,255,0.7); font-size: 0.95rem; margin-top: 4px; }

    .venue-hero-stats { display: flex; align-items: center; gap: 24px; position: relative; z-index: 1; }
    .hero-stat { display: flex; flex-direction: column; }
    .hero-stat-val { font-size: 1.5rem; font-weight: 800; color: #fff; }
    .hero-stat-label { font-size: 0.8rem; color: rgba(255,255,255,0.6); }
    .hero-stat-divider { width: 1px; height: 40px; background: rgba(255,255,255,0.2); }

    .venue-description { color: var(--text-secondary); margin-bottom: 32px; font-size: 0.95rem; line-height: 1.6; }

    .booking-section {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-xl); padding: 32px; margin-bottom: 24px;
      box-shadow: var(--shadow-sm);
    }
    .booking-title { font-size: 1.3rem; margin-bottom: 20px; }
    .booking-form { display: flex; flex-direction: column; gap: 0; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    @media (max-width:600px) { .form-row { grid-template-columns: 1fr; } }

    .price-preview {
      display: flex; align-items: center; justify-content: space-between;
      background: rgba(0,200,150,0.08); border: 1px solid rgba(0,200,150,0.2);
      border-radius: var(--radius); padding: 12px 16px; margin-bottom: 16px;
    }
    .price-label { font-size: 0.9rem; color: var(--text-secondary); }
    .price-val { font-size: 1.2rem; font-weight: 800; color: var(--primary); }

    .btn-spinner {
      width: 16px; height: 16px; border: 2px solid rgba(0,0,0,0.3);
      border-top-color: #000; border-radius: 50%; animation: spin 0.7s linear infinite;
    }

    .booked-slots {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 20px;
    }
    .booked-title { font-size: 1rem; margin-bottom: 12px; }
    .booked-list { display: flex; flex-direction: column; gap: 8px; }
    .booked-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 12px; background: var(--bg-elevated); border-radius: var(--radius-sm);
    }
    .booked-date { font-size: 0.85rem; color: var(--text-secondary); }
  `]
})
export class VenueDetailComponent implements OnInit {
  venue: Venue | null = null;
  loading = true;
  bookingLoading = false;
  bookingSuccess = false;
  bookingError = '';
  existingBookings: any[] = [];
  availableSlots: { value: string; label: string; booked: boolean }[] = [];
  bookingForm: FormGroup;
  minDate = new Date().toISOString().split('T')[0];

  TIME_SLOTS = [
    '06:00-07:00','07:00-08:00','08:00-09:00','09:00-10:00',
    '10:00-11:00','11:00-12:00','12:00-13:00','13:00-14:00',
    '14:00-15:00','15:00-16:00','16:00-17:00','17:00-18:00',
    '18:00-19:00','19:00-20:00','20:00-21:00','21:00-22:00'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private venueService: VenueService,
    private bookingService: BookingService,
    private fb: FormBuilder
  ) {
    this.bookingForm = this.fb.group({
      bookingDate: ['', Validators.required],
      timeSlot: ['', Validators.required]
    });
  }

  get bf() { return this.bookingForm.controls; }

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.venueService.getById(id).subscribe({
      next: (v) => { this.venue = v; this.loading = false; this.loadBookings(id); },
      error: () => { this.loading = false; }
    });
  }

  loadBookings(venueId: number) {
    this.bookingService.getByVenue(venueId).subscribe({
      next: (bookings) => {
        this.existingBookings = bookings.filter(b => b.status === 'CONFIRMED');
      },
      error: () => {}
    });
  }

  onDateChange() {
    const date = this.bookingForm.value.bookingDate;
    if (!date) return;
    const bookedSlots = this.existingBookings
      .filter(b => b.timeSlot.startsWith(date))
      .map(b => b.timeSlot.split('_')[1]);

    this.availableSlots = this.TIME_SLOTS.map(slot => {
      const occurrences = bookedSlots.filter(s => s === slot).length;
      const isBooked = occurrences >= (this.venue?.capacity || 1);
      return {
        value: slot,
        label: slot,
        booked: isBooked
      };
    });
    this.bookingForm.patchValue({ timeSlot: '' });
  }

  book() {
    if (this.bookingForm.invalid || !this.venue?.id) return;
    this.bookingLoading = true;
    this.bookingError = '';

    const { bookingDate, timeSlot } = this.bookingForm.value;
    this.bookingService.book({ venueId: this.venue.id, bookingDate, timeSlot }).subscribe({
      next: () => {
        this.bookingSuccess = true;
        this.bookingLoading = false;
        this.bookingForm.reset();
        this.availableSlots = [];
        this.loadBookings(this.venue!.id!);
      },
      error: (err) => {
        this.bookingError = err.error?.message || 'Booking failed. Please try again.';
        this.bookingLoading = false;
      }
    });
  }

  getSelectedSlotBookings(): any[] {
    const { bookingDate, timeSlot } = this.bookingForm.value;
    if (!bookingDate || !timeSlot) return [];
    
    // The backend stores timeSlot as "YYYY-MM-DD_HH:MM-HH:MM"
    const targetKey = `${bookingDate}_${timeSlot}`;
    return this.existingBookings.filter(b => b.timeSlot === targetKey);
  }

  getSportIcon(sport: string): string { return SPORT_ICONS[sport] || SPORT_ICONS['Default']; }

  getSportGradient(sport: string): string {
    const g: Record<string, string> = {
      Cricket: 'linear-gradient(135deg,#1a472a,#2d8a47)',
      Football: 'linear-gradient(135deg,#1a3a6b,#2563a8)',
      Basketball: 'linear-gradient(135deg,#7c2a00,#d04f00)',
      Tennis: 'linear-gradient(135deg,#4a1a00,#9a5200)',
      Badminton: 'linear-gradient(135deg,#0d3048,#1a6896)',
      Swimming: 'linear-gradient(135deg,#003352,#0077b6)',
    };
    return g[sport] || 'linear-gradient(135deg,#1c2128,#262d36)';
  }

  getSportPhoto(sport: string): string {
    const photos: Record<string, string> = {
      Cricket: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80',
      Football: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80',
      Basketball: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
      Tennis: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1200&q=80',
      Badminton: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
      Swimming: 'https://images.unsplash.com/photo-1600965962361-9035dbfd1c50?auto=format&fit=crop&w=1200&q=80'
    };
    return photos[sport] || 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80';
  }

  formatSlot(slot: string): string {
    const parts = slot.split('_');
    return parts.length === 2 ? `${parts[0]} | ${parts[1]}` : slot;
  }
}
