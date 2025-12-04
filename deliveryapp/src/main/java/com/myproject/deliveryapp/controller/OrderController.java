package com.myproject.deliveryapp.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.myproject.deliveryapp.dto.OrderRequest;
import com.myproject.deliveryapp.entity.Driver;
import com.myproject.deliveryapp.entity.Order;
import com.myproject.deliveryapp.entity.User;
import com.myproject.deliveryapp.entity.VehicleType;
import com.myproject.deliveryapp.enums.OrderStatus;
import com.myproject.deliveryapp.repository.DriverRepository;
import com.myproject.deliveryapp.repository.OrderRepository;
import com.myproject.deliveryapp.repository.UserRepository;
import com.myproject.deliveryapp.repository.VehicleTypeRepository;
import com.myproject.deliveryapp.service.DriverService;
import com.myproject.deliveryapp.service.EmailService;
import com.myproject.deliveryapp.service.WalletService;

import java.math.BigDecimal;
import java.math.RoundingMode;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class OrderController {
    
    private final DriverService driverService;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final DriverRepository driverRepository;
    private final EmailService emailService;
    private final WalletService walletService;
    private final VehicleTypeRepository vehicleTypeRepository;
    
    @PostMapping("/orders")
    public ResponseEntity<Order> createOrder(@Valid @RequestBody OrderRequest orderRequest) {
        // Get authenticated user from SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        
        User customer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Fetch the vehicle type
        VehicleType vehicleType = vehicleTypeRepository.findById(orderRequest.getVehicleTypeId())
                .orElseThrow(() -> new RuntimeException("Vehicle type not found"));
        
        // Calculate price: baseFare + (distance * pricePerKm)
        BigDecimal distance = BigDecimal.valueOf(orderRequest.getDistance());
        BigDecimal calculatedPrice = vehicleType.getBaseFare()
                .add(distance.multiply(vehicleType.getPricePerKm()))
                .setScale(2, RoundingMode.HALF_UP);
        
        // Generate random coordinates near Colombo (simulating geocoding)
        double baseLat = 6.9271;
        double baseLng = 79.8612;
        double pickupLat = baseLat + (Math.random() - 0.5) * 0.02; // ±0.01 degrees
        double pickupLng = baseLng + (Math.random() - 0.5) * 0.02;
        
        // For drop location, simulate a different location nearby
        double dropLat = baseLat + (Math.random() - 0.5) * 0.02;
        double dropLng = baseLng + (Math.random() - 0.5) * 0.02;
        
        // Create and save order
        Order order = Order.builder()
                .customer(customer)
                .vehicleType(vehicleType)
                .status(OrderStatus.PENDING)
                .pickupLocation(orderRequest.getPickupLocation())
                .pickupLat(pickupLat)
                .pickupLng(pickupLng)
                .dropLat(dropLat)
                .dropLng(dropLng)
                .distance(orderRequest.getDistance())
                .price(calculatedPrice)
                .build();
        
        Order savedOrder = orderRepository.save(order);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedOrder);
    }
    
    @GetMapping("/orders/my-orders")
    public ResponseEntity<List<Order>> getMyOrders() {
        // Get authenticated user from SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        
        User customer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Fetch all orders for this customer ordered by createdAt descending
        List<Order> orders = orderRepository.findByCustomerOrderByCreatedAtDesc(customer);
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/orders/pending")
    public ResponseEntity<List<Order>> getPendingOrders() {
        List<Order> pendingOrders = orderRepository.findByStatusOrderByCreatedAtDesc(OrderStatus.PENDING);
        return ResponseEntity.ok(pendingOrders);
    }
    
    @GetMapping("/orders/my-active-orders")
    public ResponseEntity<List<Order>> getMyActiveOrders() {
        // Get authenticated user from SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        
        // Get the authenticated user and find their driver record
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Find the driver associated with this user
        Driver driver = driverRepository.findAll().stream()
                .filter(d -> d.getUser().getId().equals(user.getId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Driver record not found for this user"));
        
        // Fetch all orders for this driver
        List<Order> driverOrders = orderRepository.findByDriverOrderByCreatedAtDesc(driver);
        
        // Filter for active statuses only (ACCEPTED, IN_TRANSIT)
        List<Order> activeOrders = driverOrders.stream()
                .filter(order -> order.getStatus() == OrderStatus.ACCEPTED || 
                               order.getStatus() == OrderStatus.IN_TRANSIT)
                .toList();
        
        return ResponseEntity.ok(activeOrders);
    }
    
    @PutMapping("/orders/{orderId}/accept")
    public ResponseEntity<Order> acceptOrder(@PathVariable Long orderId) {
        // Get authenticated user from SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        
        // Find the order
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        // Check if order is in PENDING status
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Order is not in PENDING status. Current status: " + order.getStatus());
        }
        
        // Get the authenticated user and find their driver record
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Find the driver associated with this user
        Driver driver = driverRepository.findAll().stream()
                .filter(d -> d.getUser().getId().equals(user.getId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Driver record not found for this user"));
        
        // Assign the order to the driver
        order.setDriver(driver);
        order.setStatus(OrderStatus.ACCEPTED);
        
        // Mark driver as unavailable
        driver.setIsAvailable(false);
        
        // Save both entities
        driverRepository.save(driver);
        Order savedOrder = orderRepository.save(order);
        
        return ResponseEntity.ok(savedOrder);
    }
    
    @PatchMapping("/orders/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status) {
        // Get authenticated user from SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        
        // Find the order
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        // Get the authenticated user and find their driver record
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Find the driver associated with this user
        Driver driver = driverRepository.findAll().stream()
                .filter(d -> d.getUser().getId().equals(user.getId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Driver record not found for this user"));
        
        // Verify that this driver is assigned to this order
        if (order.getDriver() == null || !order.getDriver().getId().equals(driver.getId())) {
            throw new RuntimeException("You are not authorized to update this order. Only the assigned driver can update the status.");
        }
        
        // Parse and update the status
        try {
            OrderStatus newStatus = OrderStatus.valueOf(status.toUpperCase());
            order.setStatus(newStatus);
            
            // If order is completed, mark driver as available again
            if (newStatus == OrderStatus.COMPLETED || newStatus == OrderStatus.CANCELLED) {
                driver.setIsAvailable(true);
                driverRepository.save(driver);
                
                // Process payment if order is completed
                if (newStatus == OrderStatus.COMPLETED) {
                    // Calculate platform commission (10% of order price)
                    BigDecimal orderPrice = order.getPrice();
                    BigDecimal commissionRate = new BigDecimal("0.10");
                    BigDecimal commission = orderPrice.multiply(commissionRate).setScale(2, RoundingMode.HALF_UP);
                    
                    // Calculate driver earning (Price - Commission)
                    BigDecimal driverEarning = orderPrice.subtract(commission);
                    
                    // Get customer and driver user objects
                    User customer = order.getCustomer();
                    User driverUser = order.getDriver().getUser();
                    
                    try {
                        // Transfer funds from customer to driver
                        walletService.transferFunds(
                            customer, 
                            driverUser, 
                            driverEarning, 
                            "Payment for Order #" + order.getId() + " (Driver earning after " + commissionRate.multiply(new BigDecimal("100")) + "% commission)"
                        );
                    } catch (RuntimeException e) {
                        // If insufficient funds, revert status and throw error
                        order.setStatus(OrderStatus.IN_TRANSIT);
                        orderRepository.save(order);
                        throw new RuntimeException("Payment failed: " + e.getMessage() + ". Order status reverted to IN_TRANSIT.");
                    }
                    
                    // Send email notification to customer
                    String customerEmail = order.getCustomer().getEmail();
                    String subject = "Trip Completed";
                    String body = "Your trip is finished. Total Price: LKR " + order.getPrice() + ". Amount debited from your wallet.";
                    emailService.sendEmail(customerEmail, subject, body);
                }
            }
            
            Order savedOrder = orderRepository.save(order);
            return ResponseEntity.ok(savedOrder);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status value: " + status + ". Valid values are: PENDING, ACCEPTED, DRIVER_ARRIVED, IN_TRANSIT, COMPLETED, CANCELLED");
        }
    }
    
    @GetMapping("/drivers/nearby")
    public ResponseEntity<List<Driver>> getNearbyDrivers(
            @RequestParam double lat,
            @RequestParam double lng) {
        List<Driver> nearbyDrivers = driverService.findDriversForOrder(lat, lng);
        return ResponseEntity.ok(nearbyDrivers);
    }
}
