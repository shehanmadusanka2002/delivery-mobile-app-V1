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
    private String phone;
    private String licenseNumber;
    private String vehiclePlateNumber;
    private String vehicleType;
    
    // Bank details
    private String bankName;
    private String branchName;
    private String accountNumber;
    private String accountHolderName;
    
    // Image URLs
    private String profilePhotoUrl;
    private String licensePhotoUrl;
}
