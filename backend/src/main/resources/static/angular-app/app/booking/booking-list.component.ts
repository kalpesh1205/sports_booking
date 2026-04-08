import { Component, OnInit } from '@angular/core';
import { ApiService, Booking } from '../services/api.service';

@Component({
  selector: 'app-booking-list',
  template: `
    <h2>My Bookings</h2>

    <div *ngIf="bookings.length === 0" class="alert alert-info">
      No bookings found. <a routerLink="/venues">Browse venues</a> to make a booking.
    </div>

    <div class="row">
      <div *ngFor="let booking of bookings" class="col-md-6 mb-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">{{ booking.venue.name }}</h5>
            <p class="card-text"><strong>Location:</strong> {{ booking.venue.location }}</p>
            <p class="card-text"><strong>Time Slot:</strong> {{ booking.timeSlot }}</p>
            <p class="card-text"><strong>Status:</strong>
              <span class="badge" [class]="getStatusClass(booking.status)">
                {{ booking.status }}
              </span>
            </p>
            <p class="card-text"><strong>Price:</strong> \${{ booking.venue.pricePerHour }}/hour</p>
          </div>
          <div class="card-footer" *ngIf="booking.status === 'CONFIRMED'">
            <button class="btn btn-danger" (click)="cancelBooking(booking.id)">
              Cancel Booking
            </button>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="message" class="alert alert-info mt-3">
      {{ message }}
    </div>
  `,
  styles: [`
    .badge.bg-success { background-color: #198754 !important; }
    .badge.bg-danger { background-color: #dc3545 !important; }
  `]
})
export class BookingListComponent implements OnInit {
  bookings: Booking[] = [];
  message = '';

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.apiService.getBookings().subscribe({
      next: (bookings) => {
        this.bookings = bookings;
      },
      error: (error) => {
        this.message = 'Error loading bookings: ' + error.message;
      }
    });
  }

  cancelBooking(id?: number) {
    if (id == null) {
      this.message = 'Unable to cancel booking: invalid booking ID.';
      return;
    }
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.apiService.cancelBooking(id).subscribe({
        next: () => {
          this.message = 'Booking cancelled successfully!';
          this.loadBookings();
        },
        error: (error) => {
          this.message = 'Error cancelling booking: ' + error.error;
        }
      });
    }
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'CONFIRMED': return 'badge bg-success';
      case 'CANCELLED': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }
}