package com.kalpesh.sports_booking;

import com.kalpesh.sports_booking.model.User;
import com.kalpesh.sports_booking.model.Venue;
import com.kalpesh.sports_booking.repository.UserRepository;
import com.kalpesh.sports_booking.repository.VenueRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final VenueRepository venueRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, VenueRepository venueRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.venueRepository = venueRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Seed admin user
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@sportsbooking.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("ADMIN");
            userRepository.save(admin);
        }

        // Seed a standard user for testing
        if (!userRepository.existsByUsername("testuser")) {
            User user = new User();
            user.setUsername("testuser");
            user.setEmail("user@sportsbooking.com");
            user.setPassword(passwordEncoder.encode("user123"));
            user.setRole("USER");
            userRepository.save(user);
        }

        // Seed demo venues if none exist
        if (venueRepository.count() == 0) {
            venueRepository.save(createVenue("City Cricket Ground", "Downtown", "Cricket", 22, 1500.0, "Professional cricket ground with floodlights and practice nets"));
            venueRepository.save(createVenue("Elite Football Arena", "Suburb East", "Football", 22, 2000.0, "FIFA-standard artificial turf football field"));
            venueRepository.save(createVenue("Pro Badminton Hall", "City Center", "Badminton", 8, 500.0, "4 indoor badminton courts with wooden flooring"));
            venueRepository.save(createVenue("Aqua Swimming Pool", "West Side", "Swimming", 50, 800.0, "Olympic-size swimming pool with 8 lanes"));
            venueRepository.save(createVenue("Smash Tennis Club", "North Park", "Tennis", 4, 1200.0, "Hard-court outdoor tennis with coaching available"));
            venueRepository.save(createVenue("Slam Dunk Basketball Court", "Central Arena", "Basketball", 10, 700.0, "Indoor air-conditioned basketball court"));
        }
    }

    private Venue createVenue(String name, String location, String sport, int capacity, double price, String desc) {
        Venue v = new Venue();
        v.setName(name);
        v.setLocation(location);
        v.setSportType(sport);
        v.setCapacity(capacity);
        v.setPricePerHour(price);
        v.setDescription(desc);
        return v;
    }
}
