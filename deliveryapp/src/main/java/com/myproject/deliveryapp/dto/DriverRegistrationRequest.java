package com.myproject.deliveryapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverRegistrationRequest {
    // User details
    private String name;
    private String email;
    private String password;
    private String phone;
    
    // Driver details
    private Long vehicleType;
    private String licenseNumber;
    private String vehiclePlateNumber;
    
    // Bank Details
    private String bankName;
    private String branchName;
    private String accountNumber;
    private String accountHolderName;
}
