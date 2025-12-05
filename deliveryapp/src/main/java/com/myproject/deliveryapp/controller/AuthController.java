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
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

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
import com.myproject.deliveryapp.service.EmailService;
import com.myproject.deliveryapp.service.FileStorageService;
import com.myproject.deliveryapp.service.SmsService;
import com.myproject.deliveryapp.util.JwtUtils;

import lombok.RequiredArgsConstructor;

import java.util.Random;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

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
    private final FileStorageService fileStorageService;
    private final EmailService emailService;
    private final SmsService smsService;
    
    // Temporary storage for phone OTPs during registration
    private final Map<String, String> phoneOtpStorage = new ConcurrentHashMap<>();
    
    private String generateVerificationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // 6-digit code
        return String.valueOf(code);
    }
    
    @PostMapping("/register/customer")
    public ResponseEntity<?> registerCustomer(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }
        
        // Generate verification code
        String verificationCode = generateVerificationCode();
        
        user.setRole(UserRole.CUSTOMER);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setVerificationCode(verificationCode);
        user.setIsEmailVerified(false);
        user.setIsPhoneVerified(false);
        
        User savedUser = userRepository.save(user);
        
        // Send verification email
        try {
            emailService.sendEmail(
                user.getEmail(),
                "Verify your account",
                "Welcome to our Delivery Service!\n\nYour verification code is: " + verificationCode + "\n\nPlease enter this code to verify your email address.\n\nThank you!"
            );
        } catch (Exception e) {
            // Log error but don't fail registration
            System.err.println("Failed to send verification email: " + e.getMessage());
        }
        
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
    
    @PostMapping(value = "/register/driver", consumes = {"multipart/form-data"})
    public ResponseEntity<?> registerDriver(
            @RequestPart("data") DriverRegistrationRequest request,
            @RequestPart(value = "profilePhoto", required = false) MultipartFile profilePhoto,
            @RequestPart(value = "licensePhoto", required = false) MultipartFile licensePhoto) {
        
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }
        
        // Get vehicle type
        VehicleType vehicleType = vehicleTypeRepository.findById(request.getVehicleType())
                .orElseThrow(() -> new RuntimeException("Vehicle type not found"));
        
        // Generate verification code
        String verificationCode = generateVerificationCode();
        
        // Create and save User entity
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(UserRole.DRIVER)
                .verificationCode(verificationCode)
                .isEmailVerified(false)
                .isPhoneVerified(false)
                .build();
        User savedUser = userRepository.save(user);
        
        // Send verification email
        try {
            emailService.sendEmail(
                user.getEmail(),
                "Verify your account",
                "Welcome to our Delivery Service!\n\nYour verification code is: " + verificationCode + "\n\nPlease enter this code to verify your email address.\n\nThank you!"
            );
        } catch (Exception e) {
            // Log error but don't fail registration
            System.err.println("Failed to send verification email: " + e.getMessage());
        }
        
        // Store uploaded files and get filenames
        String profilePhotoUrl = null;
        String licensePhotoUrl = null;
        
        if (profilePhoto != null && !profilePhoto.isEmpty()) {
            profilePhotoUrl = fileStorageService.storeFile(profilePhoto);
        }
        
        if (licensePhoto != null && !licensePhoto.isEmpty()) {
            licensePhotoUrl = fileStorageService.storeFile(licensePhoto);
        }
        
        // Create and save Driver entity with image URLs and bank details
        Driver driver = Driver.builder()
                .user(savedUser)
                .vehicleType(vehicleType)
                .licenseNumber(request.getLicenseNumber())
                .vehiclePlateNumber(request.getVehiclePlateNumber())
                .profilePhotoUrl(profilePhotoUrl)
                .licensePhotoUrl(licensePhotoUrl)
                .bankName(request.getBankName())
                .branchName(request.getBranchName())
                .accountNumber(request.getAccountNumber())
                .accountHolderName(request.getAccountHolderName())
                .isAvailable(false)
                .build();
        Driver savedDriver = driverRepository.save(driver);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(savedDriver);
    }
    
    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody VerifyEmailRequest request) {
        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if already verified
        if (user.getIsEmailVerified()) {
            return ResponseEntity.ok().body("Email already verified");
        }
        
        // Check if code matches
        if (user.getVerificationCode() == null || !user.getVerificationCode().equals(request.getCode())) {
            return ResponseEntity.badRequest().body("Invalid Code");
        }
        
        // Verify email
        user.setIsEmailVerified(true);
        user.setVerificationCode(null); // Clear the code
        userRepository.save(user);
        
        return ResponseEntity.ok().body("Email verified successfully");
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
    
    @PostMapping("/send-phone-otp")
    public ResponseEntity<?> sendPhoneOtp(@RequestBody PhoneOtpRequest request) {
        try {
            if (request.getPhone() == null || request.getPhone().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Phone number is required");
            }
            
            // Generate 6-digit OTP
            String otp = generateVerificationCode();
            
            // Store OTP temporarily (in-memory for registration)
            phoneOtpStorage.put(request.getPhone().trim(), otp);
            
            // Send OTP via SMS (simulation)
            boolean sent = smsService.sendOtp(request.getPhone(), otp);
            
            if (sent) {
                return ResponseEntity.ok().body("OTP sent successfully");
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Failed to send OTP");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error sending OTP: " + e.getMessage());
        }
    }
    
    @PostMapping("/verify-phone-otp")
    public ResponseEntity<?> verifyPhoneOtp(@RequestBody VerifyPhoneOtpRequest request) {
        try {
            if (request.getPhone() == null || request.getPhone().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Phone number is required");
            }
            
            if (request.getOtp() == null || request.getOtp().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("OTP is required");
            }
            
            // Check OTP from temporary storage (for registration)
            String storedOtp = phoneOtpStorage.get(request.getPhone().trim());
            
            if (storedOtp == null) {
                return ResponseEntity.badRequest().body("No OTP found. Please request a new OTP.");
            }
            
            if (!storedOtp.equals(request.getOtp().trim())) {
                return ResponseEntity.badRequest().body("Invalid OTP");
            }
            
            // OTP is valid - remove from temporary storage
            phoneOtpStorage.remove(request.getPhone().trim());
            
            return ResponseEntity.ok().body("Phone verified successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error verifying OTP: " + e.getMessage());
        }
    }
}

// DTO for email verification
class VerifyEmailRequest {
    private String email;
    private String code;
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getCode() {
        return code;
    }
    
    public void setCode(String code) {
        this.code = code;
    }
}

// DTO for phone OTP request
class PhoneOtpRequest {
    private String phone;
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
}

// DTO for phone OTP verification
class VerifyPhoneOtpRequest {
    private String phone;
    private String otp;
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public String getOtp() {
        return otp;
    }
    
    public void setOtp(String otp) {
        this.otp = otp;
    }
}
