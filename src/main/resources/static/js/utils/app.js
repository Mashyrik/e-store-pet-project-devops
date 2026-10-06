class App {
    static async init() {
        console.log('🎉 E-Store App Initializing...');

        this.checkAuth();

        this.hideCartForAdmin();

        await this.initComponents();

        this.setupGlobalHandlers();

        console.log('✅ E-Store App Ready!');
    }

    static checkAuth() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        this.updateAuthUI(!!token);

        this.redirectIfNeeded();
    }

    static hideCartForAdmin() {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.role === 'ROLE_ADMIN') {
                const cartLinks = document.querySelectorAll('a[href="cart.html"], a[href*="cart.html"]');
                let hiddenCount = 0;
                
                cartLinks.forEach(link => {
                    const isInNav = link.closest('.nav-links') || 
                                   link.closest('nav') || 
                                   link.closest('.navbar') || 
                                   (link.closest('header') && !link.closest('main'));
                    
                    if (isInNav) {
                        link.style.display = 'none';
                        hiddenCount++;
                    }
                });

                const cartCount = document.getElementById('cartCount');
                if (cartCount) {
                    const isInNav = cartCount.closest('.nav-links') || 
                                   cartCount.closest('nav') || 
                                   cartCount.closest('.navbar') || 
                                   (cartCount.closest('header') && !cartCount.closest('main'));
                    if (isInNav) {
                        cartCount.style.display = 'none';
                    }
                }

                if (hiddenCount > 0) {
                    console.log(`🛒 Скрыто ${hiddenCount} кнопок корзины для админа`);
                }
            } else {
                const cartLinks = document.querySelectorAll('a[href="cart.html"], a[href*="cart.html"]');
                cartLinks.forEach(link => {
                    const isInNav = link.closest('.nav-links') || 
                                   link.closest('nav') || 
                                   link.closest('.navbar') || 
                                   (link.closest('header') && !link.closest('main'));
                    if (isInNav && link.style.display === 'none') {
                        link.style.display = '';
                    }
                });
            }
        } catch (error) {
            console.error('Ошибка при скрытии корзины для админа:', error);
        }
    }

    static updateAuthUI(isAuthenticated) {
        const loginLink = document.getElementById('loginLink');
        const logoutBtn = document.getElementById('logoutBtn');
        const profileLinks = document.querySelectorAll('[href="profile.html"]');

        if (isAuthenticated) {
            if (loginLink) {
                loginLink.style.display = 'none';
            }
            if (logoutBtn) {
                logoutBtn.style.display = 'block';
            }

            profileLinks.forEach(link => {
                const user = JSON.parse(localStorage.getItem('user')) || {};
                link.textContent = user.username || 'Профиль';
            });

            this.hideCartForAdmin();
        } else {
            if (loginLink) {
                loginLink.style.display = 'block';
            }
            if (logoutBtn) {
                logoutBtn.style.display = 'none';
            }
        }
    }

    static redirectIfNeeded() {
        const currentPage = window.location.pathname;
        const isAuthenticated = !!localStorage.getItem('token');

        if (currentPage.includes('profile.html') && !isAuthenticated) {
            console.log('⚠️ Неавторизованный доступ к профилю, редирект на логин');
            window.location.href = 'login.html';
        }

        if (currentPage.includes('admin.html') && isAuthenticated) {
            const user = JSON.parse(localStorage.getItem('user')) || {};
            if (user.role !== 'ROLE_ADMIN') {
                console.log('⚠️ Недостаточно прав для админ-панели, редирект на профиль');
                window.location.href = 'profile.html';
            }
        }
    }

    static async initComponents() {
        const page = this.getCurrentPage();

        console.log(`📄 Текущая страница: ${page}`);

        switch (page) {
            case 'profile':
                if (typeof ProfileComponent !== 'undefined') {
                    console.log('👤 Инициализация ProfileComponent');
                    await ProfileComponent.init();
                } else {
                    console.warn('⚠️ ProfileComponent не найден');
                }
                break;

            case 'admin':
                if (typeof AdminComponent !== 'undefined') {
                    console.log('👑 Инициализация AdminComponent');
                    await AdminComponent.init();
                } else {
                    console.warn('⚠️ AdminComponent не найден');
                }
                break;

            case 'login':
                console.log('🔐 Страница логина');
                break;

            default:
                console.log('🏠 Главная страница или каталог');

                if (typeof ProductsComponent !== 'undefined') {
                    console.log('📦 Инициализация ProductsComponent');
                    await ProductsComponent.init();
                }

                if (typeof CategoriesComponent !== 'undefined') {
                    console.log('📁 Инициализация CategoriesComponent');
                    await CategoriesComponent.init();
                }
        }
    }
    static getCurrentPage() {
        const path = window.location.pathname;

        if (path.includes('profile.html')) return 'profile';
        if (path.includes('admin.html')) return 'admin';
        if (path.includes('login.html')) return 'login';
        return 'home';
    }

    static setupGlobalHandlers() {
        console.log('⚙️ Настройка глобальных обработчиков');

        document.addEventListener('click', (e) => {
            if (e.target.id === 'logoutBtn' || e.target.closest('#logoutBtn')) {
                e.preventDefault();
                this.logout();
            }
        });

        this.updateCartCount();

        window.addEventListener('online', () => {
            this.showNotification('✅ Соединение восстановлено', 'success');
        });

        window.addEventListener('offline', () => {
            this.showNotification('⚠️ Нет подключения к интернету', 'warning');
        });
    }

    static logout() {
        console.log('🚪 Выход из системы');

        localStorage.removeItem('token');
        localStorage.removeItem('user');

        this.showNotification('Вы вышли из системы', 'info');

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }

    static async updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (!cartCount) return;

        try {
            if (!AuthService || !AuthService.isAuthenticated()) {
                cartCount.textContent = '0';
                cartCount.style.display = 'none';
                return;
            }

            let count = 0;
            if (typeof CartService !== 'undefined') {
                count = await CartService.getCartCount();
            } else if (window.cart) {
                count = window.cart.getCount();
            }

            cartCount.textContent = count;
            cartCount.style.display = count > 0 ? 'inline-block' : 'none';

            console.log(`🛒 Товаров в корзине: ${count}`);
        } catch (error) {
            console.error('❌ Ошибка при обновлении корзины:', error);
            if (cartCount) {
                cartCount.textContent = '0';
                cartCount.style.display = 'none';
            }
        }
    }

    static showNotification(message, type = 'info') {
        console.log(`📢 Уведомление [${type}]: ${message}`);

        if (typeof ProfileComponent !== 'undefined' && ProfileComponent.showNotification) {
            ProfileComponent.showNotification(message, type);
            return;
        }

        if (typeof AdminComponent !== 'undefined' && AdminComponent.showNotification) {
            AdminComponent.showNotification(message, type);
            return;
        }

        console.warn('⚠️ Система уведомлений не найдена, использую alert');
        alert(`${type.toUpperCase()}: ${message}`);
    }

    static formatPrice(price) {
        return new Intl.NumberFormat('ru-RU').format(price) + ' BYN';
    }

    static toggleLoading(show = true) {
        const body = document.body;
        if (show) {
            body.classList.add('loading');
        } else {
            body.classList.remove('loading');
        }
    }
    static async fetchAPI(url, options = {}) {
        try {
            this.toggleLoading(true);

            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data;

        } catch (error) {
            console.error('❌ Ошибка API запроса:', error);
            this.showNotification('Ошибка подключения к серверу', 'error');
            throw error;
        } finally {
            this.toggleLoading(false);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM загружен, инициализация App...');
    App.init();
    App.hideCartForAdmin();
});

window.App = App;

console.log('📦 App module loaded');