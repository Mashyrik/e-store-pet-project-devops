// В OrderRepository.java должны быть эти методы:
package com.estore.estore.repository;

import com.estore.estore.model.Order;
import com.estore.estore.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserOrderByCreatedAtDesc(User user);
    List<Order> findByUserId(Long userId);
    List<Order> findAllByOrderByCreatedAtDesc();
    List<Order> findByStatus(Order.OrderStatus status);
}