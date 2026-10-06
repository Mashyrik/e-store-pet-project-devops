console.log('🛒 Loading cart component...');

class SimpleCart {
    constructor() {
        console.log('🛒 Creating new cart instance');
        this.items = [];
        this.totalAmount = 0;
        this.totalItems = 0;
        this.load();
    }

    async load() {
        try {
            if (!CartService || !CartService.isAuthenticated()) {
                console.log('📥 User not authenticated, cart is empty');
                this.items = [];
                this.totalAmount = 0;
                this.totalItems = 0;
                return;
            }

            const cartData = await CartService.getCart();
            this.items = (cartData.items || []).map(item => CartService.convertCartItemToUI(item));
            this.totalAmount = cartData.totalAmount || 0;
            this.totalItems = cartData.totalItems || 0;
            console.log(`📥 Cart loaded from server: ${this.items.length} items`);
        } catch (error) {
            console.error('❌ Error loading cart:', error);
            this.items = [];
            this.totalAmount = 0;
            this.totalItems = 0;
        }
    }

    async save() {
        console.log('💾 Cart is stored on server');
        
        if (typeof App !== 'undefined' && App.updateCartCount) {
            await App.updateCartCount();
        }
    }

    async add(product) {
        console.log(`➕ Adding product to cart: ${product.name}`);

        if (!CartService || !CartService.isAuthenticated()) {
            const errorMsg = 'Необходима авторизация для добавления товаров в корзину';
            if (typeof App !== 'undefined' && App.showNotification) {
                App.showNotification(errorMsg, 'error');
            }
            throw new Error(errorMsg);
        }

        try {
            await CartService.addToCart(product.id, product.quantity || 1);
            
            await this.load();

            if (typeof App !== 'undefined' && App.showNotification) {
                App.showNotification(`"${product.name}" добавлен в корзину`, 'success');
            } else {
                console.log(`✅ "${product.name}" added to cart`);
            }
        } catch (error) {
            console.error('❌ Error adding to cart:', error);
            if (typeof App !== 'undefined' && App.showNotification) {
                App.showNotification(error.message || 'Ошибка при добавлении товара в корзину', 'error');
            }
            throw error;
        }
    }

    async remove(id) {
        console.log(`➖ Removing product ${id} from cart`);

        if (!CartService || !CartService.isAuthenticated()) {
            throw new Error('Необходима авторизация для удаления товаров из корзины');
        }

        try {
            await CartService.removeFromCart(id);
            await this.load();
        } catch (error) {
            console.error('❌ Error removing from cart:', error);
            throw error;
        }
    }

    async clear() {
        console.log('🗑️ Clearing cart');

        if (!CartService || !CartService.isAuthenticated()) {
            this.items = [];
            this.totalAmount = 0;
            this.totalItems = 0;
            return;
        }

        try {
            await CartService.clearCart();
            await this.load();
        } catch (error) {
            console.error('❌ Error clearing cart:', error);
            throw error;
        }
    }

    getCount() {
        const count = this.totalItems || this.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
        console.log(`📊 Cart count: ${count} items`);
        return count;
    }

    getTotal() {
        const total = this.totalAmount || this.items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
        console.log(`💰 Cart total: ${total}`);
        return total;
    }

    async updateQuantity(productId, quantity) {
        if (!CartService || !CartService.isAuthenticated()) {
            throw new Error('Необходима авторизация для обновления корзины');
        }

        try {
            await CartService.updateCartItem(productId, quantity);
            await this.load();
        } catch (error) {
            console.error('❌ Error updating cart item:', error);
            throw error;
        }
    }
}

window.cart = new SimpleCart();
window.SimpleCart = SimpleCart;
console.log('✅ Cart component loaded');
