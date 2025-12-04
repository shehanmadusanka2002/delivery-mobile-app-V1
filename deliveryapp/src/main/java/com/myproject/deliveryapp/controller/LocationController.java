package com.myproject.deliveryapp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.myproject.deliveryapp.dto.LocationUpdateRequest;
import com.myproject.deliveryapp.entity.Driver;
import com.myproject.deliveryapp.service.DriverService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class LocationController {
    
    private final SimpMessagingTemplate messagingTemplate;
    private final DriverService driverService;
    
    @MessageMapping("/driver-location")
    public void updateLocation(LocationUpdateRequest request) {
        // Save location to database
        driverService.updateLocation(request.getDriverId(), request.getLatitude(), request.getLongitude());
        
        // Broadcast location update to driver-specific tracking topic
        messagingTemplate.convertAndSend(
                "/topic/tracking/" + request.getDriverId(),
                request
        );
        
        // Also broadcast to global admin topic for all driver movements
        messagingTemplate.convertAndSend(
                "/topic/admin/drivers",
                request
        );
    }
    
    @PutMapping("/drivers/{driverId}/availability")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<?> updateDriverAvailability(
            @PathVariable Long driverId,
            @RequestBody AvailabilityRequest request) {
        try {
            System.out.println("🔧 Availability update - Driver ID: " + driverId + ", Available: " + request.getAvailable());
            Driver driver = driverService.updateAvailability(driverId, request.getAvailable());
            
            // Notify admin dashboard about driver status change
            messagingTemplate.convertAndSend(
                "/topic/admin/driver-status",
                new DriverStatusUpdate(driverId, request.getAvailable())
            );
            
            return ResponseEntity.ok(driver);
        } catch (Exception e) {
            System.err.println("❌ Error updating availability: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // DTO for availability request
    public static class AvailabilityRequest {
        private boolean available;
        
        public boolean getAvailable() {
            return available;
        }
        
        public void setAvailable(boolean available) {
            this.available = available;
        }
    }
    
    // DTO for driver status update notification
    public static class DriverStatusUpdate {
        private Long driverId;
        private boolean isAvailable;
        
        public DriverStatusUpdate(Long driverId, boolean isAvailable) {
            this.driverId = driverId;
            this.isAvailable = isAvailable;
        }
        
        public Long getDriverId() {
            return driverId;
        }
        
        public boolean isAvailable() {
            return isAvailable;
        }
    }
}
