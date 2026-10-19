package com.estore.estore.service;

import com.estore.estore.dto.request.CartItemRequest;
import com.estore.estore.exception.BusinessException;
import com.estore.estore.model.CartItem;
import com.estore.estore.model.Product;
import com.estore.estore.model.User;
import com.estore.estore.repository.CartItemRepository;
import com.estore.estore.repository.ProductRepository;
import com.estore.estore.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CartService cartService;

    @BeforeEach
    void authenticateUser() {
        var authentication = new UsernamePasswordAuthenticationToken(
                "alice",
                null,
                List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void addToCart_rejectsTotalQuantityAboveStock() {
        User user = new User();
        user.setId(1L);
        user.setUsername("alice");

        Product product = new Product();
        product.setId(10L);
        product.setName("Laptop");
        product.setStockQuantity(5);

        CartItem existingItem = new CartItem(user, product, 4);

        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(user));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(cartItemRepository.findByUserIdAndProductId(1L, 10L))
                .thenReturn(Optional.of(existingItem));

        CartItemRequest request = new CartItemRequest(10L, 2);

        assertThrows(BusinessException.class, () -> cartService.addToCart(request));
        verify(cartItemRepository, never()).save(existingItem);
    }
}
