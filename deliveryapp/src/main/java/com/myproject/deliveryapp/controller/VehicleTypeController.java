package com.myproject.deliveryapp.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.myproject.deliveryapp.entity.VehicleType;
import com.myproject.deliveryapp.repository.VehicleTypeRepository;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/vehicle-types")
@RequiredArgsConstructor
public class VehicleTypeController {
    
    private final VehicleTypeRepository vehicleTypeRepository;
    
    @GetMapping
    public ResponseEntity<List<VehicleType>> getAllVehicleTypes() {
        List<VehicleType> vehicleTypes = vehicleTypeRepository.findAll();
        return ResponseEntity.ok(vehicleTypes);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateVehicleTypePricing(
            @PathVariable Long id,
            @RequestBody PricingUpdateRequest request) {
        
        VehicleType vehicleType = vehicleTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle type not found with id: " + id));
        
        if (request.getPricePerKm() != null) {
            vehicleType.setPricePerKm(request.getPricePerKm());
        }
        
        if (request.getBaseFare() != null) {
            vehicleType.setBaseFare(request.getBaseFare());
        }
        
        VehicleType updatedVehicleType = vehicleTypeRepository.save(vehicleType);
        return ResponseEntity.ok(updatedVehicleType);
    }
    
    @Data
    public static class PricingUpdateRequest {
        private BigDecimal pricePerKm;
        private BigDecimal baseFare;
    }
}
