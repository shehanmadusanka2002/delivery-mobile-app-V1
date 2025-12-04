package com.myproject.deliveryapp.config;

import java.math.BigDecimal;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.myproject.deliveryapp.entity.User;
import com.myproject.deliveryapp.entity.VehicleType;
import com.myproject.deliveryapp.enums.UserRole;
import com.myproject.deliveryapp.repository.UserRepository;
import com.myproject.deliveryapp.repository.VehicleTypeRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {
    
    private final VehicleTypeRepository vehicleTypeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        seedVehicleTypes();
        seedAdminUser();
    }
    
    private void seedVehicleTypes() {
        // Check if vehicle types already exist
        if (vehicleTypeRepository.count() > 0) {
            log.info("Vehicle types already seeded. Skipping.");
            return;
        }
        
        log.info("Seeding vehicle types...");
        
        // Create Tuk
        VehicleType tuk = VehicleType.builder()
                .name("Tuk")
                .baseFare(new BigDecimal("50"))
                .pricePerKm(new BigDecimal("80"))
                .build();
        vehicleTypeRepository.save(tuk);
        log.info("Created vehicle type: Tuk (Base: 50, Rate: 80/km)");
        
        // Create Car
        VehicleType car = VehicleType.builder()
                .name("Car")
                .baseFare(new BigDecimal("100"))
                .pricePerKm(new BigDecimal("150"))
                .build();
        vehicleTypeRepository.save(car);
        log.info("Created vehicle type: Car (Base: 100, Rate: 150/km)");
        
        // Create Van
        VehicleType van = VehicleType.builder()
                .name("Van")
                .baseFare(new BigDecimal("150"))
                .pricePerKm(new BigDecimal("200"))
                .build();
        vehicleTypeRepository.save(van);
        log.info("Created vehicle type: Van (Base: 150, Rate: 200/km)");
        
        log.info("Vehicle types seeding completed successfully!");
    }
    
    private void seedAdminUser() {
        // Check if admin user already exists
        if (userRepository.findByEmail("admin@delivery.com").isPresent()) {
            log.info("Admin user already exists. Skipping.");
            return;
        }
        
        log.info("Creating admin user...");
        
        User admin = User.builder()
                .email("admin@delivery.com")
                .password(passwordEncoder.encode("admin123"))
                .phone("0000000000")
                .role(UserRole.ADMIN)
                .build();
        
        userRepository.save(admin);
        log.info("Admin user created successfully!");
        log.info("Email: admin@delivery.com");
        log.info("Password: admin123");
    }
}
