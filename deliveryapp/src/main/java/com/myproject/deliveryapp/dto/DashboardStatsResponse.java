package com.myproject.deliveryapp.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {
    
    private Long totalUsers;
    private Long totalDrivers;
    private Long totalOrders;
    private BigDecimal totalRevenue;
    private Long activeOrders;
}
