package com.myproject.deliveryapp.service;

import org.springframework.stereotype.Service;

@Service
public class SmsService {
    
    /**
     * Simulates sending an OTP via SMS.
     * In production, this would integrate with a real SMS provider (Twilio, AWS SNS, etc.)
     * 
     * @param phoneNumber The recipient's phone number
     * @param otp The OTP code to send
     * @return true if simulation is successful
     */
    public boolean sendOtp(String phoneNumber, String otp) {
        // Simulate SMS sending by printing to console
        System.out.println("===========================================");
        System.out.println("SIMULATION SMS TO " + phoneNumber + ": Your OTP is " + otp);
        System.out.println("===========================================");
        
        // In production, you would:
        // 1. Call an SMS API (e.g., Twilio, AWS SNS)
        // 2. Handle potential failures
        // 3. Return actual success/failure status
        
        return true;
    }
}
