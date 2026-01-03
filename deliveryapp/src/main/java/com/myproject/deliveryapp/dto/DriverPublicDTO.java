package com.myproject.deliveryapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverPublicDTO {
    private Long id;
    private Double currentLatitude;
    private Double currentLongitude;
    private String vehicleType;
}
