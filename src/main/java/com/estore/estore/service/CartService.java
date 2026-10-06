package com.estore.estore.service;

import com.estore.estore.dto.request.CartItemRequest;
import com.estore.estore.dto.response.CartItemResponse;
import com.estore.estore.dto.response.CartResponse;
import com.estore.estore.exception.BusinessException;
import com.estore.estore.exception.ResourceNotFoundException;
import com.estore.estore.model.CartItem;
import com.estore.estore.model.Product;
import com.estore.estore.model.User;
import com.estore.estore.repository.CartItemRepository;
import com.estore.estore.repository.ProductRepository;
import com.estore.estore.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(CartItemRepository cartItemRepository, ProductRepository productRepository,
                       UserRepository userRepository) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    // Получить текущего пользователя из SecurityContext
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() || 
            "anonymousUser".equals(authentication.getName())) {
            throw new ResourceNotFoundException("User not authenticated");
        }
        
        String username = authentication.getName();
        System.out.println("=== CART DEBUG: Getting cart for user: " + username + " ===");
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        System.out.println("=== CART DEBUG: User ID: " + user.getId() + ", Username: " + user.getUsername() + " ===");
        
        return user;
    }

    // Получить корзину пользователя
    public CartResponse getCart() {
        User user = getCurrentUser();
        System.out.println("=== CART DEBUG: Fetching cart items for user ID: " + user.getId() + " ===");
        List<CartItem> cartItems = cartItemRepository.findByUser(user);
        System.out.println("=== CART DEBUG: Found " + cartItems.size() + " items in cart ===");

        List<CartItemResponse> items = cartItems.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        BigDecimal totalAmount = items.stream()
                .map(CartItemResponse::getSubTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItems = items.stream()
                .mapToInt(CartItemResponse::getQuantity)
                .sum();

        return new CartResponse(items, totalAmount, totalItems);
    }

    // Добавить товар в корзину
    public CartItemResponse addToCart(CartItemRequest request) {
        User user = getCurrentUser();
        System.out.println("=== CART DEBUG: Adding to cart for user ID: " + user.getId() + ", product ID: " + request.getProductId() + " ===");
        
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        // Проверяем наличие товара
        if (product.getStockQuantity() < request.getQuantity()) {
            throw new BusinessException("Not enough stock for product: " + product.getName());
        }

        // Проверяем, есть ли уже этот товар в корзине
        Optional<CartItem> existingItem = cartItemRepository.findByUserIdAndProductId(user.getId(), product.getId());

        CartItem cartItem;
        if (existingItem.isPresent()) {
            // Обновляем количество если товар уже в корзине
            cartItem = existingItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
            System.out.println("=== CART DEBUG: Updating existing cart item, new quantity: " + cartItem.getQuantity() + " ===");
        } else {
            // Создаем новый элемент корзины
            cartItem = new CartItem(user, product, request.getQuantity());
            System.out.println("=== CART DEBUG: Creating new cart item for user ID: " + user.getId() + " ===");
        }

        CartItem savedItem = cartItemRepository.save(cartItem);
        System.out.println("=== CART DEBUG: Cart item saved with ID: " + savedItem.getId() + ", user ID: " + savedItem.getUser().getId() + " ===");
        return convertToResponse(savedItem);
    }

    // Обновить количество товара в корзине
    public CartItemResponse updateCartItem(Long productId, Integer quantity) {
        User user = getCurrentUser();
        CartItem cartItem = cartItemRepository.findByUserIdAndProductId(user.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found in cart: " + productId));

        Product product = cartItem.getProduct();

        // Проверяем наличие товара
        if (product.getStockQuantity() < quantity) {
            throw new BusinessException("Not enough stock for product: " + product.getName());
        }

        if (quantity <= 0) {
            // Если количество <= 0, удаляем товар из корзины
            cartItemRepository.delete(cartItem);
            return null;
        }

        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);
        return convertToResponse(cartItem);
    }

    // Удалить товар из корзины
    public void removeFromCart(Long productId) {
        User user = getCurrentUser();
        cartItemRepository.deleteByUserIdAndProductId(user.getId(), productId);
    }

    // Очистить корзину
    public void clearCart() {
        User user = getCurrentUser();
        cartItemRepository.deleteByUserId(user.getId());
    }

    // Вспомогательный метод для конвертации CartItem в CartItemResponse
    private CartItemResponse convertToResponse(CartItem cartItem) {
        Product product = cartItem.getProduct();
        return new CartItemResponse(
                cartItem.getId(),
                product.getId(),
                product.getName(),
                product.getPrice(),
                cartItem.getQuantity(),
                cartItem.getSubTotal(),
                cartItem.getAddedAt().toString()
        );
    }
}
