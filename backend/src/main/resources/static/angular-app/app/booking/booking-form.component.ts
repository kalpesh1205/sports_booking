import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, Venue, Booking } from '../services/api.service';

@Component({
  selector: 'app-booking-form',
  template: `
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h5>Book a Venue</h5>
          </div>
          <div class="card-body">
            <form (ngSubmit)="createBooking()" #bookingForm="ngForm">
              <div class="mb-3">
                <label class="form-label">Select Venue *</label>
                <select class="form-control" [(ngModel)]="selectedVenueId" name="venueId" required>
                  <option value="">Choose a venue...</option>
                  <option *ngFor="let venue of venues" [value]="venue.id">
                    {{ venue.name }} - {{ venue.location }} ({{ venue.sportType }})
                  </option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Time Slot *</label>
                <input type="text" class="form-control"
                       [(ngModel)]="timeSlot"
                       name="timeSlot"
                       placeholder="e.g., 2024-01-01 10:00-11:00"
                       required>
                <div class="form-text">Format: YYYY-MM-DD HH:MM-HH:MM</div>
              </div>

              <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary" [disabled]="!bookingForm.form.valid">
                  Book Venue
                </button>
                <button type="button" class="btn btn-secondary" routerLink="/venues">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        <div *ngIf="message" class="alert alert-info mt-3">
          {{ message }}
        </div>
      </div>
    </div>
  `
})
export class BookingFormComponent implements OnInit {
  venues: Venue[] = [];
  selectedVenueId: number | null = null;
  timeSlot = '';
  message = '';

  constructor(private apiService: ApiService, private router: Router) { }

  ngOnInit() {
    this.loadVenues();
  }

  loadVenues() {
    this.apiService.getVenues().subscribe({
      next: (venues) => {
        this.venues = venues;
      },
      error: (error) => {
        this.message = 'Error loading venues: ' + error.message;
      }
    });
  }

  createBooking() {
    const selectedVenue = this.venues.find(v => v.id === +this.selectedVenueId!);
    if (!selectedVenue) {
      this.message = 'Please select a valid venue';
      return;
    }

    const booking: Booking = {
      venue: selectedVenue,
      timeSlot: this.timeSlot
    };

    this.apiService.createBooking(booking).subscribe({
      next: (result) => {
        this.message = 'Booking created successfully!';
        setTimeout(() => {
          this.router.navigate(['/bookings']);
        }, 1500);
      },
      error: (error) => {
        this.message = 'Booking failed: ' + error.error;
      }
    });
  }
}