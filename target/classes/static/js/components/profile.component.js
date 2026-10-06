class ProfileComponent {
    static async init() {
        console.log('Initializing ProfileComponent');

        if (!this.isAuthenticated()) {
            this.redirectToLogin();
            return;
        }

        await this.loadProfile();

        this.setupEventListeners();

        this.checkAdminAccess();
    }

    static isAuthenticated() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        return !!token && !!user;
    }

    static redirectToLogin() {
        window.location.href = 'login.html';
    }

    static async loadProfile(forceRefresh = false) {
        try {
            this.showLoading();

            let orders = [];
            try {
                orders = await ProfileService.getOrders(forceRefresh);
            } catch (orderError) {
                console.warn('Failed to load orders, continuing with empty list:', orderError);
            }

            const profile = await ProfileService.getProfile(orders);

            this.updateProfileUI(profile);
            
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.role !== 'ROLE_ADMIN') {
                this.updateOrdersUI(orders);
                this.updateRecentOrdersUI(orders.slice(0, 3));
            }

        } catch (error) {
            console.error('Error loading profile:', error);
            this.showError('Не удалось загрузить профиль: ' + (error.message || 'Неизвестная ошибка'));
        } finally {
            this.hideLoading();
        }
    }

    static updateProfileUI(profile) {
        document.getElementById('userName').textContent = profile.username;
        document.getElementById('userEmail').textContent = profile.email;
        const loginEl = document.getElementById('userLogin');
        if (loginEl) {
            loginEl.textContent = profile.username;
        }
        const emailMeta = document.getElementById('userEmailMeta');
        if (emailMeta) {
            emailMeta.textContent = profile.email;
        }

        const roleElement = document.getElementById('userRole');
        roleElement.textContent = profile.role === 'ROLE_ADMIN' ? 'Администратор' : 'Пользователь';
        roleElement.className = 'role-badge ' + (profile.role === 'ROLE_ADMIN' ? 'admin' : 'user');
        const roleBadge = document.getElementById('userRoleBadge');
        if (roleBadge) {
            roleBadge.textContent = roleElement.textContent;
            roleBadge.className = roleElement.className;
        }

        document.getElementById('totalOrders').textContent = profile.totalOrders;
        document.getElementById('totalSpent').textContent = ProfileService.formatPrice(profile.totalSpent);
        document.getElementById('cartItems').textContent = profile.cartItems;

        document.getElementById('usernameInput').value = profile.username;
        document.getElementById('emailInput').value = profile.email;
    }

    static updateOrdersUI(orders) {
        const container = document.getElementById('ordersList');
        if (!container) return;

        if (orders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📦</div>
                    <p>У вас пока нет заказов</p>
                    <a href="index.html" class="btn btn-primary">Начать покупки</a>
                </div>
            `;
            return;
        }

        const html = orders.map(order => this.createOrderCard(order)).join('');
        container.innerHTML = html;
    }

    static updateRecentOrdersUI(orders) {
        const container = document.getElementById('recentOrdersList');
        if (!container) return;

        if (orders.length === 0) {
            container.innerHTML = '<p>Нет последних заказов</p>';
            return;
        }

        const html = orders.map(order => this.createOrderCard(order)).join('');
        container.innerHTML = html;
    }

    static createOrderCard(order) {
        const statusClass = order.status ? order.status.toLowerCase() : 'pending';
        const itemsHtml = order.items && order.items.length > 0
            ? order.items.map(item => `
                <div class="order-item-row">
                    <span class="order-item-name">${item.productName || 'Товар'}</span>
                    <span class="order-item-quantity">× ${item.quantity || 1}</span>
                    <span class="order-item-price">${ProfileService.formatPrice(item.subTotal || item.productPrice * (item.quantity || 1))}</span>
                </div>
            `).join('')
            : '<p>Товары не найдены</p>';

        return `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <span class="order-id">Заказ #${order.id || 'N/A'}</span>
                        <span class="order-date">${ProfileService.formatDate(order.createdAt)}</span>
                    </div>
                    <span class="order-status status-${statusClass}">
                        ${ProfileService.getStatusText(order.status || 'PENDING')}
                    </span>
                </div>
                <div class="order-items">
                    ${itemsHtml}
                </div>
                ${order.shippingAddress ? `
                    <div class="order-address">
                        <strong>Адрес доставки:</strong> ${order.shippingAddress}
                    </div>
                ` : ''}
                ${order.notes ? `
                    <div class="order-notes">
                        <strong>Комментарий:</strong> ${order.notes}
                    </div>
                ` : ''}
                <div class="order-total">
                    Итого: ${ProfileService.formatPrice(order.totalAmount || 0)}
                </div>
            </div>
        `;
    }

    static createAdminOrderCard(order) {
        const statusClass = order.status ? order.status.toLowerCase() : 'pending';
        const itemsHtml = order.items && order.items.length > 0
            ? order.items.map(item => `
                <div class="order-item-row">
                    <span class="order-item-name">${item.productName || 'Товар'}</span>
                    <span class="order-item-quantity">× ${item.quantity || 1}</span>
                    <span class="order-item-price">${ProfileService.formatPrice(item.subTotal || item.productPrice * (item.quantity || 1))}</span>
                </div>
            `).join('')
            : '<p>Товары не найдены</p>';

        const getStatusText = (status) => {
            const statusMap = {
                'PENDING': 'Ожидание',
                'CONFIRMED': 'Подтвержден',
                'SHIPPED': 'Отправлен',
                'DELIVERED': 'Доставлен',
                'CANCELLED': 'Отменен'
            };
            return statusMap[status] || status;
        };

        return `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <span class="order-id">Заказ #${order.id || 'N/A'}</span>
                        <span class="order-date">${ProfileService.formatDate(order.createdAt)}</span>
                        ${order.username ? `<div style="margin-top: 0.25rem; font-size: 0.9rem; color: #6b7280;">Пользователь: ${order.username}</div>` : ''}
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-end;">
                        <select class="status-select" 
                                onchange="ProfileComponent.changeOrderStatus(${order.id}, this.value)"
                                style="padding: 0.5rem 0.75rem; border-radius: 6px; border: 2px solid #e5e7eb; font-size: 0.875rem; cursor: pointer; background: white; min-width: 150px;"
                                data-order-id="${order.id}">
                            <option value="PENDING" ${order.status === 'PENDING' ? 'selected' : ''}>Ожидание</option>
                            <option value="CONFIRMED" ${order.status === 'CONFIRMED' ? 'selected' : ''}>Подтвержден</option>
                            <option value="SHIPPED" ${order.status === 'SHIPPED' ? 'selected' : ''}>Отправлен</option>
                            <option value="DELIVERED" ${order.status === 'DELIVERED' ? 'selected' : ''}>Доставлен</option>
                            <option value="CANCELLED" ${order.status === 'CANCELLED' ? 'selected' : ''}>Отменен</option>
                        </select>
                    </div>
                </div>
                <div class="order-items">
                    ${itemsHtml}
                </div>
                ${order.shippingAddress ? `
                    <div class="order-address">
                        <strong>Адрес доставки:</strong> ${order.shippingAddress}
                    </div>
                ` : ''}
                ${order.notes ? `
                    <div class="order-notes">
                        <strong>Комментарий:</strong> ${order.notes}
                    </div>
                ` : ''}
                <div class="order-total">
                    Итого: ${ProfileService.formatPrice(order.totalAmount || 0)}
                </div>
            </div>
        `;
    }

    static checkAdminAccess() {
        const user = JSON.parse(localStorage.getItem('user')) || {};
        const adminLinks = document.getElementById('adminLinks');

        if (user.role === 'ROLE_ADMIN') {
            if (adminLinks) {
                adminLinks.style.display = 'block';
            }

            const overviewLink = document.querySelector('[data-tab="overview"]');
            const ordersLink = document.querySelector('[data-tab="orders"]');
            const statsLink = document.querySelector('[data-tab="stats"]');

            if (overviewLink) {
                overviewLink.style.display = 'none';
            }
            if (ordersLink) {
                ordersLink.style.display = 'none';
            }
            if (statsLink) {
                statsLink.style.display = 'none';
            }

            const overviewTab = document.getElementById('overviewTab');
            const ordersTab = document.getElementById('ordersTab');

            if (overviewTab) {
                overviewTab.style.display = 'none';
            }
            if (ordersTab) {
                ordersTab.style.display = 'none';
            }

            const settingsLink = document.querySelector('[data-tab="settings"]');
            if (settingsLink) {
                settingsLink.classList.add('active');
                const settingsTab = document.getElementById('settingsTab');
                if (settingsTab) {
                    settingsTab.classList.add('active');
                }
            }

            if (overviewTab) {
                overviewTab.classList.remove('active');
            }
            if (ordersTab) {
                ordersTab.classList.remove('active');
            }
        }
    }

    static setupEventListeners() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(link.dataset.tab);
            });
        });

        const saveBtn = document.getElementById('saveSettingsBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveSettings());
        }

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        const orderStatusFilter = document.getElementById('orderStatusFilter');
        if (orderStatusFilter) {
            orderStatusFilter.addEventListener('change', () => this.loadAdminOrders());
        }

        const userSearch = document.getElementById('userSearch');
        if (userSearch) {
            userSearch.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const container = document.getElementById('usersList');
                if (container) {
                    const rows = container.querySelectorAll('tbody tr');
                    rows.forEach(row => {
                        const text = row.textContent.toLowerCase();
                        row.style.display = text.includes(searchTerm) ? '' : 'none';
                    });
                }
            });
        }
    }

    static switchTab(tabName) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.tab === tabName);
        });

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}Tab`);
        });

        if (tabName === 'admin') {
            this.loadAdminOrders();
        } else if (tabName === 'users') {
            this.loadAdminUsers();
        }
    }

    static async loadAdminOrders() {
        const container = document.getElementById('adminOrdersList');
        if (!container) return;

        try {
            container.innerHTML = '<p>Загрузка заказов...</p>';
            
            if (typeof AdminService === 'undefined') {
                container.innerHTML = '<p style="color: red;">AdminService не загружен. Убедитесь, что admin.service.js подключен.</p>';
                return;
            }

            const statusFilter = document.getElementById('orderStatusFilter')?.value || 'all';
            const orders = await AdminService.getOrders(statusFilter);
            
            if (orders.length === 0) {
                container.innerHTML = '<p>Нет заказов</p>';
                return;
            }

            const html = orders.map(order => this.createAdminOrderCard(order)).join('');
            container.innerHTML = html;
        } catch (error) {
            console.error('Error loading admin orders:', error);
            container.innerHTML = `<p style="color: red;">Ошибка загрузки заказов: ${error.message}</p>`;
        }
    }

    static async loadAdminUsers() {
        const container = document.getElementById('usersList');
        if (!container) return;

        try {
            container.innerHTML = '<p>Загрузка пользователей...</p>';
            
            if (typeof AdminService === 'undefined') {
                container.innerHTML = '<p style="color: red;">AdminService не загружен. Убедитесь, что admin.service.js подключен.</p>';
                return;
            }

            const users = await AdminService.getUsers(true);
            
            if (users.length === 0) {
                container.innerHTML = '<p>Нет пользователей</p>';
                return;
            }

            const html = `
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <thead>
                            <tr style="background: #f8f9fa;">
                                <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: 600;">ID</th>
                                <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: 600;">Имя</th>
                                <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: 600;">Email</th>
                                <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: 600;">Роль</th>
                                <th style="padding: 1rem; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: 600;">Статус</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users.map(user => `
                                <tr style="border-bottom: 1px solid #e5e7eb;">
                                    <td style="padding: 1rem;">${user.id}</td>
                                    <td style="padding: 1rem;"><strong>${user.username}</strong></td>
                                    <td style="padding: 1rem;">${user.email}</td>
                                    <td style="padding: 1rem;">
                                        <span style="padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.85rem; background: ${user.role === 'ROLE_ADMIN' ? '#667eea' : '#10b981'}; color: white;">
                                            ${user.role === 'ROLE_ADMIN' ? 'Админ' : 'Пользователь'}
                                        </span>
                                    </td>
                                    <td style="padding: 1rem;">
                                        <span style="padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.85rem; background: ${user.enabled ? '#d1fae5' : '#fee2e2'}; color: ${user.enabled ? '#065f46' : '#991b1b'};">
                                            ${user.enabled ? 'Активен' : 'Заблокирован'}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            container.innerHTML = html;
        } catch (error) {
            console.error('Error loading admin users:', error);
            container.innerHTML = `<p style="color: red;">Ошибка загрузки пользователей: ${error.message}</p>`;
        }
    }

    static async changeOrderStatus(orderId, newStatus) {
        try {
            if (typeof AdminService === 'undefined') {
                this.showNotification('AdminService не загружен', 'error');
                return;
            }

            const statusFilter = document.getElementById('orderStatusFilter')?.value || 'all';
            
            const result = await AdminService.updateOrderStatus(orderId, newStatus);

            if (result.success) {
                const statusText = ProfileService.getStatusText(newStatus);
                this.showNotification(`Статус заказа #${orderId} обновлен на "${statusText}"`, 'success');
                
                await this.loadAdminOrders();
            } else {
                this.showNotification(result.message || 'Ошибка обновления статуса', 'error');
                await this.loadAdminOrders();
            }
        } catch (error) {
            console.error('Error changing order status:', error);
            this.showNotification(`Ошибка обновления статуса заказа: ${error.message}`, 'error');
            await this.loadAdminOrders();
        }
    }

    static async saveSettings() {
        const username = document.getElementById('usernameInput').value.trim();
        const email = document.getElementById('emailInput').value.trim();

        if (!username || !email) {
            this.showNotification('Заполните все поля', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showNotification('Введите корректный email адрес', 'error');
            return;
        }

        if (username.length < 3 || username.length > 50) {
            this.showNotification('Имя пользователя должно быть от 3 до 50 символов', 'error');
            return;
        }

        try {
            const result = await ProfileService.updateProfile({ username, email });

            if (result.success) {
                const user = JSON.parse(localStorage.getItem('user')) || {};
                if (result.profile) {
                    user.username = result.profile.username;
                    user.email = result.profile.email;
                } else {
                    user.username = username;
                    user.email = email;
                }
                localStorage.setItem('user', JSON.stringify(user));

                document.getElementById('userName').textContent = user.username;
                document.getElementById('userEmail').textContent = user.email;
                
                document.getElementById('usernameInput').value = user.username;
                document.getElementById('emailInput').value = user.email;

                if (result.profile && typeof result.profile.totalOrders !== 'undefined') {
                    const totalOrdersEl = document.getElementById('totalOrders');
                    if (totalOrdersEl) {
                        totalOrdersEl.textContent = result.profile.totalOrders || 0;
                    }
                    const totalSpentEl = document.getElementById('totalSpent');
                    if (totalSpentEl && result.profile.totalSpent !== undefined) {
                        totalSpentEl.textContent = ProfileService.formatPrice(result.profile.totalSpent);
                    }
                }

                this.showNotification('Настройки успешно сохранены', 'success');
            } else {
                this.showNotification(result.message || 'Ошибка сохранения настроек', 'error');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showNotification('Ошибка сохранения настроек: ' + error.message, 'error');
        }
    }

    static logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }

    static showLoading() {
        document.body.classList.add('loading');
    }

    static hideLoading() {
        document.body.classList.remove('loading');
    }

    static showError(message) {
        const container = document.querySelector('.profile-content');
        if (!container) return;

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">😕</div>
                <p>${message}</p>
                <button onclick="ProfileComponent.loadProfile()" class="btn btn-primary">
                    Попробовать снова
                </button>
            </div>
        `;
    }

    static showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                ${message}
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    ProfileComponent.init();
});

window.addEventListener('focus', () => {
    if (ProfileComponent && document.getElementById('ordersList')) {
        ProfileComponent.loadProfile(true);
    }
});

window.ProfileComponent = ProfileComponent;