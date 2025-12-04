package com.myproject.deliveryapp.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.myproject.deliveryapp.dto.DailyEarningsDTO;
import com.myproject.deliveryapp.dto.DriverProfileDTO;
import com.myproject.deliveryapp.dto.TripHistoryDTO;
import com.myproject.deliveryapp.entity.Driver;
import com.myproject.deliveryapp.entity.Order;
import com.myproject.deliveryapp.entity.User;
import com.myproject.deliveryapp.enums.OrderStatus;
import com.myproject.deliveryapp.repository.DriverRepository;
import com.myproject.deliveryapp.repository.OrderRepository;
import com.myproject.deliveryapp.repository.UserRepository;

@RestController
@RequestMapping("/api/driver")
public class DriverEarningsController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Driver driver = driverRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Driver not found"));

            DriverProfileDTO profile = new DriverProfileDTO(
                    driver.getId(),
                    user.getName(),
                    user.getEmail(),
                    user.getPhone(),
                    driver.getVehiclePlateNumber(),
                    driver.getVehicleType().getName(),
                    driver.getAverageRating(),
                    driver.getRatingCount()
            );

            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/earnings/daily")
    public ResponseEntity<?> getDailyEarnings(Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Driver driver = driverRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Driver not found"));

            // Get today's start and end times
            LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
            LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);

            // Fetch completed orders for today
            List<Order> todaysOrders = orderRepository.findByDriverAndStatusAndCompletedAtBetween(
                    driver, OrderStatus.COMPLETED, startOfDay, endOfDay
            );

            // Calculate stats
            int todaysTrips = todaysOrders.size();
            double todaysEarnings = todaysOrders.stream()
                    .mapToDouble(order -> order.getFinalPrice() != null ? order.getFinalPrice().doubleValue() : 0.0)
                    .sum();
            double cashCollected = todaysOrders.stream()
                    .filter(order -> "CASH".equals(order.getPaymentMethod()))
                    .mapToDouble(order -> order.getFinalPrice() != null ? order.getFinalPrice().doubleValue() : 0.0)
                    .sum();

            DailyEarningsDTO earnings = new DailyEarningsDTO(
                    todaysTrips,
                    todaysEarnings,
                    cashCollected
            );

            return ResponseEntity.ok(earnings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/trips/history")
    public ResponseEntity<?> getTripHistory(Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Driver driver = driverRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Driver not found"));

            // Fetch all completed orders for the driver, ordered by completion date descending
            List<Order> completedOrders = orderRepository.findByDriverAndStatusOrderByCompletedAtDesc(
                    driver, OrderStatus.COMPLETED
            );

            // Map to DTOs
            List<TripHistoryDTO> history = completedOrders.stream()
                    .map(order -> new TripHistoryDTO(
                            order.getId(),
                            order.getPickupLocation(),
                            order.getDropLocation(),
                            order.getDistance(),
                            order.getFinalPrice() != null ? order.getFinalPrice().doubleValue() : 0.0,
                            order.getPaymentMethod(),
                            order.getCompletedAt()
                    ))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
