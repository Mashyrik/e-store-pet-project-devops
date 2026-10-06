package com.estore.estore.security;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@Component
public class AuthTokenFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;

    public AuthTokenFilter(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            // Очищаем SecurityContext перед установкой нового
            SecurityContextHolder.clearContext();
            
            String jwt = parseJwt(request);
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                String username = jwtUtils.getUserNameFromJwtToken(jwt);

                // ✅ ПОЛУЧАЕМ AUTHORITIES ИЗ ТОКЕНА
                List<GrantedAuthority> authorities = jwtUtils.getAuthoritiesFromJwtToken(jwt);

                // Создаем Authentication объект с authorities из токена
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(username, null, authorities);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);

                // Логирование для отладки
                System.out.println("=== AUTH DEBUG ===");
                System.out.println("User: " + username);
                System.out.println("Authorities from token: " + authorities);
                System.out.println("Request URI: " + request.getRequestURI());
                System.out.println("SecurityContext set for: " + SecurityContextHolder.getContext().getAuthentication().getName());
                System.out.println("==================");
            } else {
                System.out.println("=== AUTH DEBUG: No valid JWT token found ===");
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e);
            System.err.println("=== AUTH ERROR: " + e.getMessage() + " ===");
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }

        return null;
    }
}
