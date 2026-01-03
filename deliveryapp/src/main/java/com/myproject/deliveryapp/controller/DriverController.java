package com.myproject.deliveryapp.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.myproject.deliveryapp.dto.DriverProfileDTO;
import com.myproject.deliveryapp.dto.DriverPublicDTO;
import com.myproject.deliveryapp.dto.LocationUpdateRequest;
import com.myproject.deliveryapp.entity.Driver;
import com.myproject.deliveryapp.entity.User;
import com.myproject.deliveryapp.repository.DriverRepository;
import com.myproject.deliveryapp.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
public class DriverController {
    
    private final DriverRepository driverRepository;
    private final UserRepository userRepository;
    
    /**
     * Get all available drivers for customers to view on map
     * Returns only public information (no personal details like phone/email)
     * Accessible to customers and admins
     */
    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<List<DriverPublicDTO>> getAvailableDrivers() {
        // Find all drivers who are both available and approved
        List<Driver> availableDrivers = driverRepository
                .findByIsAvailableAndIsApproved(true, true);
        
        // Map to public DTO (excluding sensitive information)
        List<DriverPublicDTO> driverDTOs = availableDrivers.stream()
                .map(driver -> DriverPublicDTO.builder()
                        .id(driver.getId())
                        .currentLatitude(driver.getCurrentLatitude())
                        .currentLongitude(driver.getCurrentLongitude())
                        .vehicleType(driver.getVehicleType() != null 
                                ? driver.getVehicleType().getName() 
                                : "Unknown")
                        .build())
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(driverDTOs);
    }

    /**
     * Get driver's profile information
     * Returns complete profile including documents and bank details
     */
    @GetMapping("/profile")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<DriverProfileDTO> getDriverProfile(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Driver driver = driverRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        
        DriverProfileDTO profileDTO = DriverProfileDTO.builder()
                .driverId(driver.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .vehicleNo(driver.getVehiclePlateNumber())
                .vehicleType(driver.getVehicleType() != null ? driver.getVehicleType().getName() : "Unknown")
                .averageRating(driver.getAverageRating())
                .ratingCount(driver.getRatingCount())
                .profilePhotoUrl(driver.getProfilePhotoUrl())
                .licenseNumber(driver.getLicenseNumber())
                .licensePhotoUrl(driver.getLicensePhotoUrl())
                .bankName(driver.getBankName())
                .branchName(driver.getBranchName())
                .accountNumber(driver.getAccountNumber())
                .accountHolderName(driver.getAccountHolderName())
                .isApproved(driver.getIsApproved())
                .isAvailable(driver.getIsAvailable())
                .build();
        
        return ResponseEntity.ok(profileDTO);
    }

    /**
     * Update driver's current location
     * Called by driver mobile app to send real-time location updates
     */
    @PostMapping("/update-location")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<?> updateLocation(
            @RequestBody LocationUpdateRequest request,
            Authentication authentication) {
        
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Driver driver = driverRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        
        // Update driver location
        driver.setCurrentLatitude(request.getLatitude());
        driver.setCurrentLongitude(request.getLongitude());
        driverRepository.save(driver);
        
        return ResponseEntity.ok().body("Location updated successfully");
    }
}
