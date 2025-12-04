package com.myproject.deliveryapp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.myproject.deliveryapp.entity.Driver;
import com.myproject.deliveryapp.entity.Order;
import com.myproject.deliveryapp.entity.Review;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Optional<Review> findByOrder(Order order);
    List<Review> findByDriverOrderByCreatedAtDesc(Driver driver);
}
