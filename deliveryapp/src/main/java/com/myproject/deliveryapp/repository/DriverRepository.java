package com.myproject.deliveryapp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.myproject.deliveryapp.entity.Driver;
import com.myproject.deliveryapp.entity.User;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Long> {
    
    Optional<Driver> findByUser(User user);
    
    Optional<Driver> findByUserId(Long userId);
    
    List<Driver> findByIsApproved(Boolean isApproved);
    
    Long countByIsApproved(Boolean isApproved);
    
    List<Driver> findByIsAvailableAndIsApproved(Boolean isAvailable, Boolean isApproved);
    
    @Query(value = "SELECT d.* FROM drivers d " +
            "WHERE d.is_available = true " +
            "AND d.is_approved = true " +
            "AND (6371 * acos(cos(radians(:lat)) * cos(radians(d.current_latitude)) * " +
            "cos(radians(d.current_longitude) - radians(:lng)) + " +
            "sin(radians(:lat)) * sin(radians(d.current_latitude)))) <= :radius " +
            "ORDER BY (6371 * acos(cos(radians(:lat)) * cos(radians(d.current_latitude)) * " +
            "cos(radians(d.current_longitude) - radians(:lng)) + " +
            "sin(radians(:lat)) * sin(radians(d.current_latitude))))",
            nativeQuery = true)
    List<Driver> findNearestDrivers(@Param("lat") Double lat, 
                                    @Param("lng") Double lng, 
                                    @Param("radius") Double radius);



}
