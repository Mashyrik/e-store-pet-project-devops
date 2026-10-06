package com.estore.estore.controller;

import com.estore.estore.dto.request.CartItemRequest;
import com.estore.estore.dto.response.CartItemResponse;
import com.estore.estore.dto.response.CartResponse;
import com.estore.estore.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<CartResponse> getCart() {
        CartResponse cart = cartService.getCart();
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/items")
    public ResponseEntity<CartItemResponse> addToCart(@Valid @RequestBody CartItemRequest request) {
        CartItemResponse item = cartService.addToCart(request);
        return ResponseEntity.ok(item);
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<CartItemResponse> updateCartItem(
            @PathVariable Long productId,
            @RequestParam Integer quantity) {
        CartItemResponse item = cartService.updateCartItem(productId, quantity);
        if (item == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(item);
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<Void> removeFromCart(@PathVariable Long productId) {
        cartService.removeFromCart(productId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart() {
        cartService.clearCart();
        return ResponseEntity.noContent().build();
    }
}
