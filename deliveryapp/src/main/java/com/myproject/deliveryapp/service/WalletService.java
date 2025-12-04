package com.myproject.deliveryapp.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.myproject.deliveryapp.entity.User;
import com.myproject.deliveryapp.entity.Wallet;
import com.myproject.deliveryapp.entity.WalletTransaction;
import com.myproject.deliveryapp.enums.TransactionType;
import com.myproject.deliveryapp.repository.WalletRepository;
import com.myproject.deliveryapp.repository.WalletTransactionRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class WalletService {
    
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    
    /**
     * Creates a new wallet for a user with 0 balance
     */
    public Wallet createWallet(User user) {
        Wallet wallet = Wallet.builder()
                .user(user)
                .balance(BigDecimal.ZERO)
                .build();
        
        Wallet savedWallet = walletRepository.save(wallet);
        log.info("Wallet created for user: {}", user.getEmail());
        return savedWallet;
    }
    
    /**
     * Gets the current balance for a user
     */
    public BigDecimal getBalance(User user) {
        Wallet wallet = walletRepository.findByUser(user)
                .orElseGet(() -> createWallet(user));
        return wallet.getBalance();
    }
    
    /**
     * Tops up a user's wallet with the specified amount
     */
    @Transactional
    public Wallet topUpWallet(User user, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Top-up amount must be greater than zero");
        }
        
        Wallet wallet = walletRepository.findByUser(user)
                .orElseGet(() -> createWallet(user));
        
        // Add amount to balance
        BigDecimal newBalance = wallet.getBalance().add(amount);
        wallet.setBalance(newBalance);
        Wallet updatedWallet = walletRepository.save(wallet);
        
        // Create CREDIT transaction record
        WalletTransaction transaction = WalletTransaction.builder()
                .wallet(wallet)
                .amount(amount)
                .type(TransactionType.CREDIT)
                .description("Wallet top-up")
                .build();
        walletTransactionRepository.save(transaction);
        
        log.info("Wallet topped up for user: {}. Amount: {}. New balance: {}", 
                user.getEmail(), amount, newBalance);
        
        return updatedWallet;
    }
    
    /**
     * Transfers funds from sender to receiver
     */
    @Transactional
    public void transferFunds(User sender, User receiver, BigDecimal amount, String description) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Transfer amount must be greater than zero");
        }
        
        // Get sender's wallet
        Wallet senderWallet = walletRepository.findByUser(sender)
                .orElseGet(() -> createWallet(sender));
        
        // Get receiver's wallet
        Wallet receiverWallet = walletRepository.findByUser(receiver)
                .orElseGet(() -> createWallet(receiver));
        
        // Check if sender has enough balance
        if (senderWallet.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient balance. Current balance: " + senderWallet.getBalance());
        }
        
        // Deduct from sender
        BigDecimal senderNewBalance = senderWallet.getBalance().subtract(amount);
        senderWallet.setBalance(senderNewBalance);
        walletRepository.save(senderWallet);
        
        // Create DEBIT transaction for sender
        WalletTransaction debitTransaction = WalletTransaction.builder()
                .wallet(senderWallet)
                .amount(amount)
                .type(TransactionType.DEBIT)
                .description(description != null ? description : "Transfer to " + receiver.getEmail())
                .build();
        walletTransactionRepository.save(debitTransaction);
        
        // Add to receiver
        BigDecimal receiverNewBalance = receiverWallet.getBalance().add(amount);
        receiverWallet.setBalance(receiverNewBalance);
        walletRepository.save(receiverWallet);
        
        // Create CREDIT transaction for receiver
        WalletTransaction creditTransaction = WalletTransaction.builder()
                .wallet(receiverWallet)
                .amount(amount)
                .type(TransactionType.CREDIT)
                .description(description != null ? description : "Transfer from " + sender.getEmail())
                .build();
        walletTransactionRepository.save(creditTransaction);
        
        log.info("Funds transferred from {} to {}. Amount: {}. Sender balance: {}. Receiver balance: {}", 
                sender.getEmail(), receiver.getEmail(), amount, senderNewBalance, receiverNewBalance);
    }
    
    /**
     * Gets wallet for a user
     */
    public Wallet getWallet(User user) {
        return walletRepository.findByUser(user)
                .orElseGet(() -> createWallet(user));
    }
    
    /**
     * Gets transaction history for a user's wallet
     */
    public List<WalletTransaction> getTransactionHistory(User user) {
        Wallet wallet = walletRepository.findByUser(user)
                .orElseGet(() -> createWallet(user));
        return walletTransactionRepository.findByWalletOrderByTimestampDesc(wallet);
    }
}
