package com.myproject.deliveryapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripHistoryDTO {
    private Long id;
    private String pickupAddress;
    private String dropAddress;
    private Double distance;
    private Double finalPrice;
    private String paymentMethod;
    private LocalDateTime completedAt;
}
