package com.myproject.deliveryapp.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.myproject.deliveryapp.enums.OrderStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;
    
    @ManyToOne
    @JoinColumn(name = "driver_id")
    private Driver driver;
    
    @ManyToOne
    @JoinColumn(name = "vehicle_type_id")
    private VehicleType vehicleType;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;
    
    @Column(nullable = false)
    private String pickupLocation;
    
    @Column(nullable = false)
    private Double pickupLat;
    
    @Column(nullable = false)
    private Double pickupLng;
    
    @Column(nullable = false)
    private String dropLocation;
    
    @Column(nullable = false)
    private Double dropLat;
    
    @Column(nullable = false)
    private Double dropLng;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal finalPrice;
    
    private String paymentMethod;
    
    private Double distance;
    
    private String pickupOtp;
    
    private LocalDateTime completedAt;
    
    @CreationTimestamp
    @Column(updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;
}
