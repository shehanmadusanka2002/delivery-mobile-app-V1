package com.myproject.deliveryapp.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.myproject.deliveryapp.dto.DriverRegistrationRequest;
import com.myproject.deliveryapp.dto.LoginRequest;
import com.myproject.deliveryapp.dto.LoginResponse;
import com.myproject.deliveryapp.entity.Driver;
import com.myproject.deliveryapp.entity.User;
import com.myproject.deliveryapp.entity.VehicleType;
import com.myproject.deliveryapp.enums.UserRole;
import com.myproject.deliveryapp.repository.DriverRepository;
import com.myproject.deliveryapp.repository.UserRepository;
import com.myproject.deliveryapp.repository.VehicleTypeRepository;
import com.myproject.deliveryapp.util.JwtUtils;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final UserRepository userRepository;
    private final DriverRepository driverRepository;
    private final VehicleTypeRepository vehicleTypeRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;
    
    @PostMapping("/register/customer")
    public ResponseEntity<?> registerCustomer(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }
        user.setRole(UserRole.CUSTOMER);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }
    
    @PostMapping("/register/admin")
    public ResponseEntity<?> registerAdmin(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }
        user.setRole(UserRole.ADMIN);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }
    
    @PostMapping("/register/driver")
    public ResponseEntity<?> registerDriver(@RequestBody DriverRegistrationRequest request) {
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }
        
        // Get vehicle type
        VehicleType vehicleType = vehicleTypeRepository.findById(request.getVehicleType())
                .orElseThrow(() -> new RuntimeException("Vehicle type not found"));
        
        // Create and save User entity
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(UserRole.DRIVER)
                .build();
        User savedUser = userRepository.save(user);
        
        // Create and save Driver entity
        Driver driver = Driver.builder()
                .user(savedUser)
                .vehicleType(vehicleType)
                .licenseNumber(request.getLicenseNumber())
                .vehiclePlateNumber(request.getVehiclePlateNumber())
                .isAvailable(false)
                .build();
        Driver savedDriver = driverRepository.save(driver);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(savedDriver);
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getEmail(),
                    loginRequest.getPassword()
                )
            );
            
            // Get user details
            User user = userRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Check if user is a driver and if driver is approved
            if (user.getRole() == UserRole.DRIVER) {
                Driver driver = driverRepository.findByUser(user)
                        .orElseThrow(() -> new RuntimeException("Driver profile not found"));
                
                if (!driver.getIsApproved()) {
                    throw new BadCredentialsException("Account pending approval. Please contact Admin.");
                }
            }
            
            // Generate JWT token
            String token = jwtUtils.generateToken(loginRequest.getEmail());
            
            LoginResponse response = LoginResponse.builder()
                    .token(token)
                    .email(user.getEmail())
                    .role(user.getRole().name())
                    .build();
            
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }
    }
}
