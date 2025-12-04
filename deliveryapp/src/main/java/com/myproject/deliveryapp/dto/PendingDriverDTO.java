package com.myproject.deliveryapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PendingDriverDTO {
    private Long id;
    private String name;
    private String email;
    private String licenseNumber;
    private String vehiclePlateNumber;
    private String vehicleType;
}
