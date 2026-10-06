package com.estore.estore.dto.response;

import com.estore.estore.model.Order;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class OrderResponse {

    private Long id;
    private Long userId;
    private String username;
    private BigDecimal totalAmount;
    private String status;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    private String shippingAddress;
    private String notes;
    private List<OrderItemResponse> items;

    // Конструкторы
    public OrderResponse() {}

    public OrderResponse(Long id, Long userId, String username, BigDecimal totalAmount,
                         String status, LocalDateTime createdAt, String shippingAddress,
                         String notes, List<OrderItemResponse> items) {
        this.id = id;
        this.userId = userId;
        this.username = username;
        this.totalAmount = totalAmount;
        this.status = status;
        this.createdAt = createdAt;
        this.shippingAddress = shippingAddress;
        this.notes = notes;
        this.items = items;
    }

    // Статический метод для конвертации из Order

    public static OrderResponse fromOrder(Order order) {
        List<OrderItemResponse> items = order.getOrderItems().stream()
                .map(OrderItemResponse::fromOrderItem)
                .collect(Collectors.toList());

        return new OrderResponse(
                order.getId(),
                order.getUser().getId(),
                order.getUser().getUsername(),
                order.getTotalAmount(),
                order.getStatus().name(),
                order.getCreatedAt(),
                order.getShippingAddress(), // ← Теперь используем поле из Order
                order.getNotes(),           // ← Теперь используем поле из Order
                items
        );
    }

    // Геттеры и сеттеры
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<OrderItemResponse> getItems() { return items; }
    public void setItems(List<OrderItemResponse> items) { this.items = items; }
}