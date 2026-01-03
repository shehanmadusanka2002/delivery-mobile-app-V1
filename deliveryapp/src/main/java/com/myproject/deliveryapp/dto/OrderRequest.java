package com.myproject.deliveryapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {
    
    @NotBlank(message = "Pickup location is required")
    private String pickupLocation;
    
    @NotBlank(message = "Drop location is required")
    private String dropLocation;
    
    @NotNull(message = "Vehicle type ID is required")
    private Long vehicleTypeId;
    
    @NotNull(message = "Distance is required")
    private Double distance;
    
    // GPS Coordinates
    private Double pickupLat;
    private Double pickupLng;
    private Double dropLat;
    private Double dropLng;
}
