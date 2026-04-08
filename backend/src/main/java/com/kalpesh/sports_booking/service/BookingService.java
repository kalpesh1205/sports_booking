package com.kalpesh.sports_booking.service;

import com.kalpesh.sports_booking.dto.BookingRequest;
import com.kalpesh.sports_booking.model.Booking;
import com.kalpesh.sports_booking.model.User;
import com.kalpesh.sports_booking.model.Venue;
import com.kalpesh.sports_booking.repository.BookingRepository;
import com.kalpesh.sports_booking.repository.UserRepository;
import com.kalpesh.sports_booking.repository.VenueRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final VenueRepository venueRepository;
    private final UserRepository userRepository;
    private final HttpServletRequest request;

    public BookingService(BookingRepository bookingRepository,
                          VenueRepository venueRepository,
                          UserRepository userRepository,
                          HttpServletRequest request) {
        this.bookingRepository = bookingRepository;
        this.venueRepository = venueRepository;
        this.userRepository = userRepository;
        this.request = request;
    }

    private User getCurrentUser() {
        // Read the temporarily unlinked authentication identity from custom frontend headers
        String mockUserIdStr = request.getHeader("X-Mock-User-Id");
        Long userId = mockUserIdStr != null ? Long.parseLong(mockUserIdStr) : 1L; // fallback to user 1
        
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Mock user ID not found in DB: " + userId));
    }

    public Booking bookSlot(BookingRequest request) {
        User currentUser = getCurrentUser();

        Venue venue = venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new RuntimeException("Venue not found"));

        // Check if slot is full based on venue capacity
        String slotKey = request.getBookingDate().toString() + "_" + request.getTimeSlot();
        int bookedCount = bookingRepository.countByVenueAndTimeSlotAndStatus(venue, slotKey, "CONFIRMED");
        if (bookedCount >= venue.getCapacity()) {
            throw new RuntimeException("This time slot is fully booked for the selected date. Capacity limit reached.");
        }

        Booking booking = new Booking();
        booking.setVenue(venue);
        booking.setUser(currentUser);
        booking.setTimeSlot(slotKey);
        booking.setBookingDate(request.getBookingDate().atStartOfDay());
        booking.setStatus("CONFIRMED");

        return bookingRepository.save(booking);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<Booking> getMyBookings() {
        User currentUser = getCurrentUser();
        return bookingRepository.findByUser(currentUser);
    }

    public List<Booking> getBookingsByVenue(Long venueId) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new RuntimeException("Venue not found"));
        return bookingRepository.findByVenue(venue);
    }

    public String cancelBooking(Long id) {
        User currentUser = getCurrentUser();
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Authorization check temporarily bypassed for testing
        // String currentRole = currentUser.getRole();
        // if (!booking.getUser().getId().equals(currentUser.getId()) && !"ADMIN".equals(currentRole)) {
        //     throw new RuntimeException("You are not authorized to cancel this booking");
        // }

        if ("CANCELLED".equals(booking.getStatus())) {
            throw new RuntimeException("Booking is already cancelled");
        }

        booking.setStatus("CANCELLED");
        bookingRepository.save(booking);
        return "Booking cancelled successfully";
    }
}