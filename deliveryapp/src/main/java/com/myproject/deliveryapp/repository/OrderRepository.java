package com.myproject.deliveryapp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.myproject.deliveryapp.entity.Driver;
import com.myproject.deliveryapp.entity.Order;
import com.myproject.deliveryapp.entity.User;
import com.myproject.deliveryapp.enums.OrderStatus;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerOrderByCreatedAtDesc(User customer);
    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);
    List<Order> findByDriverOrderByCreatedAtDesc(Driver driver);
    List<Order> findAllByOrderByCreatedAtDesc();
    List<Order> findByDriverAndStatusAndCompletedAtBetween(Driver driver, OrderStatus status, java.time.LocalDateTime start, java.time.LocalDateTime end);
    List<Order> findByDriverAndStatusOrderByCompletedAtDesc(Driver driver, OrderStatus status);
}
