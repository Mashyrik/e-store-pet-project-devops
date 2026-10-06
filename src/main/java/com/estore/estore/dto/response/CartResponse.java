package com.estore.estore.dto.response;

import java.math.BigDecimal;
import java.util.List;

public class CartResponse {

    private List<CartItemResponse> items;
    private BigDecimal totalAmount;
    private int totalItems;

    // Конструкторы
    public CartResponse() {}

    public CartResponse(List<CartItemResponse> items, BigDecimal totalAmount, int totalItems) {
        this.items = items;
        this.totalAmount = totalAmount;
        this.totalItems = totalItems;
    }

    // Геттеры и сеттеры
    public List<CartItemResponse> getItems() { return items; }
    public void setItems(List<CartItemResponse> items) { this.items = items; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public int getTotalItems() { return totalItems; }
    public void setTotalItems(int totalItems) { this.totalItems = totalItems; }
}