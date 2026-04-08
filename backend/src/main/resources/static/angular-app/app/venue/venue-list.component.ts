import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, Venue } from '../services/api.service';

@Component({
  selector: 'app-venue-list',
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Available Venues</h2>
      <button class="btn btn-primary" routerLink="/venues/new">Add New Venue</button>
    </div>

    <div *ngIf="message" class="alert alert-info mt-2 mb-3">
      {{ message }}
    </div>

    <div *ngIf="venues.length === 0" class="alert alert-warning">
      <p>No venues available yet. <a routerLink="/venues/new" class="alert-link">Create the first venue!</a></p>
    </div>

    <div class="row">
      <div *ngFor="let venue of venues" class="col-md-4 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">{{ venue.name }}</h5>
            <p class="card-text">{{ venue.location }}</p>
            <p class="card-text"><strong>Sport:</strong> {{ venue.sportType }}</p>
            <p class="card-text"><strong>Capacity:</strong> {{ venue.capacity }}</p>
            <p class="card-text"><strong>Price:</strong> \${{ venue.pricePerHour }}/hour</p>
            <p class="card-text" *ngIf="venue.description">{{ venue.description }}</p>
          </div>
          <div class="card-footer">
            <button class="btn btn-success me-2" (click)="bookVenue(venue)">Book Now</button>
            <button class="btn btn-outline-primary me-2" [routerLink]="['/venues/edit', venue.id]">Edit</button>
            <button class="btn btn-outline-danger" (click)="deleteVenue(venue.id)">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class VenueListComponent implements OnInit {
  venues: Venue[] = [];
  message = '';

  constructor(private apiService: ApiService, private router: Router) { }

  ngOnInit() {
    console.log('VenueListComponent initialized');
    this.loadVenues();
  }

  loadVenues() {
    console.log('loadVenues called');
    this.apiService.getVenues().subscribe({
      next: (venues) => {
        console.log('Venues loaded:', venues);
        this.venues = venues;
      },
      error: (error) => {
        console.error('Error loading venues:', error);
        this.message = 'Error loading venues: ' + error.message;
      }
    });
  }

  bookVenue(venue: Venue) {
    const timeSlot = prompt(`Book ${venue.name}. Enter time slot (e.g., 2024-01-01 10:00-11:00):`);
    if (timeSlot) {
      const booking = {
        venue: venue,
        timeSlot: timeSlot
      };
      this.apiService.createBooking(booking).subscribe({
        next: (result) => {
          this.message = 'Booking successful!';
          this.router.navigate(['/bookings']);
        },
        error: (error) => {
          this.message = 'Booking failed: ' + error.error;
        }
      });
    }
  }

  deleteVenue(id?: number) {
    if (id == null) {
      this.message = 'Unable to delete venue: invalid venue ID.';
      return;
    }
    if (confirm('Are you sure you want to delete this venue?')) {
      this.apiService.deleteVenue(id).subscribe({
        next: () => {
          this.message = 'Venue deleted successfully!';
          this.loadVenues();
        },
        error: (error) => {
          this.message = 'Error deleting venue: ' + error.message;
        }
      });
    }
  }
}