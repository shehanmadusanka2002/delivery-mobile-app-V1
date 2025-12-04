package com.myproject.deliveryapp.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Integer rating;
    
    @Column(length = 1000)
    private String comment;
    
    @OneToOne
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;
    
    @ManyToOne
    @JoinColumn(name = "driver_id", nullable = false)
    private Driver driver;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
