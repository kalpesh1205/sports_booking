import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id?: number;
  username: string;
  password: string;
  role?: string;
}

export interface Venue {
  id?: number;
  name: string;
  location: string;
  sportType: string;
  capacity: number;
  pricePerHour: number;
  description?: string;
}

export interface Booking {
  id?: number;
  venue: Venue;
  user?: User;
  timeSlot: string;
  bookingDate?: string;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = '';

  constructor(private http: HttpClient) {
    console.log('ApiService initialized with baseUrl:', this.baseUrl);
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // Auth endpoints
  register(user: User): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, user, { headers: this.getHeaders() });
  }

  login(user: User): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/auth/login`, user, { headers: this.getHeaders() });
  }

  // Venue endpoints
  getVenues(): Observable<Venue[]> {
    return this.http.get<Venue[]>(`${this.baseUrl}/venues`);
  }

  getVenue(id: number): Observable<Venue> {
    return this.http.get<Venue>(`${this.baseUrl}/venues/${id}`);
  }

  createVenue(venue: Venue): Observable<Venue> {
    return this.http.post<Venue>(`${this.baseUrl}/venues`, venue, { headers: this.getHeaders() });
  }

  updateVenue(id: number, venue: Venue): Observable<Venue> {
    return this.http.put<Venue>(`${this.baseUrl}/venues/${id}`, venue, { headers: this.getHeaders() });
  }

  deleteVenue(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/venues/${id}`);
  }

  // Booking endpoints
  getBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/booking`);
  }

  createBooking(booking: Booking): Observable<Booking> {
    return this.http.post<Booking>(`${this.baseUrl}/booking/book`, booking, { headers: this.getHeaders() });
  }

  cancelBooking(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/booking/${id}`);
  }
}