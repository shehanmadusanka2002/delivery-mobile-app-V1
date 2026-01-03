package com.myproject.deliveryapp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.myproject.deliveryapp.dto.UserProfileDTO;
import com.myproject.deliveryapp.dto.UserUpdateRequest;
import com.myproject.deliveryapp.entity.User;
import com.myproject.deliveryapp.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserRepository userRepository;
    
    /**
     * Get user profile by email
     * Users can only access their own profile
     */
    @GetMapping("/email/{email}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'DRIVER', 'ADMIN')")
    public ResponseEntity<UserProfileDTO> getUserByEmail(
            @PathVariable String email,
            Authentication authentication) {
        
        String authenticatedEmail = authentication.getName();
        
        // Users can only access their own profile (unless admin)
        if (!email.equals(authenticatedEmail) && !authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).build();
        }
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserProfileDTO profileDTO = UserProfileDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getName())
                .phoneNumber(user.getPhone())
                .role(user.getRole().name())
                .build();
        
        return ResponseEntity.ok(profileDTO);
    }
    
    /**
     * Get current user's profile
     */
    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'DRIVER', 'ADMIN')")
    public ResponseEntity<UserProfileDTO> getCurrentUserProfile(Authentication authentication) {
        String email = authentication.getName();
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserProfileDTO profileDTO = UserProfileDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getName())
                .phoneNumber(user.getPhone())
                .role(user.getRole().name())
                .build();
        
        return ResponseEntity.ok(profileDTO);
    }
    
    /**
     * Update user profile
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'DRIVER', 'ADMIN')")
    public ResponseEntity<UserProfileDTO> updateUser(
            @PathVariable Long id,
            @RequestBody UserUpdateRequest request,
            Authentication authentication) {
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String authenticatedEmail = authentication.getName();
        
        // Users can only update their own profile (unless admin)
        if (!user.getEmail().equals(authenticatedEmail) && !authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).build();
        }
        
        // Update user fields
        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setName(request.getFullName().trim());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhone(request.getPhoneNumber().trim());
        }
        
        userRepository.save(user);
        
        UserProfileDTO profileDTO = UserProfileDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getName())
                .phoneNumber(user.getPhone())
                .role(user.getRole().name())
                .build();
        
        return ResponseEntity.ok(profileDTO);
    }
}
