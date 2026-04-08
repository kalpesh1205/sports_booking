package com.kalpesh.sports_booking.controller;

import com.kalpesh.sports_booking.dto.BookingRequest;
import com.kalpesh.sports_booking.model.Booking;
import com.kalpesh.sports_booking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/booking")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // Any authenticated user can book a slot
    @PostMapping("/book")
    public ResponseEntity<Booking> book(@Valid @RequestBody BookingRequest request) {
        Booking booking = bookingService.bookSlot(request);
        return ResponseEntity.ok(booking);
    }

    // Get current user's own bookings
    @GetMapping("/my")
    public ResponseEntity<List<Booking>> getMyBookings() {
        return ResponseEntity.ok(bookingService.getMyBookings());
    }

    // Admin only: get all bookings
    @GetMapping
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Booking>> getAll() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // Admin only: get bookings by venue
    @GetMapping("/venue/{venueId}")
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Booking>> getByVenue(@PathVariable Long venueId) {
        return ResponseEntity.ok(bookingService.getBookingsByVenue(venueId));
    }

    // Cancel booking (user can cancel own; admin can cancel any)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> cancel(@PathVariable Long id) {
        String result = bookingService.cancelBooking(id);
        return ResponseEntity.ok(result);
    }
}