class CategoriesComponent {
    static async init() {
        console.log('Initializing CategoriesComponent');

        try {
            const categories = await this.loadCategories();
            this.renderCategories(categories);
        } catch (error) {
            console.error('Error loading categories:', error);
            this.showError('Не удалось загрузить категории');
        }
    }

    static async loadCategories() {
        return [
            { id: 1, name: 'Смартфоны', description: 'Мобильные телефоны и смартфоны от ведущих производителей' },
            { id: 2, name: 'Ноутбуки', description: 'Портативные компьютеры для работы и развлечений' },
            { id: 4, name: 'Аудиотехника', description: 'Наушники, колонки и другая аудиотехника' }
        ];
    }

    static renderCategories(categories) {
        const container = document.getElementById('categories-container');
        if (!container) return;

        const html = categories.map(category => `
            <div class="category-card" onclick="CategoriesComponent.viewCategory('${category.name}')">
                <div class="category-image">
                    ${this.getCategoryIcon(category.name)}
                </div>
                <div class="category-info">
                    <h3>${category.name}</h3>
                    <p>${category.description || 'Современные устройства'}</p>
                    <button class="btn btn-primary view-category-btn">
                        Смотреть товары →
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    static viewCategory(categoryName) {
        window.location.href = `products.html?category=${encodeURIComponent(categoryName)}`;
    }

    static getCategoryIcon(categoryName) {
        if (!categoryName) return '🔌';
        
        // Безопасное преобразование categoryName в строку
        const categoryStr = typeof categoryName === 'string' 
            ? categoryName 
            : (typeof categoryName === 'object' && categoryName !== null && categoryName.name 
                ? categoryName.name 
                : String(categoryName || ''));
        
        const icons = {
            'Смартфоны': '📱',
            'Ноутбуки': '💻',
            'Телевизоры': '📺',
            'Аудиотехника': '🎧',
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

    static showError(message) {
        const container = document.getElementById('categories-container');
        if (!container) return;

        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                <p style="color: #666; margin-bottom: 1rem;">${message}</p>
                <button onclick="CategoriesComponent.init()" class="btn btn-primary">
                    Попробовать снова
                </button>
            </div>
        `;
    }

    static showNotification(message, type = 'info') {
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

window.CategoriesComponent = CategoriesComponent;