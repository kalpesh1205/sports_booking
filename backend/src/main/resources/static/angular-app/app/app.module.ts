import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { AuthComponent } from './auth/auth.component';
import { VenueListComponent } from './venue/venue-list.component';
import { VenueFormComponent } from './venue/venue-form.component';
import { BookingListComponent } from './booking/booking-list.component';
import { BookingFormComponent } from './booking/booking-form.component';

const routes: Routes = [
  { path: '', redirectTo: '/venues', pathMatch: 'full' },
  { path: 'auth', component: AuthComponent },
  { path: 'venues', component: VenueListComponent },
  { path: 'venues/new', component: VenueFormComponent },
  { path: 'venues/edit/:id', component: VenueFormComponent },
  { path: 'bookings', component: BookingListComponent },
  { path: 'bookings/new', component: BookingFormComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    VenueListComponent,
    VenueFormComponent,
    BookingListComponent,
    BookingFormComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(routes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }