class Storage {
    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    }
    
    static get(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Storage get error:', error);
            return null;
        }
    }
    
    static remove(key) {
        localStorage.removeItem(key);
    }
    
    static clear() {
        localStorage.clear();
    }
    
    static getToken() {
        return localStorage.getItem('token');
    }
    
    static setToken(token) {
        localStorage.setItem('token', token);
    }
    
    static removeToken() {
        localStorage.removeItem('token');
    }
    
    static getUser() {
        return this.get('user');
    }
    
    static setUser(user) {
        this.set('user', user);
    }
    
    static removeUser() {
        this.remove('user');
    }
    
    static getCart() {
        return this.get('cart') || [];
    }
    
    static saveCart(cart) {
        this.set('cart', cart);
    }
    
    static clearCart() {
        this.remove('cart');
    }
}

window.Storage = Storage;