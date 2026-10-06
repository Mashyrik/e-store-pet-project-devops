class CheckoutComponent {
    static async init() {
        console.log('Initializing CheckoutComponent');

        if (!AuthService.isAuthenticated()) {
            this.showError('Для оформления заказа необходимо войти в систему');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }

        if (!window.cart) {
            window.cart = new SimpleCart();
        }
        await window.cart.load();

        if (!window.cart || window.cart.items.length === 0) {
            this.showEmptyCart();
            return;
        }

        this.loadCartItems();

        const form = document.getElementById('checkoutForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    static loadCartItems() {
        const orderItemsContainer = document.getElementById('orderItems');
        const itemsTotalEl = document.getElementById('itemsTotal');
        const totalAmountEl = document.getElementById('totalAmount');

        if (!window.cart || window.cart.items.length === 0) {
            this.showEmptyCart();
            return;
        }

        const items = window.cart.items;
        let itemsTotal = 0;

        const itemsHtml = items.map(item => {
            const itemTotal = item.price * (item.quantity || 1);
            itemsTotal += itemTotal;

            return `
                <div class="order-item">
                    <div class="order-item-info">
                        <div class="order-item-name">${item.name || 'Товар'}</div>
                        <div class="order-item-details">
                            ${item.model ? `Модель: ${item.model}` : ''} 
                            ${item.quantity > 1 ? `× ${item.quantity}` : ''}
                        </div>
                    </div>
                    <div class="order-item-price">
                        ${this.formatPrice(itemTotal)} BYN
                    </div>
                </div>
            `;
        }).join('');

        orderItemsContainer.innerHTML = itemsHtml;
        itemsTotalEl.textContent = `${this.formatPrice(itemsTotal)} BYN`;
        totalAmountEl.textContent = `${this.formatPrice(itemsTotal)} BYN`;
    }

    static async handleSubmit(e) {
        e.preventDefault();

        const submitBtn = document.getElementById('submitOrderBtn');
        const form = document.getElementById('checkoutForm');

        this.clearErrors();
        const city = document.getElementById('city').value.trim();
        const street = document.getElementById('street').value.trim();
        const house = document.getElementById('house').value.trim();
        const apartment = document.getElementById('apartment').value.trim();
        const postalCode = document.getElementById('postalCode').value.trim();
        const notes = document.getElementById('notes').value.trim();

        if (!city || !street || !house) {
            this.showError('Пожалуйста, заполните все обязательные поля');
            if (!city) this.showFieldError('city', 'Город обязателен для заполнения');
            if (!street) this.showFieldError('street', 'Улица обязательна для заполнения');
            if (!house) this.showFieldError('house', 'Дом обязателен для заполнения');
            return;
        }

        let shippingAddress = `${city}, ${street}, д. ${house}`;
        if (apartment) {
            shippingAddress += `, кв. ${apartment}`;
        }
        if (postalCode) {
            shippingAddress += `, ${postalCode}`;
        }

        const orderData = {
            shippingAddress: shippingAddress,
            notes: notes || null
        };

        submitBtn.disabled = true;
        submitBtn.textContent = 'Оформление...';

        try {
            await this.syncCartToServer();

            const order = await this.createOrder(orderData);

            this.showSuccess('Заказ успешно оформлен!');

            if (window.cart) {
                await window.cart.clear();
            }

            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 2000);

        } catch (error) {
            console.error('Error creating order:', error);
            this.showError(error.message || 'Ошибка при оформлении заказа. Попробуйте еще раз.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Оформить заказ';
        }
    }

    static async syncCartToServer() {
        if (window.cart) {
            await window.cart.load();
        }
        console.log('Корзина уже на сервере, синхронизация не требуется');
    }

    static async createOrder(orderData) {
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('Необходима авторизация');
        }

        try {
            const response = await fetch('http://localhost:8080/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Ошибка ${response.status}: ${response.statusText}`);
            }

            const order = await response.json();
            console.log('Order created:', order);
            return order;

        } catch (error) {
            console.error('Failed to create order:', error);
            throw error;
        }
    }

    static showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorEl = document.getElementById(fieldId + 'Error');
        
        if (field) {
            field.style.borderColor = '#ef4444';
        }
        
        if (errorEl) {
            errorEl.textContent = message;
        }
    }

    static clearErrors() {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(el => el.textContent = '');

        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.style.borderColor = '#e5e7eb';
        });
    }

    static showError(message) {
        if (typeof App !== 'undefined' && App.showNotification) {
            App.showNotification(message, 'error');
        } else {
            alert(message);
        }
    }

    static showSuccess(message) {
        if (typeof App !== 'undefined' && App.showNotification) {
            App.showNotification(message, 'success');
        } else {
            alert(message);
        }
    }

    static showEmptyCart() {
        const container = document.querySelector('.checkout-container');
        if (container) {
            container.innerHTML = `
                <div class="empty-cart" style="grid-column: 1/-1;">
                    <div class="empty-cart-icon">🛒</div>
                    <h2>Корзина пуста</h2>
                    <p style="color: #6b7280; margin-bottom: 2rem;">Добавьте товары в корзину перед оформлением заказа</p>
                    <a href="products.html" class="btn btn-primary">Перейти к товарам</a>
                </div>
            `;
        }
    }

    static formatPrice(price) {
        return new Intl.NumberFormat('ru-RU').format(price);
    }
}

window.CheckoutComponent = CheckoutComponent;

