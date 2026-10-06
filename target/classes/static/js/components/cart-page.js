class CartPageComponent {
  
    static async init() {
       
        console.log('Initializing CartPageComponent');

        
        if (!window.cart) {
           
            window.cart = new SimpleCart();
        }

        await window.cart.load();
       
        this.renderCart();
    }

    
    static renderCart() {
        
        const container = document.getElementById('cartContainer');
        
        if (!container) return;

       
        if (!window.cart || window.cart.items.length === 0) {
            container.innerHTML = `
                <div class="empty-cart" style="grid-column: 1/-1;">
                    <div class="empty-cart-icon">🛒</div>
                    <h2>Корзина пуста</h2>
                    <p style="color: #6b7280; margin-bottom: 2rem;">Добавьте товары в корзину</p>
                    <a href="products.html" class="btn btn-primary">Перейти к товарам</a>
                </div>
            `;
            return;
        }

        const items = window.cart.items;
        let itemsTotal = window.cart.totalAmount || 0;
        
        if (itemsTotal === 0 && items.length > 0) {
            itemsTotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
        }

        const itemsHtml = items.map(item => {
            const itemTotal = item.price * (item.quantity || 1);

            return `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item-image">
                        <div class="product-icon">${this.getProductIcon(item.category)}</div>
                    </div>
                    <div class="cart-item-info">
                        <h4>${item.name || 'Товар'}</h4>
                        <div class="cart-item-model">
                            ${item.model ? `Модель: ${item.model}` : ''}
                            ${item.category ? ` • ${item.category}` : ''}
                        </div>
                    </div>
                    <div class="cart-item-price">
                        ${this.formatPrice(item.price)} BYN
                    </div>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="CartPageComponent.decreaseQuantity(${item.id})">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity || 1}" 
                               min="1" onchange="CartPageComponent.updateQuantity(${item.id}, this.value)">
                        <button class="quantity-btn" onclick="CartPageComponent.increaseQuantity(${item.id})">+</button>
                    </div>
                    <button class="remove-btn" onclick="CartPageComponent.removeItem(${item.id})">
                        Удалить
                    </button>
                </div>
            `;
        }).join('');

        const totalHtml = `
            <div class="cart-summary">
                <h3>Итого</h3>
                <div class="summary-row">
                    <span>Товары (${items.length}):</span>
                    <span>${this.formatPrice(itemsTotal)} BYN</span>
                </div>
                <div class="summary-row">
                    <span>Доставка:</span>
                    <span>Бесплатно</span>
                </div>
                <div class="summary-row summary-total">
                    <span>К оплате:</span>
                    <span>${this.formatPrice(itemsTotal)} BYN</span>
                </div>
                <a href="checkout.html" class="btn btn-primary checkout-btn">
                    Оформить заказ
                </a>
                <a href="products.html" class="continue-shopping" style="display: block; text-align: center; margin-top: 1rem;">
                    ← Продолжить покупки
                </a>
            </div>
        `;

        container.innerHTML = `
            <div class="cart-items">
                <h2 style="margin-bottom: 1.5rem; color: #111827;">Товары в корзине</h2>
                ${itemsHtml}
            </div>
            ${totalHtml}
        `;
    }

    static async increaseQuantity(productId) {
        const item = window.cart.items.find(i => i.id === productId);
        if (item) {
            try {
                const newQuantity = (item.quantity || 1) + 1;
                await window.cart.updateQuantity(productId, newQuantity);
                this.renderCart();
            } catch (error) {
                console.error('Error increasing quantity:', error);
                if (typeof App !== 'undefined' && App.showNotification) {
                    App.showNotification('Ошибка при обновлении количества товара', 'error');
                }
            }
        }
    }

    static async decreaseQuantity(productId) {
        const item = window.cart.items.find(i => i.id === productId);
        if (item) {
            try {
                if (item.quantity > 1) {
                    const newQuantity = item.quantity - 1;
                    await window.cart.updateQuantity(productId, newQuantity);
                    this.renderCart();
                } else {
                    await this.removeItem(productId);
                }
            } catch (error) {
                console.error('Error decreasing quantity:', error);
                if (typeof App !== 'undefined' && App.showNotification) {
                    App.showNotification('Ошибка при обновлении количества товара', 'error');
                }
            }
        }
    }

    static async updateQuantity(productId, quantity) {
        const qty = parseInt(quantity);
        if (qty > 0) {
            try {
                await window.cart.updateQuantity(productId, qty);
                this.renderCart();
            } catch (error) {
                console.error('Error updating quantity:', error);
                if (typeof App !== 'undefined' && App.showNotification) {
                    App.showNotification('Ошибка при обновлении количества товара', 'error');
                }
            }
        } else {
            await this.removeItem(productId);
        }
    }

    static async removeItem(productId) {
        if (confirm('Удалить товар из корзины?')) {
            try {
                await window.cart.remove(productId);
                this.renderCart();
                
                if (typeof App !== 'undefined' && App.showNotification) {
                    App.showNotification('Товар удален из корзины', 'info');
                }
            } catch (error) {
                console.error('Error removing item:', error);
                if (typeof App !== 'undefined' && App.showNotification) {
                    App.showNotification('Ошибка при удалении товара', 'error');
                }
            }
        }
    }

    static getProductIcon(categoryName) {
        if (!categoryName) return '🔌';
        
        // Безопасное преобразование categoryName в строку
        const categoryStr = typeof categoryName === 'string' 
            ? categoryName 
            : (typeof categoryName === 'object' && categoryName !== null && categoryName.name 
                ? categoryName.name 
                : String(categoryName || ''));
        
        const icons = {
            'Смартфоны': '📱',
            'Планшеты': '📱',
            'Ноутбуки': '💻',
            'Телевизоры': '📺',
            'Аудиотехника': '🎧',
            'Наушники': '🎧',
            'Колонки': '🔊',
            'Гаджеты': '⌚',
            'default': '🔌'
        };

        for (const [key, icon] of Object.entries(icons)) {
            if (categoryStr.toLowerCase().includes(key.toLowerCase())) {
                return icon;
            }
        }
        return icons.default;
    }

    static formatPrice(price) {
        return new Intl.NumberFormat('ru-RU').format(price);
    }
}

window.CartPageComponent = CartPageComponent;
