package com.kalpesh.sports_booking.repository;

import com.kalpesh.sports_booking.model.Booking;
import com.kalpesh.sports_booking.model.User;
import com.kalpesh.sports_booking.model.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUser(User user);
    List<Booking> findByVenue(Venue venue);
    List<Booking> findByVenueAndTimeSlot(Venue venue, String timeSlot);
    List<Booking> findByStatus(String status);
    boolean existsByVenueAndTimeSlotAndStatus(Venue venue, String timeSlot, String status);
    int countByVenueAndTimeSlotAndStatus(Venue venue, String timeSlot, String status);
}