package com.myproject.deliveryapp.entity;

import java.math.BigDecimal;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vehicle_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleType {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String name;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerKm;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal baseFare;
}
