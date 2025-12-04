package com.myproject.deliveryapp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "drivers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Driver {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "vehicle_type_id", nullable = false)
    private VehicleType vehicleType;
    
    @Column(unique = true, nullable = false)
    private String licenseNumber;
    
    @Column(nullable = false)
    private String vehiclePlateNumber;
    
    @Builder.Default
    @Column(nullable = false)
    private Boolean isAvailable = true;
    
    @Builder.Default
    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isApproved = false;
    
    private Double currentLatitude;
    
    private Double currentLongitude;
    
    @Builder.Default
    @Column(nullable = false, columnDefinition = "DOUBLE PRECISION DEFAULT 0.0")
    private Double averageRating = 0.0;
    
    @Builder.Default
    @Column(nullable = false, columnDefinition = "INTEGER DEFAULT 0")
    private Integer ratingCount = 0;
}
