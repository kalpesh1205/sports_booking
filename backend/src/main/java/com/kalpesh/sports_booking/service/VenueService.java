package com.kalpesh.sports_booking.service;

import com.kalpesh.sports_booking.model.Venue;
import com.kalpesh.sports_booking.repository.VenueRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VenueService {

    private final VenueRepository venueRepository;

    public VenueService(VenueRepository venueRepository) {
        this.venueRepository = venueRepository;
    }

    public Venue addVenue(Venue venue) {
        return venueRepository.save(venue);
    }

    public List<Venue> getAllVenues() {
        return venueRepository.findAll();
    }

    public Venue getVenueById(Long id) {
        return venueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venue not found"));
    }

    public List<Venue> getVenuesBySportType(String sportType) {
        return venueRepository.findBySportType(sportType);
    }

    public List<Venue> getVenuesByLocation(String location) {
        return venueRepository.findByLocation(location);
    }

    public Venue updateVenue(Long id, Venue venueDetails) {
        Venue venue = getVenueById(id);
        venue.setName(venueDetails.getName());
        venue.setLocation(venueDetails.getLocation());
        venue.setSportType(venueDetails.getSportType());
        venue.setCapacity(venueDetails.getCapacity());
        venue.setPricePerHour(venueDetails.getPricePerHour());
        venue.setDescription(venueDetails.getDescription());
        return venueRepository.save(venue);
    }

    public void deleteVenue(Long id) {
        Venue venue = getVenueById(id);
        venueRepository.delete(venue);
    }
}