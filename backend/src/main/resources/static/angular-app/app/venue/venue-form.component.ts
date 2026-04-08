import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, Venue } from '../services/api.service';

@Component({
  selector: 'app-venue-form',
  template: `
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h5>{{ isEdit ? 'Edit Venue' : 'Add New Venue' }}</h5>
          </div>
          <div class="card-body">
            <form (ngSubmit)="saveVenue()" #venueForm="ngForm">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Name *</label>
                    <input type="text" class="form-control" [(ngModel)]="venue.name"
                           name="name" required>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Location *</label>
                    <input type="text" class="form-control" [(ngModel)]="venue.location"
                           name="location" required>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Sport Type *</label>
                    <select class="form-control" [(ngModel)]="venue.sportType" name="sportType" required>
                      <option value="">Select Sport</option>
                      <option value="Tennis">Tennis</option>
                      <option value="Basketball">Basketball</option>
                      <option value="Soccer">Soccer</option>
                      <option value="Volleyball">Volleyball</option>
                      <option value="Badminton">Badminton</option>
                      <option value="Swimming">Swimming</option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Capacity *</label>
                    <input type="number" class="form-control" [(ngModel)]="venue.capacity"
                           name="capacity" required min="1">
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Price per Hour *</label>
                <div class="input-group">
                  <span class="input-group-text">$</span>
                  <input type="number" class="form-control" [(ngModel)]="venue.pricePerHour"
                         name="pricePerHour" required min="0" step="0.01">
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea class="form-control" [(ngModel)]="venue.description"
                          name="description" rows="3"></textarea>
              </div>

              <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary" [disabled]="!venueForm.form.valid">
                  {{ isEdit ? 'Update Venue' : 'Create Venue' }}
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
export class VenueFormComponent implements OnInit {
  venue: Venue = {
    name: '',
    location: '',
    sportType: '',
    capacity: 0,
    pricePerHour: 0,
    description: ''
  };
  isEdit = false;
  message = '';

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.apiService.getVenue(+id).subscribe({
        next: (venue) => {
          this.venue = venue;
        },
        error: (error) => {
          this.message = 'Error loading venue: ' + error.message;
        }
      });
    }
  }

  saveVenue() {
    const operation = this.isEdit
      ? this.apiService.updateVenue(this.venue.id!, this.venue)
      : this.apiService.createVenue(this.venue);

    operation.subscribe({
      next: (result) => {
        this.message = `Venue ${this.isEdit ? 'updated' : 'created'} successfully!`;
        setTimeout(() => {
          this.router.navigate(['/venues']);
        }, 1500);
      },
      error: (error) => {
        this.message = `Error ${this.isEdit ? 'updating' : 'creating'} venue: ` + error.error;
      }
    });
  }
}