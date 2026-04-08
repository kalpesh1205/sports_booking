import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VenueService, Venue } from '../../services/venue.service';

@Component({
  selector: 'app-venue-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-wrapper fade-in">
      <a routerLink="/admin" class="back-link">← Back to Admin</a>

      <div class="form-card">
        <div class="form-card-header">
          <div class="form-card-icon">{{ isEdit ? '✏️' : '🏟️' }}</div>
          <div>
            <h1 class="section-title" style="font-size:1.5rem">{{ isEdit ? 'Edit Venue' : 'Add New Venue' }}</h1>
            <p class="section-subtitle" style="margin-bottom:0">{{ isEdit ? 'Update venue details' : 'Create a new sports venue' }}</p>
          </div>
        </div>

        <div *ngIf="error" class="alert alert-error">⚠️ {{ error }}</div>
        <div *ngIf="success" class="alert alert-success">✅ {{ success }}</div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Venue Name *</label>
              <input type="text" formControlName="name" class="form-control" placeholder="e.g. City Cricket Ground">
              <span *ngIf="f['name'].touched && f['name'].errors?.['required']" class="form-error">Name is required</span>
            </div>

            <div class="form-group">
              <label class="form-label">Location *</label>
              <input type="text" formControlName="location" class="form-control" placeholder="e.g. Downtown, Mumbai">
              <span *ngIf="f['location'].touched && f['location'].errors?.['required']" class="form-error">Location is required</span>
            </div>

            <div class="form-group">
              <label class="form-label">Sport Type *</label>
              <select formControlName="sportType" class="form-control">
                <option value="">Select sport</option>
                <option *ngFor="let s of sports" [value]="s">{{ s }}</option>
              </select>
              <span *ngIf="f['sportType'].touched && f['sportType'].errors?.['required']" class="form-error">Sport type is required</span>
            </div>

            <div class="form-group">
              <label class="form-label">Capacity *</label>
              <input type="number" formControlName="capacity" class="form-control" placeholder="e.g. 22" min="1">
              <span *ngIf="f['capacity'].touched && f['capacity'].errors?.['required']" class="form-error">Capacity is required</span>
              <span *ngIf="f['capacity'].touched && f['capacity'].errors?.['min']" class="form-error">Must be at least 1</span>
            </div>

            <div class="form-group">
              <label class="form-label">Price Per Hour (₹) *</label>
              <input type="number" formControlName="pricePerHour" class="form-control" placeholder="e.g. 1500" min="0">
              <span *ngIf="f['pricePerHour'].touched && f['pricePerHour'].errors?.['required']" class="form-error">Price is required</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea formControlName="description" class="form-control textarea" rows="3"
              placeholder="Describe the venue facilities, rules, etc."></textarea>
          </div>

          <!-- Preview -->
          <div class="venue-preview" *ngIf="form.value.sportType">
            <p class="preview-label">Preview</p>
            <div class="preview-card" [style.background]="getSportGradient(form.value.sportType)">
              <span class="preview-icon">{{ getSportIcon(form.value.sportType) }}</span>
              <div>
                <p class="preview-name">{{ form.value.name || 'Venue Name' }}</p>
                <p class="preview-loc">📍 {{ form.value.location || 'Location' }} &nbsp;|&nbsp; ₹{{ form.value.pricePerHour || '0' }}/hr</p>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <a routerLink="/admin" class="btn btn-outline">Cancel</a>
            <button type="submit" class="btn btn-primary btn-lg" [disabled]="loading">
              <span *ngIf="loading" class="btn-spinner"></span>
              {{ loading ? 'Saving…' : (isEdit ? 'Update Venue' : 'Create Venue') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .back-link { display: inline-flex; align-items: center; gap: 6px; color: var(--text-secondary); font-size: 0.9rem; text-decoration: none; margin-bottom: 20px; transition: var(--transition); }
    .back-link:hover { color: var(--primary); }

    .form-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-xl); padding: 32px; max-width: 720px; }
    .form-card-header { display: flex; align-items: center; gap: 16px; margin-bottom: 28px; }
    .form-card-icon { font-size: 2.5rem; }

    .form-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0 20px; }

    .textarea { resize: vertical; min-height: 90px; font-family: 'Inter', sans-serif; }

    .venue-preview { margin: 16px 0; }
    .preview-label { font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .preview-card { display: flex; align-items: center; gap: 14px; padding: 16px 20px; border-radius: var(--radius-lg); }
    .preview-icon { font-size: 2rem; }
    .preview-name { font-weight: 700; color: #fff; font-size: 1rem; }
    .preview-loc { color: rgba(255,255,255,0.7); font-size: 0.82rem; margin-top: 2px; }

    .form-actions { display: flex; gap: 12px; margin-top: 8px; }
    .btn-spinner { width: 16px; height: 16px; border: 2px solid rgba(0,0,0,0.3); border-top-color: #000; border-radius: 50%; animation: spin 0.7s linear infinite; }
  `]
})
export class VenueFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  loading = false;
  error = '';
  success = '';
  venueId?: number;

  sports = ['Cricket', 'Football', 'Basketball', 'Tennis', 'Badminton', 'Swimming', 'Volleyball', 'Hockey'];

  constructor(
    private fb: FormBuilder,
    private venueService: VenueService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      location: ['', Validators.required],
      sportType: ['', Validators.required],
      capacity: [null, [Validators.required, Validators.min(1)]],
      pricePerHour: [null, [Validators.required, Validators.min(0)]],
      description: ['']
    });
  }

  get f() { return this.form.controls; }

  ngOnInit() {
    this.venueId = +this.route.snapshot.paramMap.get('id')!;
    if (this.venueId) {
      this.isEdit = true;
      this.venueService.getById(this.venueId).subscribe({
        next: (v) => this.form.patchValue(v),
        error: () => this.router.navigate(['/admin'])
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true; this.error = ''; this.success = '';

    const obs = this.isEdit
      ? this.venueService.update(this.venueId!, this.form.value)
      : this.venueService.create(this.form.value);

    obs.subscribe({
      next: () => {
        this.success = this.isEdit ? 'Venue updated!' : 'Venue created!';
        this.loading = false;
        setTimeout(() => this.router.navigate(['/admin']), 1500);
      },
      error: (err) => {
        this.error = err.error?.message || 'Operation failed.';
        this.loading = false;
      }
    });
  }

  getSportIcon(sport: string): string {
    const icons: Record<string, string> = { Cricket: '🏏', Football: '⚽', Basketball: '🏀', Tennis: '🎾', Badminton: '🏸', Swimming: '🏊', Volleyball: '🏐', Hockey: '🏑' };
    return icons[sport] || '🏟️';
  }

  getSportGradient(sport: string): string {
    const g: Record<string, string> = { Cricket: 'linear-gradient(135deg,#1a472a,#2d8a47)', Football: 'linear-gradient(135deg,#1a3a6b,#2563a8)', Basketball: 'linear-gradient(135deg,#7c2a00,#d04f00)', Tennis: 'linear-gradient(135deg,#4a1a00,#9a5200)', Badminton: 'linear-gradient(135deg,#0d3048,#1a6896)', Swimming: 'linear-gradient(135deg,#003352,#0077b6)', Volleyball: 'linear-gradient(135deg,#3d1a00,#8b4513)', Hockey: 'linear-gradient(135deg,#1a0d2e,#4a1a6e)' };
    return g[sport] || 'linear-gradient(135deg,#1c2128,#262d36)';
  }
}
