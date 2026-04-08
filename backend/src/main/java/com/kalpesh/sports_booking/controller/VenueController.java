package com.kalpesh.sports_booking.controller;

import com.kalpesh.sports_booking.model.Venue;
import com.kalpesh.sports_booking.service.VenueService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/venues")
public class VenueController {

    private final VenueService venueService;

    public VenueController(VenueService venueService) {
        this.venueService = venueService;
    }

    // PUBLIC: Anyone can browse venues
    @GetMapping
    public ResponseEntity<List<Venue>> getAllVenues() {
        return ResponseEntity.ok(venueService.getAllVenues());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Venue> getVenueById(@PathVariable Long id) {
        return ResponseEntity.ok(venueService.getVenueById(id));
    }

    @GetMapping("/sport/{sportType}")
    public ResponseEntity<List<Venue>> getVenuesBySportType(@PathVariable String sportType) {
        return ResponseEntity.ok(venueService.getVenuesBySportType(sportType));
    }

    @GetMapping("/location/{location}")
    public ResponseEntity<List<Venue>> getVenuesByLocation(@PathVariable String location) {
        return ResponseEntity.ok(venueService.getVenuesByLocation(location));
    }

    // ADMIN ONLY: Write operations
    @PostMapping
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Venue> addVenue(@Valid @RequestBody Venue venue) {
        return ResponseEntity.ok(venueService.addVenue(venue));
    }

    @PutMapping("/{id}")
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Venue> updateVenue(@PathVariable Long id, @Valid @RequestBody Venue venue) {
        return ResponseEntity.ok(venueService.updateVenue(id, venue));
    }

    @DeleteMapping("/{id}")
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteVenue(@PathVariable Long id) {
        venueService.deleteVenue(id);
        return ResponseEntity.ok("Venue deleted successfully");
    }
}