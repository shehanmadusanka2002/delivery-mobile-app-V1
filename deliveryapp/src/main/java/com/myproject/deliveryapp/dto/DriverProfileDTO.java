package com.myproject.deliveryapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DriverProfileDTO {
    private Long driverId;
    private String name;
    private String email;
    private String phone;
    private String vehicleNo;
    private String vehicleType;
    private Double totalRating;
    private Integer ratingCount;
}
