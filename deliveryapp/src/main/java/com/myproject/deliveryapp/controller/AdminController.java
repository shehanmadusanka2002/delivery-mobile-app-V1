package com.myproject.deliveryapp.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.myproject.deliveryapp.dto.DashboardStatsResponse;
import com.myproject.deliveryapp.dto.PendingDriverDTO;
import com.myproject.deliveryapp.entity.Driver;
import com.myproject.deliveryapp.entity.Order;
import com.myproject.deliveryapp.entity.Review;
import com.myproject.deliveryapp.entity.Wallet;
import com.myproject.deliveryapp.enums.OrderStatus;
import com.myproject.deliveryapp.enums.UserRole;
import com.myproject.deliveryapp.repository.DriverRepository;
import com.myproject.deliveryapp.repository.OrderRepository;
import com.myproject.deliveryapp.repository.ReviewRepository;
import com.myproject.deliveryapp.repository.UserRepository;
import com.myproject.deliveryapp.repository.WalletRepository;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    private final DriverRepository driverRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final WalletRepository walletRepository;
    private final ReviewRepository reviewRepository;
    
    @GetMapping("/drivers/pending")
    public ResponseEntity<List<PendingDriverDTO>> getPendingDrivers() {
        List<Driver> pendingDrivers = driverRepository.findByIsApproved(false);
        
        List<PendingDriverDTO> dtos = pendingDrivers.stream()
                .map(driver -> PendingDriverDTO.builder()
                        .id(driver.getId())
                        .name(driver.getUser().getName())
                        .email(driver.getUser().getEmail())
                        .phone(driver.getUser().getPhone())
                        .licenseNumber(driver.getLicenseNumber())
                        .vehiclePlateNumber(driver.getVehiclePlateNumber())
                        .vehicleType(driver.getVehicleType() != null ? driver.getVehicleType().getName() : "N/A")
                        .bankName(driver.getBankName())
                        .branchName(driver.getBranchName())
                        .accountNumber(driver.getAccountNumber())
                        .accountHolderName(driver.getAccountHolderName())
                        .profilePhotoUrl(driver.getProfilePhotoUrl())
                        .licensePhotoUrl(driver.getLicensePhotoUrl())
                        .build())
                .collect(java.util.stream.Collectors.toList());
        
        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping("/drivers/online")
    public ResponseEntity<List<Driver>> getOnlineDrivers() {
        List<Driver> onlineDrivers = driverRepository.findByIsAvailableAndIsApproved(true, true);
        return ResponseEntity.ok(onlineDrivers);
    }
    
    @GetMapping("/drivers/all")
    public ResponseEntity<List<Driver>> getAllDrivers() {
        List<Driver> allDrivers = driverRepository.findAll();
        return ResponseEntity.ok(allDrivers);
    }
    
    @PatchMapping("/drivers/{driverId}/approve")
    public ResponseEntity<String> approveDriver(@PathVariable Long driverId) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        
        driver.setIsApproved(true);
        driverRepository.save(driver);
        
        return ResponseEntity.ok("Driver approved successfully");
    }
    
    @PatchMapping("/drivers/{driverId}/reject")
    public ResponseEntity<String> rejectDriver(@PathVariable Long driverId) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        
        // Delete the driver and associated user account
        driverRepository.delete(driver);
        
        return ResponseEntity.ok("Driver rejected and removed successfully");
    }
    
    @PatchMapping("/drivers/{driverId}/toggle-block")
    public ResponseEntity<Driver> toggleDriverBlock(@PathVariable Long driverId) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        
        // Toggle isAvailable status (blocks/unblocks driver)
        driver.setIsAvailable(!driver.getIsAvailable());
        Driver updatedDriver = driverRepository.save(driver);
        
        return ResponseEntity.ok(updatedDriver);
    }
    
    @GetMapping("/orders/all")
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> allOrders = orderRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(allOrders);
    }
    
    @GetMapping("/dashboard-stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        // Total users
        Long totalUsers = userRepository.count();
        
        // Total approved drivers
        Long totalDrivers = driverRepository.countByIsApproved(true);
        
        // Total orders
        Long totalOrders = orderRepository.count();
        
        // Total revenue (sum of all COMPLETED orders)
        BigDecimal totalRevenue = orderRepository.findAll().stream()
                .filter(order -> order.getStatus() == OrderStatus.COMPLETED)
                .map(order -> order.getPrice())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Active orders (IN_TRANSIT or ACCEPTED)
        Long activeOrders = orderRepository.findAll().stream()
                .filter(order -> order.getStatus() == OrderStatus.IN_TRANSIT || 
                               order.getStatus() == OrderStatus.ACCEPTED)
                .count();
        
        DashboardStatsResponse stats = DashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalDrivers(totalDrivers)
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .activeOrders(activeOrders)
                .build();
        
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/finance/wallets")
    public ResponseEntity<List<DriverWalletInfo>> getDriverWallets() {
        List<Wallet> allWallets = walletRepository.findAll();
        
        // Filter wallets for DRIVER role users and map to DTO
        List<DriverWalletInfo> driverWallets = allWallets.stream()
                .filter(wallet -> wallet.getUser().getRole() == UserRole.DRIVER)
                .map(wallet -> DriverWalletInfo.builder()
                        .driverId(wallet.getUser().getId())
                        .driverName(wallet.getUser().getEmail())
                        .email(wallet.getUser().getEmail())
                        .currentBalance(wallet.getBalance())
                        .build())
                .collect(java.util.stream.Collectors.toList());
        
        return ResponseEntity.ok(driverWallets);
    }
    
    @GetMapping("/reviews")
    public ResponseEntity<List<ReviewInfo>> getAllReviews() {
        List<Review> allReviews = reviewRepository.findAll();
        
        List<ReviewInfo> reviewInfos = allReviews.stream()
                .map(review -> ReviewInfo.builder()
                        .reviewId(review.getId())
                        .driverName(review.getDriver() != null && review.getDriver().getUser() != null 
                                ? review.getDriver().getUser().getEmail() 
                                : "Unknown")
                        .customerName(review.getOrder() != null && review.getOrder().getCustomer() != null 
                                ? review.getOrder().getCustomer().getEmail() 
                                : "Unknown")
                        .rating(review.getRating())
                        .comment(review.getComment())
                        .createdAt(review.getCreatedAt())
                        .build())
                .collect(java.util.stream.Collectors.toList());
        
        return ResponseEntity.ok(reviewInfos);
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviewInfo {
        private Long reviewId;
        private String driverName;
        private String customerName;
        private Integer rating;
        private String comment;
        private LocalDateTime createdAt;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DriverWalletInfo {
        private Long driverId;
        private String driverName;
        private String email;
        private BigDecimal currentBalance;
    }
}
