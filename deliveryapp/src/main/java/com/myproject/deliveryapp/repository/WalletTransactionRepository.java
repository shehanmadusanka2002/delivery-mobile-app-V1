package com.myproject.deliveryapp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.myproject.deliveryapp.entity.Wallet;
import com.myproject.deliveryapp.entity.WalletTransaction;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {
    List<WalletTransaction> findByWalletOrderByTimestampDesc(Wallet wallet);
}
