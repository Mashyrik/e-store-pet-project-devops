class ProductDetailComponent {
    static currentProduct = null;
    static quantity = 1;

    static async init() {
        console.log('Initializing ProductDetailComponent');

        this.isAdmin = this.checkIsAdmin();

        const urlParams = new URLSearchParams(window.location.search);
        const productIdParam = urlParams.get('id');

        this.setupEventListeners();

        if (!productIdParam) {
            if (this.isAdmin) {
                await this.initNewProduct();
            } else {
                this.showError('Товар не найден');
            }
            return;
        }

        const productId = parseInt(productIdParam);
        if (isNaN(productId)) {
            console.error('Некорректный ID товара:', productIdParam);
            this.showError('Некорректный ID товара');
            return;
        }

        await this.loadProduct(productId);
    }

    static checkIsAdmin() {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            return user.role === 'ROLE_ADMIN';
        } catch (e) {
            return false;
        }
    }

    static async initNewProduct() {
        this.isEditMode = true;
        this.isNewProduct = true;
        
        await this.loadCategories();
        
        const viewMode = document.getElementById('viewMode');
        const viewDetails = document.getElementById('viewDetails');
        const viewDescription = document.getElementById('viewDescription');
        const stockStatus = document.getElementById('stockStatus');
        const quantitySelector = document.querySelector('.quantity-selector');
        
        if (viewMode) viewMode.style.display = 'none';
        if (viewDetails) viewDetails.style.display = 'none';
        if (viewDescription) viewDescription.style.display = 'none';
        if (stockStatus) stockStatus.style.display = 'none';
        if (quantitySelector) quantitySelector.style.display = 'none';
        
        const editMode = document.getElementById('editMode');
        const editDetails = document.getElementById('editDetails');
        const editDescription = document.getElementById('editDescription');
        
        if (editMode) editMode.style.display = 'block';
        if (editDetails) editDetails.style.display = 'block';
        if (editDescription) editDescription.style.display = 'block';
        
        const adminActions = document.getElementById('adminActions');
        if (adminActions) adminActions.style.display = 'block';
        const userActions = document.getElementById('userActions');
        if (userActions) userActions.style.display = 'none';
        
        const saveBtn = document.getElementById('saveProductBtn');
        const cancelBtn = document.getElementById('cancelEditBtn');
        const editBtn = document.getElementById('editProductBtn');
        const createNewBtn = document.getElementById('createNewProductBtn');
        
        if (saveBtn) saveBtn.style.display = 'block';
        if (cancelBtn) cancelBtn.style.display = 'block';
        if (editBtn) editBtn.style.display = 'none';
        if (createNewBtn) createNewBtn.style.display = 'none';
        
        document.title = 'Создание нового товара - E-Store';
        
        this.clearEditFields();
    }

    static setupEventListeners() {
        const decreaseBtn = document.getElementById('decreaseQty');
        const increaseBtn = document.getElementById('increaseQty');
        const quantityInput = document.getElementById('quantityInput');
        const addToCartBtn = document.getElementById('addToCartBtn');
        const editProductBtn = document.getElementById('editProductBtn');
        const saveProductBtn = document.getElementById('saveProductBtn');
        const cancelEditBtn = document.getElementById('cancelEditBtn');
        const createNewProductBtn = document.getElementById('createNewProductBtn');

        if (decreaseBtn) {
            decreaseBtn.addEventListener('click', () => {
                if (this.quantity > 1) {
                    this.quantity--;
                    if (quantityInput) quantityInput.value = this.quantity;
                }
            });
        }

        if (increaseBtn) {
            increaseBtn.addEventListener('click', () => {
                const maxQty = this.currentProduct ? this.currentProduct.stockQuantity : 10;
                if (this.quantity < maxQty) {
                    this.quantity++;
                    if (quantityInput) quantityInput.value = this.quantity;
                }
            });
        }

        if (quantityInput) {
            quantityInput.addEventListener('change', (e) => {
                const value = parseInt(e.target.value) || 1;
                const maxQty = this.currentProduct ? this.currentProduct.stockQuantity : 10;
                this.quantity = Math.max(1, Math.min(value, maxQty));
                e.target.value = this.quantity;
            });
        }

        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', async () => await this.addToCart());
        }

        if (editProductBtn) {
            editProductBtn.addEventListener('click', () => this.enableEditMode());
        }

        if (saveProductBtn) {
            saveProductBtn.addEventListener('click', () => this.saveProduct());
        }

        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', () => this.disableEditMode());
        }

        if (createNewProductBtn) {
            createNewProductBtn.addEventListener('click', () => {
                window.location.href = 'product.html';
            });
        }
    }

    static async loadProduct(productId) {
        try {
            console.log('Загрузка товара с ID:', productId);
            
            let product = await this.loadProductFromAPI(productId);

            if (!product) {
                console.log('Товар не найден в API, пытаемся загрузить из кэша...');
                product = await this.loadProductFromCache(productId);
            }

            if (!product) {
                console.error('Товар не найден ни в API, ни в кэше');
                this.showError('Товар не найден');
                return;
            }

            console.log('Товар успешно загружен:', product);
            this.currentProduct = product;
            this.renderProduct(product);

        } catch (error) {
            console.error('Ошибка загрузки товара:', error);
            this.showError('Ошибка загрузки товара: ' + error.message);
        }
    }

    static async loadProductFromAPI(productId) {
        try {
            const response = await fetch(`http://localhost:8080/api/products/${productId}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    console.log(`Товар с ID ${productId} не найден`);
                } else {
                    console.error(`Ошибка загрузки товара: HTTP ${response.status}`);
                }
                return null;
            }

            const product = await response.json();
            console.log('Product loaded from API:', product);
            
            return this.normalizeProductData(product);

        } catch (error) {
            console.error('Ошибка при загрузке товара из API:', error);
            return null;
        }
    }

    static normalizeProductData(product) {
        let price = product.price;
        if (typeof price === 'object' && price !== null) {
            price = parseFloat(price) || 0;
        }
        price = parseFloat(price) || 0;
        
        let category = '';
        if (product.category) {
            if (typeof product.category === 'object' && product.category.name) {
                category = product.category.name;
            } else if (typeof product.category === 'string') {
                category = product.category;
            }
        }
        
        return {
            id: product.id,
            name: product.name || '',
            price: price,
            model: product.model || '',
            category: category,
            stockQuantity: product.stockQuantity || 0,
            description: product.description || ''
        };
    }

    static async loadProductFromCache(productId) {
        try {
            if (typeof ProductsComponent !== 'undefined' && ProductsComponent.loadProducts) {
                const allProducts = await ProductsComponent.loadProducts();
                const product = allProducts.find(p => p.id === parseInt(productId));
                return product || null;
            } else {
                console.log('ProductsComponent недоступен, загружаем все товары напрямую');
                const response = await fetch('http://localhost:8080/api/products');
                if (response.ok) {
                    const products = await response.json();
                    const product = products.find(p => p.id === parseInt(productId));
                    if (product) {
                        return this.normalizeProductData(product);
                    }
                }
                return null;
            }
        } catch (error) {
            console.error('Ошибка при загрузке товара из кэша:', error);
            return null;
        }
    }

    static renderProduct(product) {
        document.title = `${product.name} - E-Store`;

        const nameEl = document.getElementById('productName');
        if (nameEl) nameEl.textContent = product.name;

        const priceEl = document.getElementById('productPrice');
        if (priceEl) priceEl.textContent = this.formatPrice(product.price) + ' BYN';

        const categoryEl = document.getElementById('productCategory');
        if (categoryEl) categoryEl.textContent = product.category || 'Без категории';

        const categoryDetailEl = document.getElementById('productCategoryDetail');
        if (categoryDetailEl) categoryDetailEl.textContent = product.category || '—';

        const modelEl = document.getElementById('productModel');
        if (modelEl) modelEl.textContent = product.model || '—';

        const stockEl = document.getElementById('productStock');
        if (stockEl) {
            if (product.stockQuantity > 0) {
                stockEl.textContent = `В наличии: ${product.stockQuantity} шт.`;
            } else {
                stockEl.textContent = 'Нет в наличии';
            }
        }

        const descriptionEl = document.getElementById('productDescription');
        if (descriptionEl) {
            descriptionEl.textContent = product.description || 'Описание товара отсутствует.';
        }

        const iconEl = document.getElementById('productIcon');
        if (iconEl) {
            iconEl.textContent = this.getProductIcon(product.category);
        }

        const stockStatusEl = document.getElementById('stockStatus');
        if (stockStatusEl) {
            if (product.stockQuantity > 0) {
                stockStatusEl.className = 'stock-status in-stock';
                stockStatusEl.textContent = `✓ В наличии: ${product.stockQuantity} шт.`;
            } else {
                stockStatusEl.className = 'stock-status out-of-stock';
                stockStatusEl.textContent = '✗ Нет в наличии';
            }
        }

            const addToCartBtn = document.getElementById('addToCartBtn');
            if (addToCartBtn) {
                if (product.stockQuantity === 0) {
                    addToCartBtn.disabled = true;
                    addToCartBtn.textContent = 'Нет в наличии';
                } else {
                    addToCartBtn.disabled = false;
                    addToCartBtn.textContent = 'В корзину';
                }
            }

            const quantityInput = document.getElementById('quantityInput');
            if (quantityInput && product.stockQuantity > 0) {
                quantityInput.max = product.stockQuantity;
            }

            if (this.isAdmin) {
                const adminActions = document.getElementById('adminActions');
                const userActions = document.getElementById('userActions');
                if (adminActions) adminActions.style.display = 'block';
                if (userActions) userActions.style.display = 'none';
                
                const createNewBtn = document.getElementById('createNewProductBtn');
                if (createNewBtn) {
                    createNewBtn.style.display = 'none';
                }
            }
        }

    static async addToCart() {
        if (!this.currentProduct) {
            this.showNotification('Товар не загружен', 'error');
            return;
        }

        if (this.currentProduct.stockQuantity === 0) {
            this.showNotification('Товар отсутствует на складе', 'error');
            return;
        }

        if (!window.cart) {
            window.cart = new SimpleCart();
        }

        const cartProduct = {
            id: this.currentProduct.id,
            name: this.currentProduct.name,
            price: this.currentProduct.price,
            model: this.currentProduct.model,
            category: this.currentProduct.category,
            quantity: this.quantity
        };

        try {
            await window.cart.add(cartProduct);

            if (typeof App !== 'undefined' && App.updateCartCount) {
                await App.updateCartCount();
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
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
        if (!price) return '0';
        const numPrice = typeof price === 'object' ? parseFloat(price) : parseFloat(price);
        return new Intl.NumberFormat('ru-RU').format(numPrice);
    }

    static showError(message) {
        const container = document.getElementById('productContainer');
        if (!container) return;

        container.innerHTML = `
            <div style="text-align: center; padding: 4rem 2rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">😕</div>
                <h2 style="color: #111827; margin-bottom: 1rem;">${message}</h2>
                <p style="color: #6b7280; margin-bottom: 2rem;">Попробуйте вернуться в каталог и выбрать другой товар</p>
                <a href="products.html" class="btn btn-primary">Вернуться в каталог</a>
            </div>
        `;
    }

    static showNotification(message, type = 'info') {
        if (typeof App !== 'undefined' && App.showNotification) {
            App.showNotification(message, type);
        } else {
            alert(message);
        }
    }

    static async enableEditMode() {
        if (!this.isAdmin) return;

        this.isEditMode = true;
        
        await this.loadCategories();

        if (this.currentProduct && !this.isNewProduct) {
            this.fillEditFields(this.currentProduct);
        }

        const viewMode = document.getElementById('viewMode');
        const viewDetails = document.getElementById('viewDetails');
        const viewDescription = document.getElementById('viewDescription');
        const editMode = document.getElementById('editMode');
        const editDetails = document.getElementById('editDetails');
        const editDescription = document.getElementById('editDescription');
        const editBtn = document.getElementById('editProductBtn');
        const saveBtn = document.getElementById('saveProductBtn');
        const cancelBtn = document.getElementById('cancelEditBtn');
        const stockStatus = document.getElementById('stockStatus');
        const quantitySelector = document.querySelector('.quantity-selector');

        if (viewMode) viewMode.style.display = 'none';
        if (viewDetails) viewDetails.style.display = 'none';
        if (viewDescription) viewDescription.style.display = 'none';
        if (editMode) editMode.style.display = 'block';
        if (editDetails) editDetails.style.display = 'block';
        if (editDescription) editDescription.style.display = 'block';
        if (editBtn) editBtn.style.display = 'none';
        if (saveBtn) saveBtn.style.display = 'block';
        if (cancelBtn) cancelBtn.style.display = 'block';
        
        const createNewBtn = document.getElementById('createNewProductBtn');
        if (createNewBtn && !this.isNewProduct) {
            createNewBtn.style.display = 'none';
        }
        
        if (stockStatus) stockStatus.style.display = 'none';
        if (quantitySelector) quantitySelector.style.display = 'none';
    }

    static disableEditMode() {
        if (this.isNewProduct) {
            window.location.href = 'products.html';
            return;
        }

        this.isEditMode = false;
        this.isNewProduct = false;

        const viewMode = document.getElementById('viewMode');
        const viewDetails = document.getElementById('viewDetails');
        const viewDescription = document.getElementById('viewDescription');
        const editMode = document.getElementById('editMode');
        const editDetails = document.getElementById('editDetails');
        const editDescription = document.getElementById('editDescription');
        const editBtn = document.getElementById('editProductBtn');
        const saveBtn = document.getElementById('saveProductBtn');
        const cancelBtn = document.getElementById('cancelEditBtn');
        const stockStatus = document.getElementById('stockStatus');
        const quantitySelector = document.querySelector('.quantity-selector');
        const createNewBtn = document.getElementById('createNewProductBtn');

        if (viewMode) viewMode.style.display = 'block';
        if (viewDetails) viewDetails.style.display = 'block';
        if (viewDescription) viewDescription.style.display = 'block';
        if (editMode) editMode.style.display = 'none';
        if (editDetails) editDetails.style.display = 'none';
        if (editDescription) editDescription.style.display = 'none';
        if (editBtn) editBtn.style.display = 'block';
        if (saveBtn) saveBtn.style.display = 'none';
        if (cancelBtn) cancelBtn.style.display = 'none';
        if (createNewBtn) createNewBtn.style.display = 'block';
        
        if (stockStatus) stockStatus.style.display = 'block';
        if (quantitySelector) quantitySelector.style.display = 'flex';

        if (this.currentProduct && !this.isNewProduct) {
            this.renderProduct(this.currentProduct);
        }
    }

    static fillEditFields(product) {
        const nameInput = document.getElementById('editProductName');
        const priceInput = document.getElementById('editProductPrice');
        const modelInput = document.getElementById('editProductModel');
        const stockInput = document.getElementById('editProductStock');
        const descriptionTextarea = document.getElementById('editProductDescription');
        const categorySelect = document.getElementById('editProductCategoryDetail');

        if (nameInput) nameInput.value = product.name || '';
        if (priceInput) priceInput.value = product.price || 0;
        if (modelInput) modelInput.value = product.model || '';
        if (stockInput) stockInput.value = product.stockQuantity || 0;
        if (descriptionTextarea) descriptionTextarea.value = product.description || '';
        
        let categoryId = null;
        if (product.category) {
            if (typeof product.category === 'object' && product.category.id) {
                categoryId = product.category.id;
            } else if (typeof product.category === 'string') {
                categoryId = this.getCategoryIdByName(product.category);
            } else {
                categoryId = product.category;
            }
        }
        
        if (categorySelect && categoryId) {
            categorySelect.value = categoryId;
        }
    }

    static clearEditFields() {
        const nameInput = document.getElementById('editProductName');
        const priceInput = document.getElementById('editProductPrice');
        const modelInput = document.getElementById('editProductModel');
        const stockInput = document.getElementById('editProductStock');
        const descriptionTextarea = document.getElementById('editProductDescription');

        if (nameInput) nameInput.value = '';
        if (priceInput) priceInput.value = '';
        if (modelInput) modelInput.value = '';
        if (stockInput) stockInput.value = 0;
        if (descriptionTextarea) descriptionTextarea.value = '';
    }

    static categoriesCache = null;

    static async loadCategories() {
        try {
            const response = await fetch('http://localhost:8080/api/categories');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const categories = await response.json();
            this.categoriesCache = categories;

            const categorySelect = document.getElementById('editProductCategoryDetail');
            
            const fillSelect = (select) => {
                if (!select) return;
                while (select.options.length > 1) {
                    select.remove(1);
                }
                categories.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat.id;
                    option.textContent = cat.name;
                    option.dataset.categoryId = cat.id;
                    select.appendChild(option);
                });
            };

            fillSelect(categorySelect);

        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    static async saveProduct() {
        if (!this.isAdmin) return;

        const nameInput = document.getElementById('editProductName');
        const priceInput = document.getElementById('editProductPrice');
        const modelInput = document.getElementById('editProductModel');
        const stockInput = document.getElementById('editProductStock');
        const descriptionTextarea = document.getElementById('editProductDescription');
        const categorySelect = document.getElementById('editProductCategoryDetail');

        const categoryId = categorySelect ? parseInt(categorySelect.value) : null;
        
        const productData = {
            name: nameInput?.value || '',
            price: parseFloat(priceInput?.value) || 0,
            model: modelInput?.value || '',
            stockQuantity: parseInt(stockInput?.value) || 0,
            description: descriptionTextarea?.value || '',
            categoryId: categoryId
        };

        if (!productData.name || !productData.model) {
            this.showNotification('Заполните название и модель товара', 'error');
            return;
        }
        
        if (!productData.categoryId || productData.categoryId <= 0) {
            this.showNotification('Выберите категорию товара', 'error');
            return;
        }
        
        if (productData.price <= 0) {
            this.showNotification('Цена должна быть больше 0', 'error');
            return;
        }
        
        if (productData.stockQuantity < 0) {
            this.showNotification('Количество на складе не может быть отрицательным', 'error');
            return;
        }

        try {
            this.showNotification('Сохранение товара...', 'info');

            let result;
            if (this.isNewProduct) {
                result = await this.createProduct(productData);
            } else {
                result = await this.updateProduct(productData);
            }

            if (result.success) {
                this.showNotification(result.message, 'success');
                
                if (typeof ProductsComponent !== 'undefined' && ProductsComponent.productsCache) {
                    ProductsComponent.productsCache = [];
                }
                
                sessionStorage.setItem('refreshProducts', 'true');
                
                if (this.isNewProduct && result.product && result.product.id) {
                    setTimeout(() => {
                        window.location.href = `product.html?id=${result.product.id}`;
                    }, 1000);
                } else {
                    if (result.product) {
                        this.currentProduct = result.product;
                    }
                    this.isNewProduct = false;
                    this.disableEditMode();
                    
                    sessionStorage.setItem('refreshProducts', 'true');
                }
            } else {
                this.showNotification(result.message || 'Ошибка сохранения товара', 'error');
            }
        } catch (error) {
            console.error('Error saving product:', error);
            this.showNotification('Ошибка сохранения товара: ' + error.message, 'error');
        }
    }

    static async createProduct(productData) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Необходима авторизация');
            }

            try {
                const response = await fetch('http://localhost:8080/api/products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: productData.name,
                        description: productData.description || '',
                        price: productData.price,
                        model: productData.model,
                        stockQuantity: productData.stockQuantity,
                        categoryId: productData.categoryId
                    })
                });

                if (response.ok) {
                    const product = await response.json();
                    return {
                        success: true,
                        message: 'Товар успешно создан',
                        product: product
                    };
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Ошибка ${response.status}`);
                }
            } catch (apiError) {
                console.error('API недоступен:', apiError);
                throw apiError;
            }
        } catch (error) {
            console.error('Failed to create product:', error);
            return {
                success: false,
                message: error.message || 'Ошибка создания товара'
            };
        }
    }

    static async updateProduct(productData) {
        try {
            if (!this.currentProduct || !this.currentProduct.id) {
                throw new Error('Товар не найден');
            }

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Необходима авторизация');
            }

            try {
                const requestData = {
                    name: productData.name,
                    description: productData.description || '',
                    price: productData.price,
                    model: productData.model,
                    stockQuantity: productData.stockQuantity,
                    categoryId: productData.categoryId
                };

                const response = await fetch(`http://localhost:8080/api/products/${this.currentProduct.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(requestData)
                });

                if (response.ok) {
                    const product = await response.json();
                    this.currentProduct = { ...this.currentProduct, ...product };
                    return {
                        success: true,
                        message: 'Товар успешно обновлен',
                        product: product
                    };
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Ошибка ${response.status}`);
                }
            } catch (apiError) {
                console.error('API недоступен:', apiError);
                throw apiError;
            }
        } catch (error) {
            console.error('Failed to update product:', error);
            return {
                success: false,
                message: error.message || 'Ошибка обновления товара'
            };
        }
    }


    static getCategoryIdByName(categoryName) {
        if (this.categoriesCache) {
            // Безопасное преобразование categoryName в строку
            const categoryStr = typeof categoryName === 'string' 
                ? categoryName 
                : (typeof categoryName === 'object' && categoryName !== null && categoryName.name 
                    ? categoryName.name 
                    : String(categoryName || ''));
            
            const category = this.categoriesCache.find(cat => 
                cat.name === categoryStr || cat.name.toLowerCase() === categoryStr.toLowerCase()
            );
            if (category) {
                return category.id;
            }
        }
        
        const categoryMap = {
            'Смартфоны': 1,
            'Ноутбуки': 2,
            'Телевизоры': 3,
            'Аудиотехника': 4,
            'Гаджеты': 5
        };
        return categoryMap[categoryName] || 1;
    }
}

window.ProductDetailComponent = ProductDetailComponent;

