package com.myproject.deliveryapp.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.myproject.deliveryapp.entity.Driver;
import com.myproject.deliveryapp.repository.DriverRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DriverService {
    
    private final DriverRepository driverRepository;
    
    public List<Driver> findDriversForOrder(double lat, double lng) {
        return driverRepository.findNearestDrivers(lat, lng, 5.0);
    }
    
    @Transactional
    public Driver updateLocation(Long driverId, double lat, double lng) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found with id: " + driverId));
        
        driver.setCurrentLatitude(lat);
        driver.setCurrentLongitude(lng);
        
        return driverRepository.save(driver);
    }
    
    @Transactional
    public Driver updateAvailability(Long driverId, boolean isAvailable) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found with id: " + driverId));
        
        driver.setIsAvailable(isAvailable);
        
        return driverRepository.save(driver);
    }
}
