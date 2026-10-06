class CartService {
    static API_BASE_URL = 'http://localhost:8080/api/cart';

    static getToken() {
        return localStorage.getItem('token');
    }

    static isAuthenticated() {
        return !!this.getToken();
    }

    static getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }

    static async getCart() {
        if (!this.isAuthenticated()) {
            console.log('User not authenticated, returning empty cart');
            return { items: [], totalAmount: 0, totalItems: 0 };
        }

        try {
            const response = await fetch(this.API_BASE_URL, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.log('Unauthorized, returning empty cart');
                    return { items: [], totalAmount: 0, totalItems: 0 };
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const cartData = await response.json();
            console.log('Cart loaded from API:', cartData);
            
            return {
                items: cartData.items || [],
                totalAmount: this.parseBigDecimal(cartData.totalAmount),
                totalItems: cartData.totalItems || 0
            };
        } catch (error) {
            console.error('Failed to load cart from API:', error);
            return { items: [], totalAmount: 0, totalItems: 0 };
        }
    }

    static async addToCart(productId, quantity = 1) {
        if (!this.isAuthenticated()) {
            throw new Error('Необходима авторизация для добавления товаров в корзину');
        }

        try {
            const response = await fetch(`${this.API_BASE_URL}/items`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    productId: productId,
                    quantity: quantity
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Ошибка ${response.status}: ${response.statusText}`);
            }

            const item = await response.json();
            console.log('Item added to cart:', item);
            return item;
        } catch (error) {
            console.error('Failed to add item to cart:', error);
            throw error;
        }
    }

    static async updateCartItem(productId, quantity) {
        if (!this.isAuthenticated()) {
            throw new Error('Необходима авторизация для обновления корзины');
        }

        try {
            const response = await fetch(`${this.API_BASE_URL}/items/${productId}?quantity=${quantity}`, {
                method: 'PUT',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                if (response.status === 204) {
                    return null;
                }
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Ошибка ${response.status}: ${response.statusText}`);
            }

            const item = await response.json();
            console.log('Cart item updated:', item);
            return item;
        } catch (error) {
            console.error('Failed to update cart item:', error);
            throw error;
        }
    }

    static async removeFromCart(productId) {
        if (!this.isAuthenticated()) {
            throw new Error('Необходима авторизация для удаления товаров из корзины');
        }

        try {
            const response = await fetch(`${this.API_BASE_URL}/items/${productId}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            if (!response.ok && response.status !== 204) {
                throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
            }

            console.log('Item removed from cart:', productId);
            return true;
        } catch (error) {
            console.error('Failed to remove item from cart:', error);
            throw error;
        }
    }

    static async clearCart() {
        if (!this.isAuthenticated()) {
            throw new Error('Необходима авторизация для очистки корзины');
        }

        try {
            const response = await fetch(this.API_BASE_URL, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            if (!response.ok && response.status !== 204) {
                throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
            }

            console.log('Cart cleared');
            return true;
        } catch (error) {
            console.error('Failed to clear cart:', error);
            throw error;
        }
    }

    static async getCartCount() {
        try {
            const cart = await this.getCart();
            return cart.totalItems || 0;
        } catch (error) {
            console.error('Failed to get cart count:', error);
            return 0;
        }
    }

    static parseBigDecimal(value) {
        if (value === null || value === undefined) {
            return 0;
        }
        if (typeof value === 'number') {
            return value;
        }
        if (typeof value === 'object' && value !== null) {
            return parseFloat(value) || 0;
        }
        return parseFloat(value) || 0;
    }

    static convertCartItemToUI(item) {
        return {
            id: item.productId,
            cartItemId: item.id,
            name: item.productName,
            price: this.parseBigDecimal(item.productPrice),
            quantity: item.quantity,
            subTotal: this.parseBigDecimal(item.subTotal)
        };
    }
}

window.CartService = CartService;
