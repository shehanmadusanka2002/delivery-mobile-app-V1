package com.myproject.deliveryapp.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.myproject.deliveryapp.entity.User;
import com.myproject.deliveryapp.entity.Wallet;
import com.myproject.deliveryapp.entity.WalletTransaction;
import com.myproject.deliveryapp.repository.UserRepository;
import com.myproject.deliveryapp.service.WalletService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {
    
    private final WalletService walletService;
    private final UserRepository userRepository;
    
    @GetMapping("/balance")
    public ResponseEntity<BigDecimal> getBalance() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        BigDecimal balance = walletService.getBalance(user);
        return ResponseEntity.ok(balance);
    }
    
    @PostMapping("/top-up")
    public ResponseEntity<Wallet> topUpWallet(@RequestParam BigDecimal amount) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Wallet wallet = walletService.topUpWallet(user, amount);
        return ResponseEntity.ok(wallet);
    }
    
    @GetMapping("/transactions")
    public ResponseEntity<List<WalletTransaction>> getTransactions() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<WalletTransaction> transactions = walletService.getTransactionHistory(user);
        return ResponseEntity.ok(transactions);
    }
}
