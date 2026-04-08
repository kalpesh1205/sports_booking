import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface BookingRequest {
  venueId: number;
  timeSlot: string;
  bookingDate: string; // ISO date string YYYY-MM-DD
  groundName?: string;
}

export interface Booking {
  id: number;
  venue: { id: number; name: string; location: string; sportType: string; pricePerHour: number; };
  user: { id: number; username: string; role: string; email?: string; };
  timeSlot: string;
  groundName?: string;
  bookingDate: string;
  status: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private apiUrl = `${environment.apiUrl}/booking`;

  constructor(private http: HttpClient) {}

  book(request: BookingRequest): Observable<Booking> {
    return this.http.post<Booking>(`${this.apiUrl}/book`, request);
  }

  getMyBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/my`);
  }

  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}`);
  }

  getByVenue(venueId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/venue/${venueId}`);
  }

  cancel(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }
}
