package com.myproject.deliveryapp.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.myproject.deliveryapp.dto.ReviewRequest;
import com.myproject.deliveryapp.entity.Driver;
import com.myproject.deliveryapp.entity.Order;
import com.myproject.deliveryapp.entity.Review;
import com.myproject.deliveryapp.repository.DriverRepository;
import com.myproject.deliveryapp.repository.OrderRepository;
import com.myproject.deliveryapp.repository.ReviewRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    
    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final DriverRepository driverRepository;
    
    @PostMapping
    public ResponseEntity<Review> createReview(@Valid @RequestBody ReviewRequest reviewRequest) {
        // Fetch the order
        Order order = orderRepository.findById(reviewRequest.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        // Check if the order has a driver assigned
        if (order.getDriver() == null) {
            throw new RuntimeException("Order does not have a driver assigned");
        }
        
        // Check if the order is completed
        if (order.getStatus() != com.myproject.deliveryapp.enums.OrderStatus.COMPLETED) {
            throw new RuntimeException("Can only review completed orders");
        }
        
        // Check if review already exists for this order
        if (reviewRepository.findByOrder(order).isPresent()) {
            throw new RuntimeException("Review already exists for this order");
        }
        
        // Get the driver
        Driver driver = order.getDriver();
        
        // Create and save the review
        Review review = Review.builder()
                .order(order)
                .driver(driver)
                .rating(reviewRequest.getRating())
                .comment(reviewRequest.getComment())
                .build();
        
        Review savedReview = reviewRepository.save(review);
        
        // Update driver's average rating
        Double oldAverage = driver.getAverageRating();
        Integer oldCount = driver.getRatingCount();
        
        // Calculate new average: ((oldAvg * count) + newRating) / (count + 1)
        Double newAverage = ((oldAverage * oldCount) + reviewRequest.getRating()) / (oldCount + 1.0);
        
        driver.setAverageRating(newAverage);
        driver.setRatingCount(oldCount + 1);
        
        driverRepository.save(driver);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(savedReview);
    }
}
