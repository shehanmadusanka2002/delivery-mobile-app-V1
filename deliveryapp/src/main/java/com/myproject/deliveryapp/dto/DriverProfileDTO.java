package com.myproject.deliveryapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverProfileDTO {
    private Long driverId;
    private String name;
    private String email;
    private String phone;
    private String vehicleNo;
    private String vehicleType;
    private Double averageRating;
    private Integer ratingCount;
    private String profilePhotoUrl;
    private String licenseNumber;
    private String licensePhotoUrl;
    private String bankName;
    private String branchName;
    private String accountNumber;
    private String accountHolderName;
    private Boolean isApproved;
    private Boolean isAvailable;
}
