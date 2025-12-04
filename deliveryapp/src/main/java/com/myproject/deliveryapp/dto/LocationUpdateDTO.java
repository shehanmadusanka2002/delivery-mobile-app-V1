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
public class LocationUpdateDTO {
    private Long orderId;
    private Long driverId;
    private Double latitude;
    private Double longitude;
}
