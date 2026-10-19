package com.estore.estore.service;

import com.estore.estore.dto.request.OrderRequest;
import com.estore.estore.dto.response.CartItemResponse;
import com.estore.estore.dto.response.CartResponse;
import com.estore.estore.dto.response.OrderResponse;
import com.estore.estore.exception.BusinessException;
import com.estore.estore.model.Order;
import com.estore.estore.model.Product;
import com.estore.estore.model.User;
import com.estore.estore.repository.OrderRepository;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CartService cartService;

    @InjectMocks
    private OrderService orderService;

    private User user;

    @BeforeEach
    void authenticateUser() {
        user = new User();
        user.setId(1L);
        user.setUsername("alice");

        var authentication = new UsernamePasswordAuthenticationToken(
                "alice",
                null,
                List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(user));
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createOrder_createsOrderUpdatesStockAndClearsCart() {
        Product product = new Product();
        product.setId(10L);
        product.setName("Laptop");
        product.setPrice(new BigDecimal("10.50"));
        product.setStockQuantity(5);

        CartItemResponse item = new CartItemResponse(
                100L,
                10L,
                "Laptop",
                new BigDecimal("10.50"),
                2,
                new BigDecimal("21.00"),
                LocalDateTime.now().toString()
        );
        CartResponse cart = new CartResponse(List.of(item), new BigDecimal("21.00"), 2);

        when(cartService.getCart()).thenReturn(cart);
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order order = invocation.getArgument(0);
            order.setId(50L);
            order.setCreatedAt(LocalDateTime.now());
            return order;
        });

        OrderResponse response = orderService.createOrderFromCart(
                new OrderRequest("Minsk, Main Street 1", "Call before delivery")
        );

        assertEquals(new BigDecimal("21.00"), response.getTotalAmount());
        assertEquals("PENDING", response.getStatus());
        assertEquals(3, product.getStockQuantity());
        assertEquals(1, response.getItems().size());
        verify(productRepository).save(product);
        verify(cartService).clearCart();
    }

    @Test
    void cancelOrder_rejectsShippedOrder() {
        Order order = new Order();
        order.setId(50L);
        order.setUser(user);
        order.setStatus(Order.OrderStatus.SHIPPED);

        when(orderRepository.findById(50L)).thenReturn(Optional.of(order));

        assertThrows(BusinessException.class, () -> orderService.cancelOrder(50L));
        verify(orderRepository, never()).save(any(Order.class));
        verify(productRepository, never()).save(any(Product.class));
    }
}
