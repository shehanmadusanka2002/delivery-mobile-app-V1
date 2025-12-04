package com.myproject.deliveryapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyEarningsDTO {
    private Integer todaysTrips;
    private Double todaysEarnings;
    private Double cashCollected;
}
