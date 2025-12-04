package com.myproject.deliveryapp.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LocationUpdateRequest {
    private Long driverId;
    private Double latitude;
    private Double longitude;
}
