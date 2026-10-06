package com.estore.estore.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class OrderRequest {

    @NotBlank(message = "Shipping address is required")
    @Size(min = 5, max = 200, message = "Shipping address must be between 5 and 200 characters")
    private String shippingAddress;

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;

    // Конструкторы
    public OrderRequest() {}

    public OrderRequest(String shippingAddress, String notes) {
        this.shippingAddress = shippingAddress;
        this.notes = notes;
    }

    // Геттеры и сеттеры
    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}