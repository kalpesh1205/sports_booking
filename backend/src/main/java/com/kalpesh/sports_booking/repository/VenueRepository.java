package com.kalpesh.sports_booking.repository;

import com.kalpesh.sports_booking.model.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VenueRepository extends JpaRepository<Venue, Long> {
    List<Venue> findBySportType(String sportType);
    List<Venue> findByLocation(String location);
}