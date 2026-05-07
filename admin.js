// Admin Panel JavaScript
// Sistema completo de gestión de productos, categorías y ofertas

// Asegurar acceso a variables globales de Firebase
if (typeof db === 'undefined' && typeof window !== 'undefined' && window.db) {
    window.db = window.db;
    const db = window.db;
}

class AdminPanel {
    constructor() {
        this.currentUser = null;
        this.products = [];
        this.categories = [];
        this.offers = [];
        this.settings = {
            pricing: {
                defaultPriority: 'individual',
                currency: 'UYU',
                roundTo: 10
            }
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuth();
    }

    setupEventListeners() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Navigation (desktop sidebar)
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleNavigation(e.target.closest('.nav-btn').dataset.section);
            });
        });

        // Navigation (mobile bottom nav)
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.handleNavigation(e.target.closest('.nav-item').dataset.section);
            });
        });

        // Product management
        document.getElementById('add-product-btn').addEventListener('click', () => {
            this.openProductModal();
        });

        document.getElementById('category-filter').addEventListener('change', (e) => {
            this.filterProductsByCategory(e.target.value);
        });

        // Offer toggle in product form
        document.getElementById('product-has-offer').addEventListener('change', (e) => {
            this.toggleOfferFields(e.target.checked);
        });

        document.getElementById('product-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleProductSubmit();
        });

        document.getElementById('product-image-url').addEventListener('input', (e) => {
            this.handleUrlInput(e);
        });

        // File input for image upload
        document.getElementById('product-image-file').addEventListener('change', (e) => {
            this.handleFileSelect(e);
        });

        // Category management
        document.getElementById('add-category-btn').addEventListener('click', () => {
            this.openCategoryModal();
        });

        document.getElementById('category-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCategorySubmit();
        });

        // Offer management
        document.getElementById('add-offer-btn').addEventListener('click', () => {
            this.openOfferModal();
        });

        document.getElementById('offer-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleOfferSubmit();
        });

        document.getElementById('offer-target-type').addEventListener('change', (e) => {
            this.updateTargetOptions(e.target.value);
        });

        // Settings
        document.getElementById('pricing-settings-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePricingSettings();
        });

        document.getElementById('password-settings-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePasswordChange();
        });

        // Modal close buttons
        document.querySelectorAll('.close-modal, .close-modal-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAllModals();
            });
        });

        // Close modal on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAllModals();
                }
            });
        });

        // Close FAB menu when clicking outside
        document.addEventListener('click', (e) => {
            const fabContainer = document.getElementById('fab-container');
            if (fabContainer && !fabContainer.contains(e.target)) {
                this.closeFabMenu();
            }
        });

        // Close fullscreen image modal when clicking outside
        const imageFullscreenModal = document.getElementById('image-fullscreen-modal');
        if (imageFullscreenModal) {
            imageFullscreenModal.addEventListener('click', (e) => {
                if (e.target === imageFullscreenModal) {
                    this.closeImageFullscreen();
                }
            });
        }
    }

    // Authentication
    async checkAuth() {
        const session = localStorage.getItem('adminSession');
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                if (Date.now() < sessionData.expiry) {
                    this.currentUser = sessionData.user;
                    this.showDashboard();
                    await this.loadData();
                } else {
                    localStorage.removeItem('adminSession');
                    this.showLogin();
                }
            } catch (error) {
                this.showLogin();
            }
        } else {
            this.showLogin();
        }
    }

    async handleLogin() {
        const password = document.getElementById('password').value;
        const errorElement = document.getElementById('login-error');

        try {
            // En producción, esto debería validar contra Firebase Auth
            // Por ahora, usamos una validación simple
            const ADMIN_PASSWORD = 'admin123'; // Cambiar esto en producción

            if (password === ADMIN_PASSWORD) {
                const sessionData = {
                    user: { email: 'admin@lapasteleria.com' },
                    expiry: Date.now() + (3600 * 1000) // 1 hora
                };

                localStorage.setItem('adminSession', JSON.stringify(sessionData));
                this.currentUser = sessionData.user;
                this.showDashboard();
                await this.loadData();
                this.showToast('Sesión iniciada correctamente', 'success');
            } else {
                errorElement.textContent = 'Contraseña incorrecta';
            }
        } catch (error) {
            errorElement.textContent = 'Error al iniciar sesión';
            console.error('Login error:', error);
        }
    }

    handleLogout() {
        localStorage.removeItem('adminSession');
        this.currentUser = null;
        this.showLogin();
        this.showToast('Sesión cerrada', 'info');
    }

    showLogin() {
        document.getElementById('login-section').classList.remove('hidden');
        document.getElementById('admin-dashboard').classList.add('hidden');
    }

    showDashboard() {
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');

        // Set default section to home
        this.handleNavigation('home');
    }

    // Navigation
    handleNavigation(section) {
        // Update nav buttons (desktop sidebar)
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.section === section) {
                btn.classList.add('active');
            }
        });

        // Update nav items (mobile bottom nav)
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === section) {
                item.classList.add('active');
            }
        });

        // Update section title for mobile
        const sectionTitle = document.getElementById('section-title');
        if (sectionTitle) {
            const titles = {
                'home': 'Inicio',
                'products': 'Productos',
                'categories': 'Categorías',
                'offers': 'Ofertas',
                'settings': 'Ajustes'
            };
            sectionTitle.textContent = titles[section] || 'Panel';
        }

        // Update content sections
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
            if (sec.id === `${section}-section`) {
                sec.classList.add('active');
            }
        });
    }

    // Data Loading
    async loadData() {
        try {
            this.showLoadingSkeletons();
            await Promise.all([
                this.loadProducts(),
                this.loadCategories(),
                this.loadOffers(),
                this.loadSettings()
            ]);
            this.hideLoadingSkeletons();
            this.updateUI();
        } catch (error) {
            console.error('Error loading data:', error);
            this.hideLoadingSkeletons();
            this.showToast('Error al cargar los datos', 'error');
        }
    }

    showLoadingSkeletons() {
        // Show skeleton for products list
        const productsList = document.getElementById('products-list');
        if (productsList) {
            productsList.innerHTML = this.generateProductSkeletons();
        }

        // Show skeleton for offers list
        const offersList = document.getElementById('offers-list');
        if (offersList) {
            offersList.innerHTML = this.generateOfferSkeletons();
        }

        // Show skeleton for dashboard summary
        const dashboardSummary = document.querySelector('.dashboard-summary');
        if (dashboardSummary) {
            dashboardSummary.innerHTML = this.generateSummarySkeletons();
        }
    }

    hideLoadingSkeletons() {
        // Skeletons will be replaced by actual content when updateUI() is called
    }

    generateProductSkeletons() {
        let skeletons = '';
        for (let i = 0; i < 5; i++) {
            skeletons += `
                <div class="skeleton-card">
                    <div class="skeleton-card-main">
                        <div class="skeleton skeleton-image"></div>
                        <div class="skeleton-content">
                            <div class="skeleton skeleton-title"></div>
                            <div class="skeleton skeleton-text"></div>
                            <div class="skeleton skeleton-text-sm"></div>
                        </div>
                    </div>
                </div>
            `;
        }
        return skeletons;
    }

    generateOfferSkeletons() {
        let skeletons = '';
        for (let i = 0; i < 3; i++) {
            skeletons += `
                <div class="skeleton-list-item">
                    <div class="skeleton-list-header">
                        <div class="skeleton skeleton-list-title"></div>
                        <div class="skeleton skeleton-list-badge"></div>
                    </div>
                    <div class="skeleton-list-body">
                        <div class="skeleton-list-row">
                            <div class="skeleton skeleton-list-value"></div>
                            <div class="skeleton skeleton-list-value"></div>
                        </div>
                    </div>
                </div>
            `;
        }
        return skeletons;
    }

    generateSummarySkeletons() {
        return `
            <div class="skeleton-summary-card">
                <div class="skeleton skeleton-icon"></div>
                <div class="skeleton skeleton-value"></div>
                <div class="skeleton skeleton-label"></div>
            </div>
            <div class="skeleton-summary-card">
                <div class="skeleton skeleton-icon"></div>
                <div class="skeleton skeleton-value"></div>
                <div class="skeleton skeleton-label"></div>
            </div>
            <div class="skeleton-summary-card">
                <div class="skeleton skeleton-icon"></div>
                <div class="skeleton skeleton-value"></div>
                <div class="skeleton skeleton-label"></div>
            </div>
        `;
    }

    async loadProducts() {
        try {
            const snapshot = await db.collection('products').get();
            this.products = snapshot.docs.map(doc => doc.data());
            console.log(`📦 ${this.products.length} productos cargados desde Firebase`);
        } catch (error) {
            console.error('Error loading products from Firebase:', error);
            // Fallback a datos de ejemplo si hay error
            this.products = [];
        }
    }

    async loadCategories() {
        try {
            const snapshot = await db.collection('categories').get();
            this.categories = snapshot.docs.map(doc => doc.data());
            console.log(`📁 ${this.categories.length} categorías cargadas desde Firebase`);
        } catch (error) {
            console.error('Error loading categories from Firebase:', error);
            this.categories = [];
        }
    }

    async loadOffers() {
        try {
            const snapshot = await db.collection('offers').get();
            this.offers = snapshot.docs.map(doc => doc.data());
            console.log(`🏷️ ${this.offers.length} ofertas cargadas desde Firebase`);
        } catch (error) {
            console.error('Error loading offers from Firebase:', error);
            this.offers = [];
        }
    }

    async loadSettings() {
        try {
            const doc = await db.collection('settings').doc('config').get();
            if (doc.exists) {
                this.settings = doc.data();
                console.log('⚙️ Configuración cargada desde Firebase');
            } else {
                // Configuración por defecto si no existe
                this.settings = {
                    pricing: {
                        defaultPriority: 'individual',
                        currency: 'UYU',
                        roundTo: 10
                    }
                };
                console.log('⚙️ Usando configuración por defecto');
            }
        } catch (error) {
            console.error('Error loading settings from Firebase:', error);
            // Configuración por defecto en caso de error
            this.settings = {
                pricing: {
                    defaultPriority: 'individual',
                    currency: 'UYU',
                    roundTo: 10
                }
            };
        }
    }

    // UI Updates
    updateUI() {
        this.renderProducts();
        this.renderCategories();
        this.renderOffers();
        this.updateOffersSummary();
        this.populateCategorySelects();
        this.populateCategoryFilter();
        this.renderMobileProducts();
        this.renderMobileOffers();
        this.updateDashboardSummary();
    }

    renderProducts(categoryFilter = '') {
        const tbody = document.getElementById('products-table-body');
        tbody.innerHTML = '';

        const filteredProducts = categoryFilter
            ? this.products.filter(product => product.category === categoryFilter)
            : this.products;

        filteredProducts.forEach(product => {
            const offer = this.getProductOffer(product);
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>
                    <div style="font-weight: 600;">${product.name}</div>
                    <div style="font-size: 0.85rem; color: #666;">${product.description.substring(0, 50)}...</div>
                </td>
                <td>${this.getCategoryName(product.category)}</td>
                <td>$${product.basePrice}</td>
                <td>
                    ${offer ? `
                        <span class="price-display original">$${product.basePrice}</span>
                        <span class="price-display discounted">$${product.currentPrice}</span>
                    ` : `
                        <span class="price-display">$${product.currentPrice}</span>
                    `}
                </td>
                <td>
                    ${offer ? `
                        <span class="discount-badge">${offer.type === 'percentage' ? offer.value + '%' : '$' + offer.value}</span>
                    ` : '-'}
                </td>
                <td>
                    <span class="status-badge ${product.isActive ? 'status-active' : 'status-inactive'}">
                        ${product.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="adminPanel.editProduct('${product.id}')">Editar</button>
                        <button class="action-btn toggle" onclick="adminPanel.toggleProduct('${product.id}')">
                            ${product.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                        <button class="action-btn delete" onclick="adminPanel.deleteProduct('${product.id}')">Eliminar</button>
                    </div>
                </td>
            `;

            tbody.appendChild(row);
        });

        // Mostrar mensaje si no hay productos
        if (filteredProducts.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="7" style="text-align: center; padding: 20px; color: #666;">
                    ${categoryFilter ? 'No hay productos en esta categoría' : 'No hay productos registrados'}
                </td>
            `;
            tbody.appendChild(row);
        }
    }

    renderCategories() {
        const grid = document.getElementById('categories-grid');
        grid.innerHTML = '';

        this.categories.forEach(category => {
            const productCount = this.products.filter(p => p.category === category.id).length;

            const card = document.createElement('div');
            card.className = 'category-card';
            card.innerHTML = `
                <h3>${category.name}</h3>
                <p>${category.description}</p>
                <div class="category-info">
                    <span>${productCount} productos</span>
                    <span class="status-badge ${category.isActive ? 'status-active' : 'status-inactive'}">
                        ${category.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                </div>
                <div class="category-actions">
                    <button class="action-btn edit" onclick="adminPanel.editCategory('${category.id}')">Editar</button>
                    <button class="action-btn delete" onclick="adminPanel.deleteCategory('${category.id}')">Eliminar</button>
                </div>
            `;

            grid.appendChild(card);
        });
    }

    renderOffers() {
        const tbody = document.getElementById('offers-table-body');
        tbody.innerHTML = '';

        this.offers.forEach(offer => {
            const targetName = this.getTargetName(offer.targetType, offer.targetId);
            const isActive = this.isOfferActive(offer);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="font-weight: 600;">${offer.name}</td>
                <td>
                    <span class="status-badge ${offer.type === 'percentage' ? 'status-active' : 'status-pending'}">
                        ${offer.type === 'percentage' ? 'Porcentaje' : 'Precio Fijo'}
                    </span>
                </td>
                <td>
                    ${offer.type === 'percentage' ? offer.value + '%' : '$' + offer.value}
                </td>
                <td>
                    <div style="font-weight: 600;">${targetName}</div>
                    <div style="font-size: 0.85rem; color: #666;">
                        ${offer.targetType === 'product' ? 'Producto' : 'Categoría'}
                    </div>
                </td>
                <td>
                    <span class="status-badge ${isActive ? 'status-active' : 'status-inactive'}">
                        ${isActive ? 'Activa' : 'Inactiva'}
                    </span>
                </td>
                <td>
                    <div style="font-size: 0.85rem;">
                        <div>Inicio: ${new Date(offer.startDate).toLocaleDateString()}</div>
                        <div>Fin: ${new Date(offer.endDate).toLocaleDateString()}</div>
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="adminPanel.editOffer('${offer.id}')">Editar</button>
                        <button class="action-btn toggle" onclick="adminPanel.toggleOffer('${offer.id}')">
                            ${offer.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                        <button class="action-btn delete" onclick="adminPanel.deleteOffer('${offer.id}')">Eliminar</button>
                    </div>
                </td>
            `;

            tbody.appendChild(row);
        });
    }

    updateOffersSummary() {
        const activeOffers = this.offers.filter(o => this.isOfferActive(o));
        const productsOnOffer = new Set();

        activeOffers.forEach(offer => {
            if (offer.targetType === 'product') {
                productsOnOffer.add(offer.targetId);
            } else if (offer.targetType === 'category') {
                this.products
                    .filter(p => p.category === offer.targetId)
                    .forEach(p => productsOnOffer.add(p.id));
            }
        });

        const totalDiscount = activeOffers.reduce((sum, offer) => {
            if (offer.type === 'percentage') {
                return sum + offer.value;
            }
            return sum;
        }, 0);

        const avgDiscount = activeOffers.length > 0 ? totalDiscount / activeOffers.length : 0;

        document.getElementById('active-offers-count').textContent = activeOffers.length;
        document.getElementById('products-on-offer-count').textContent = productsOnOffer.size;
        document.getElementById('average-discount').textContent = avgDiscount.toFixed(1) + '%';
    }

    populateCategorySelects() {
        const selects = [
            document.getElementById('product-category'),
            document.getElementById('offer-target-id')
        ];

        selects.forEach(select => {
            if (select) {
                const currentValue = select.value;
                select.innerHTML = '<option value="">Seleccionar...</option>';

                this.categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    select.appendChild(option);
                });

                if (currentValue) {
                    select.value = currentValue;
                }
            }
        });
    }

    populateCategoryFilter() {
        const filterSelect = document.getElementById('category-filter');
        if (filterSelect) {
            const currentValue = filterSelect.value;
            filterSelect.innerHTML = '<option value="">Todas las categorías</option>';

            this.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                filterSelect.appendChild(option);
            });

            if (currentValue) {
                filterSelect.value = currentValue;
            }
        }
    }

    filterProductsByCategory(categoryId) {
        this.renderProducts(categoryId);
        this.renderMobileProducts(categoryId);
    }

    // Product Management
    openProductModal(productId = null) {
        this.closeFabMenu(); // Close FAB menu when opening modal

        const modal = document.getElementById('product-modal');
        const form = document.getElementById('product-form');
        const title = document.getElementById('product-modal-title');

        form.reset();
        document.getElementById('product-id').value = '';

        // Reset image inputs
        this.resetImageInputs();

        if (productId) {
            const product = this.products.find(p => p.id === productId);
            if (product) {
                title.textContent = 'Editar Producto';
                document.getElementById('product-id').value = product.id;
                document.getElementById('product-name').value = product.name;
                document.getElementById('product-description').value = product.description;
                document.getElementById('product-category').value = product.category;
                document.getElementById('product-base-price').value = product.basePrice;
                document.getElementById('product-status').value = product.isActive.toString();

                // Load existing image
                if (product.images && product.images.length > 0) {
                    const imageUrl = product.images[0];
                    document.getElementById('product-image-url').value = imageUrl;
                    this.showUrlPreview(imageUrl);
                }

                // Load existing offer
                this.loadProductOffer(productId);
            }
        } else {
            title.textContent = 'Nuevo Producto';
            // Reset offer fields
            this.resetOfferFields();
        }

        modal.classList.remove('hidden');
    }

    resetOfferFields() {
        document.getElementById('product-has-offer').checked = false;
        this.toggleOfferFields(false);
        document.getElementById('offer-type').value = 'percentage';
        document.getElementById('offer-value').value = '';
        document.getElementById('offer-status').value = 'true';

        // Set default dates (now and 7 days later)
        const now = new Date();
        const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        document.getElementById('offer-start-date').value = this.formatDateTimeLocal(now);
        document.getElementById('offer-end-date').value = this.formatDateTimeLocal(weekLater);
    }

    loadProductOffer(productId) {
        // Reset offer fields first
        this.resetOfferFields();

        // Find existing offer for this product
        const existingOffer = this.offers.find(offer =>
            offer.targetType === 'product' &&
            offer.targetId === productId
        );

        if (existingOffer) {
            document.getElementById('product-has-offer').checked = true;
            this.toggleOfferFields(true);
            document.getElementById('offer-type').value = existingOffer.type;
            document.getElementById('offer-value').value = existingOffer.value;
            document.getElementById('offer-status').value = existingOffer.isActive.toString();

            if (existingOffer.startDate) {
                document.getElementById('offer-start-date').value = this.formatDateTimeLocal(new Date(existingOffer.startDate));
            }
            if (existingOffer.endDate) {
                document.getElementById('offer-end-date').value = this.formatDateTimeLocal(new Date(existingOffer.endDate));
            }
        }
    }

    resetImageInputs() {
        // Reset file input
        const fileInput = document.getElementById('product-image-file');
        fileInput.value = '';
        const filePreview = document.getElementById('file-preview');
        filePreview.classList.add('hidden');
        document.getElementById('file-preview-img').src = '';
        filePreview.onclick = null; // Remove click handler

        // Reset URL input
        document.getElementById('product-image-url').value = '';
        const urlPreview = document.getElementById('url-preview');
        urlPreview.classList.add('hidden');
        document.getElementById('url-preview-img').src = '';
        urlPreview.onclick = null; // Remove click handler
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            // Clear URL input when file is selected
            document.getElementById('product-image-url').value = '';
            document.getElementById('url-preview').classList.add('hidden');

            // Show file preview
            const reader = new FileReader();
            reader.onload = (e) => {
                const filePreview = document.getElementById('file-preview');
                const filePreviewImg = document.getElementById('file-preview-img');

                filePreviewImg.src = e.target.result;
                filePreview.classList.remove('hidden');

                // Make preview clickable for fullscreen view
                filePreview.onclick = () => this.openImageFullscreen(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }

    handleUrlInput(event) {
        const url = event.target.value;
        if (url) {
            // Clear file input when URL is entered
            document.getElementById('product-image-file').value = '';
            document.getElementById('file-preview').classList.add('hidden');

            // Show URL preview
            const urlPreview = document.getElementById('url-preview');
            const urlPreviewImg = document.getElementById('url-preview-img');

            urlPreviewImg.src = url;
            urlPreview.classList.remove('hidden');

            // Make preview clickable for fullscreen view
            urlPreview.onclick = () => this.openImageFullscreen(url);
        } else {
            document.getElementById('url-preview').classList.add('hidden');
        }
    }

    removeFileImage() {
        document.getElementById('product-image-file').value = '';
        document.getElementById('file-preview').classList.add('hidden');
        document.getElementById('file-preview-img').src = '';
    }

    removeUrlImage() {
        document.getElementById('product-image-url').value = '';
        document.getElementById('url-preview').classList.add('hidden');
        document.getElementById('url-preview-img').src = '';
    }

    showUrlPreview(url) {
        if (url) {
            const urlPreview = document.getElementById('url-preview');
            const urlPreviewImg = document.getElementById('url-preview-img');

            urlPreviewImg.src = url;
            urlPreview.classList.remove('hidden');

            // Make preview clickable for fullscreen view
            urlPreview.onclick = () => this.openImageFullscreen(url);
        }
    }

    // Full-screen image preview methods
    openImageFullscreen(imageUrl) {
        const modal = document.getElementById('image-fullscreen-modal');
        const img = document.getElementById('image-fullscreen-img');

        if (modal && img && imageUrl) {
            img.src = imageUrl;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
    }

    closeImageFullscreen() {
        const modal = document.getElementById('image-fullscreen-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        }
    }

    confirmImageSelection() {
        // Just close the modal - the image is already selected
        this.closeImageFullscreen();
        this.showToast('Imagen confirmada', 'success');
    }

    toggleOfferFields(show) {
        const offerFields = document.getElementById('product-offer-fields');
        if (show) {
            offerFields.classList.remove('hidden');
        } else {
            offerFields.classList.add('hidden');
        }
    }

    async uploadImageToStorage(file) {
        try {
            // Convert image to Base64 as fallback for CORS issues
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    resolve(e.target.result);
                };
                reader.onerror = (error) => {
                    reject(error);
                };
                reader.readAsDataURL(file);
            });
        } catch (error) {
            console.error('Error in uploadImageToStorage:', error);
            throw error;
        }
    }

    async handleProductSubmit() {
        const form = document.getElementById('product-form');
        const formData = new FormData(form);

        const productId = document.getElementById('product-id').value;

        // Handle image upload
        let imageUrl = null;
        const fileInput = document.getElementById('product-image-file');
        const urlInput = document.getElementById('product-image-url');

        if (fileInput.files.length > 0) {
            // Check if running from file:// protocol
            if (window.location.protocol === 'file:') {
                this.showToast('Error: Debes ejecutar el sitio desde un servidor HTTP para subir archivos. Usa Live Server o http-server.', 'error');
                return;
            }

            // Upload file to Firebase Storage
            try {
                this.showToast('Subiendo imagen...', 'info');
                imageUrl = await this.uploadImageToStorage(fileInput.files[0]);
                this.showToast('Imagen subida correctamente', 'success');
            } catch (error) {
                console.error('Error uploading image:', error);
                this.showToast('Error al subir la imagen: ' + error.message, 'error');
                return;
            }
        } else if (urlInput.value.trim() !== '') {
            // Use URL input
            imageUrl = urlInput.value.trim();
        }

        const productData = {
            name: formData.get('name'),
            description: formData.get('description'),
            category: formData.get('category'),
            basePrice: parseFloat(formData.get('basePrice')),
            isActive: formData.get('isActive') === 'true',
            images: imageUrl ? [imageUrl] : [],
            updatedAt: new Date().toISOString()
        };

        try {
            if (productId) {
                // Update existing product in Firebase
                const index = this.products.findIndex(p => p.id === productId);
                if (index !== -1) {
                    this.products[index] = { ...this.products[index], ...productData };
                    await db.collection('products').doc(productId).update(productData);
                    this.showToast('Producto actualizado correctamente', 'success');

                    // Handle offer update for existing product
                    await this.handleProductOffer(productId, formData);
                }
            } else {
                // Create new product in Firebase
                const newProduct = {
                    id: 'prod' + Date.now(),
                    ...productData,
                    currentPrice: productData.basePrice,
                    createdAt: new Date().toISOString()
                };
                this.products.push(newProduct);
                await db.collection('products').doc(newProduct.id).set(newProduct);
                this.showToast('Producto creado correctamente', 'success');

                // Handle offer creation for new product
                await this.handleProductOffer(newProduct.id, formData);
            }

            this.closeAllModals();
            this.updateUI();
        } catch (error) {
            console.error('Error saving product:', error);
            this.showToast('Error al guardar el producto', 'error');
        }
    }

    async handleProductOffer(productId, formData) {
        const hasOffer = formData.get('hasOffer') === 'on';

        // Remove existing offer for this product
        const existingOfferIndex = this.offers.findIndex(offer =>
            offer.targetType === 'product' &&
            offer.targetId === productId
        );

        if (existingOfferIndex !== -1) {
            const existingOfferId = this.offers[existingOfferIndex].id;
            await db.collection('offers').doc(existingOfferId).delete();
            this.offers = this.offers.filter(o => o.id !== existingOfferId);

            // Recalculate prices after removing offer
            await this.recalculatePrices();
        }

        // Create new offer if checkbox is checked
        if (hasOffer) {
            const offerData = {
                id: 'offer' + Date.now(),
                name: `Oferta: ${formData.get('name')}`,
                type: formData.get('offerType'),
                value: parseFloat(formData.get('offerValue')),
                targetType: 'product',
                targetId: productId,
                startDate: new Date(formData.get('offerStartDate')).toISOString(),
                endDate: new Date(formData.get('offerEndDate')).toISOString(),
                priority: 2, // High priority for individual product offers
                isActive: formData.get('offerStatus') === 'true',
                createdAt: new Date().toISOString()
            };

            this.offers.push(offerData);
            await db.collection('offers').doc(offerData.id).set(offerData);

            // Recalculate prices
            await this.recalculatePrices();
        }
    }

    editProduct(productId) {
        this.openProductModal(productId);
    }

    async toggleProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            product.isActive = !product.isActive;
            product.updatedAt = new Date().toISOString();
            await db.collection('products').doc(productId).update({
                isActive: product.isActive,
                updatedAt: product.updatedAt
            });
            this.updateUI();
            this.showToast(`Producto ${product.isActive ? 'activado' : 'desactivado'}`, 'success');
        }
    }

    async deleteProduct(productId) {
        if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
            await db.collection('products').doc(productId).delete();
            this.products = this.products.filter(p => p.id !== productId);
            this.updateUI();
            this.showToast('Producto eliminado correctamente', 'success');
        }
    }

    // Category Management
    openCategoryModal(categoryId = null) {
        this.closeFabMenu(); // Close FAB menu when opening modal

        const modal = document.getElementById('category-modal');
        const form = document.getElementById('category-form');
        const title = document.getElementById('category-modal-title');

        form.reset();
        document.getElementById('category-id').value = '';

        if (categoryId) {
            const category = this.categories.find(c => c.id === categoryId);
            if (category) {
                title.textContent = 'Editar Categoría';
                document.getElementById('category-id').value = category.id;
                document.getElementById('category-name').value = category.name;
                document.getElementById('category-description').value = category.description;
                document.getElementById('category-order').value = category.order;
                document.getElementById('category-status').value = category.isActive.toString();
            }
        } else {
            title.textContent = 'Nueva Categoría';
        }

        modal.classList.remove('hidden');
    }

    async handleCategorySubmit() {
        const form = document.getElementById('category-form');
        const formData = new FormData(form);

        const categoryId = document.getElementById('category-id').value;

        const categoryData = {
            name: formData.get('name'),
            description: formData.get('description'),
            order: parseInt(formData.get('order')),
            isActive: formData.get('isActive') === 'true'
        };

        try {
            if (categoryId) {
                // Update existing category in Firebase
                const index = this.categories.findIndex(c => c.id === categoryId);
                if (index !== -1) {
                    this.categories[index] = { ...this.categories[index], ...categoryData };
                    await db.collection('categories').doc(categoryId).update(categoryData);
                    this.showToast('Categoría actualizada correctamente', 'success');
                }
            } else {
                // Create new category in Firebase
                const newCategory = {
                    id: formData.get('name').toLowerCase().replace(/\s+/g, '-'),
                    ...categoryData
                };
                this.categories.push(newCategory);
                await db.collection('categories').doc(newCategory.id).set(newCategory);
                this.showToast('Categoría creada correctamente', 'success');
            }

            this.closeAllModals();
            this.updateUI();
        } catch (error) {
            console.error('Error saving category:', error);
            this.showToast('Error al guardar la categoría', 'error');
        }
    }

    editCategory(categoryId) {
        this.openCategoryModal(categoryId);
    }

    async deleteCategory(categoryId) {
        const productCount = this.products.filter(p => p.category === categoryId).length;

        if (productCount > 0) {
            this.showToast(`No se puede eliminar: hay ${productCount} productos en esta categoría`, 'error');
            return;
        }

        if (confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
            await db.collection('categories').doc(categoryId).delete();
            this.categories = this.categories.filter(c => c.id !== categoryId);
            this.updateUI();
            this.showToast('Categoría eliminada correctamente', 'success');
        }
    }

    // Offer Management
    openOfferModal(offerId = null) {
        this.closeFabMenu(); // Close FAB menu when opening modal

        const modal = document.getElementById('offer-modal');
        const form = document.getElementById('offer-form');
        const title = document.getElementById('offer-modal-title');

        form.reset();
        document.getElementById('offer-id').value = '';

        // Set default dates
        const now = new Date();
        const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        document.getElementById('offer-start-date').value = this.formatDateTimeLocal(now);
        document.getElementById('offer-end-date').value = this.formatDateTimeLocal(weekLater);

        if (offerId) {
            const offer = this.offers.find(o => o.id === offerId);
            if (offer) {
                title.textContent = 'Editar Oferta';
                document.getElementById('offer-id').value = offer.id;
                document.getElementById('offer-name').value = offer.name;
                document.getElementById('offer-type').value = offer.type;
                document.getElementById('offer-value').value = offer.value;
                document.getElementById('offer-target-type').value = offer.targetType;
                document.getElementById('offer-target-id').value = offer.targetId;
                document.getElementById('offer-start-date').value = this.formatDateTimeLocal(new Date(offer.startDate));
                document.getElementById('offer-end-date').value = this.formatDateTimeLocal(new Date(offer.endDate));
                document.getElementById('offer-priority').value = offer.priority;
                document.getElementById('offer-status').value = offer.isActive.toString();

                this.updateTargetOptions(offer.targetType);
            }
        } else {
            title.textContent = 'Nueva Oferta';
            this.updateTargetOptions('product');
        }

        modal.classList.remove('hidden');
    }

    updateTargetOptions(targetType) {
        const select = document.getElementById('offer-target-id');
        select.innerHTML = '<option value="">Seleccionar...</option>';

        if (targetType === 'product') {
            this.products.forEach(product => {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = product.name;
                select.appendChild(option);
            });
        } else if (targetType === 'category') {
            this.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                select.appendChild(option);
            });
        }
    }

    async handleOfferSubmit() {
        const form = document.getElementById('offer-form');
        const formData = new FormData(form);

        const offerId = document.getElementById('offer-id').value;

        const offerData = {
            name: formData.get('name'),
            type: formData.get('type'),
            value: parseFloat(formData.get('value')),
            targetType: formData.get('targetType'),
            targetId: formData.get('targetId'),
            startDate: new Date(formData.get('startDate')).toISOString(),
            endDate: new Date(formData.get('endDate')).toISOString(),
            priority: parseInt(formData.get('priority')),
            isActive: formData.get('isActive') === 'true'
        };

        try {
            if (offerId) {
                // Update existing offer in Firebase
                const index = this.offers.findIndex(o => o.id === offerId);
                if (index !== -1) {
                    this.offers[index] = { ...this.offers[index], ...offerData };
                    await db.collection('offers').doc(offerId).update(offerData);
                    this.showToast('Oferta actualizada correctamente', 'success');
                }
            } else {
                // Create new offer in Firebase
                const newOffer = {
                    id: 'offer' + Date.now(),
                    ...offerData,
                    createdAt: new Date().toISOString()
                };
                this.offers.push(newOffer);
                await db.collection('offers').doc(newOffer.id).set(newOffer);
                this.showToast('Oferta creada correctamente', 'success');
            }

            this.closeAllModals();
            this.recalculatePrices();
            this.updateUI();
        } catch (error) {
            console.error('Error saving offer:', error);
            this.showToast('Error al guardar la oferta', 'error');
        }
    }

    editOffer(offerId) {
        this.openOfferModal(offerId);
    }

    async toggleOffer(offerId) {
        const offer = this.offers.find(o => o.id === offerId);
        if (offer) {
            offer.isActive = !offer.isActive;
            await db.collection('offers').doc(offerId).update({ isActive: offer.isActive });
            this.recalculatePrices();
            this.updateUI();
            this.showToast(`Oferta ${offer.isActive ? 'activada' : 'desactivada'}`, 'success');
        }
    }

    async deleteOffer(offerId) {
        if (confirm('¿Estás seguro de que deseas eliminar esta oferta?')) {
            await db.collection('offers').doc(offerId).delete();
            this.offers = this.offers.filter(o => o.id !== offerId);
            this.recalculatePrices();
            this.updateUI();
            this.showToast('Oferta eliminada correctamente', 'success');
        }
    }

    // Price Calculation Logic
    async recalculatePrices() {
        const batch = db.batch();
        this.products.forEach(product => {
            const pricing = this.calculateProductPrice(product);
            product.currentPrice = pricing.finalPrice;
            // Actualizar precio en Firebase
            const productRef = db.collection('products').doc(product.id);
            batch.update(productRef, { currentPrice: pricing.finalPrice });
        });
        await batch.commit();
    }

    calculateProductPrice(product) {
        let finalPrice = product.basePrice;
        let appliedOffer = null;

        // Get active offers for this product
        const productOffers = this.offers.filter(offer =>
            offer.targetType === 'product' &&
            offer.targetId === product.id &&
            offer.isActive &&
            this.isOfferValid(offer)
        );

        const categoryOffers = this.offers.filter(offer =>
            offer.targetType === 'category' &&
            offer.targetId === product.category &&
            offer.isActive &&
            this.isOfferValid(offer)
        );

        // Apply offer with highest priority
        if (productOffers.length > 0) {
            // Individual offers have priority
            appliedOffer = productOffers.sort((a, b) => b.priority - a.priority)[0];
            finalPrice = this.applyOfferToPrice(product.basePrice, appliedOffer);
        } else if (categoryOffers.length > 0) {
            // Category offers
            appliedOffer = categoryOffers.sort((a, b) => b.priority - a.priority)[0];
            finalPrice = this.applyOfferToPrice(product.basePrice, appliedOffer);
        }

        // Round price
        finalPrice = this.roundPrice(finalPrice);

        return {
            finalPrice: finalPrice,
            appliedOffer: appliedOffer,
            basePrice: product.basePrice,
            discountPercentage: appliedOffer ?
                ((product.basePrice - finalPrice) / product.basePrice * 100).toFixed(1) : 0
        };
    }

    applyOfferToPrice(basePrice, offer) {
        if (offer.type === 'percentage') {
            return basePrice * (1 - offer.value / 100);
        } else if (offer.type === 'fixed') {
            return Math.max(0, basePrice - offer.value); // Restar valor del precio base
        } else if (offer.type === 'price') {
            return offer.value; // Precio fijo
        }
        return basePrice;
    }

    isOfferValid(offer) {
        const now = new Date();
        const startDate = new Date(offer.startDate);
        const endDate = new Date(offer.endDate);
        return now >= startDate && now <= endDate;
    }

    isOfferActive(offer) {
        return offer.isActive && this.isOfferValid(offer);
    }

    roundPrice(price) {
        const roundTo = this.settings.pricing.roundTo || 10;
        return Math.round(price / roundTo) * roundTo;
    }

    getProductOffer(product) {
        const pricing = this.calculateProductPrice(product);
        return pricing.appliedOffer;
    }

    // Settings Management
    async handlePricingSettings() {
        const form = document.getElementById('pricing-settings-form');
        const formData = new FormData(form);

        this.settings.pricing = {
            defaultPriority: formData.get('defaultPriority'),
            currency: formData.get('currency'),
            roundTo: parseInt(formData.get('roundTo'))
        };

        localStorage.setItem('adminSettings', JSON.stringify(this.settings));
        this.showToast('Configuración guardada correctamente', 'success');
    }

    async handlePasswordChange() {
        const form = document.getElementById('password-settings-form');
        const formData = new FormData(form);

        const currentPassword = formData.get('currentPassword');
        const newPassword = formData.get('newPassword');
        const confirmPassword = formData.get('confirmPassword');

        if (newPassword !== confirmPassword) {
            this.showToast('Las contraseñas no coinciden', 'error');
            return;
        }

        // En producción, esto debería validarse contra Firebase Auth
        // Por ahora, solo mostramos un mensaje
        this.showToast('Funcionalidad de cambio de contraseña no implementada en demo', 'warning');
    }

    // Utility Functions
    getCategoryName(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        return category ? category.name : categoryId;
    }

    getTargetName(targetType, targetId) {
        if (targetType === 'product') {
            const product = this.products.find(p => p.id === targetId);
            return product ? product.name : targetId;
        } else if (targetType === 'category') {
            const category = this.categories.find(c => c.id === targetId);
            return category ? category.name : targetId;
        }
        return targetId;
    }

    formatDateTimeLocal(date) {
        return date.toISOString().slice(0, 16);
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
        this.closeFabMenu(); // Also close FAB menu when closing modals
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        container.appendChild(toast);

        // Auto remove with animation
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards';
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, 3000);
    }

    // Mobile UI Methods
    renderMobileProducts(categoryFilter = '') {
        const container = document.getElementById('products-list');
        if (!container) return;

        container.innerHTML = '';

        const filteredProducts = categoryFilter
            ? this.products.filter(product => product.category === categoryFilter)
            : this.products;

        if (filteredProducts.length === 0) {
            container.innerHTML = `
                <div class="empty-state-mobile">
                    <div class="empty-state-mobile-icon">📦</div>
                    <h3>No hay productos</h3>
                    <p>${categoryFilter ? 'No hay productos en esta categoría' : 'Comienza agregando tu primer producto'}</p>
                </div>
            `;
            return;
        }

        filteredProducts.forEach(product => {
            const offer = this.getProductOffer(product);
            const card = document.createElement('div');
            card.className = 'product-card';

            // Get product image
            const productImage = product.images && product.images.length > 0
                ? product.images[0]
                : 'assets/images/placeholder.webp';

            card.innerHTML = `
                <div class="product-card-main">
                    <div class="product-card-image">
                        <img src="${productImage}" alt="${product.name}" class="product-thumbnail">
                    </div>
                    <div class="product-card-info">
                        <div class="product-card-title">${product.name}</div>
                        <div class="product-card-category">${this.getCategoryName(product.category)}</div>
                        <div class="product-card-price">
                            ${offer ? `
                                <span class="original">$${product.basePrice}</span>
                                <span class="current">$${product.currentPrice}</span>
                            ` : `
                                <span class="current">$${product.currentPrice}</span>
                            `}
                        </div>
                    </div>
                    <div class="product-card-quick-actions">
                        <button class="quick-action-btn" onclick="adminPanel.toggleProductActions('${product.id}')">
                            <span class="quick-action-icon">⋮</span>
                        </button>
                    </div>
                </div>
                <div class="product-card-expanded" id="product-actions-${product.id}">
                    <div class="product-card-actions">
                        <button class="action-btn edit" onclick="adminPanel.editProduct('${product.id}')">
                            <span>✏️</span> Editar
                        </button>
                        <button class="action-btn toggle" onclick="adminPanel.toggleProduct('${product.id}')">
                            <span>${product.isActive ? '🔴' : '🟢'}</span> ${product.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                        <button class="action-btn delete" onclick="adminPanel.deleteProduct('${product.id}')">
                            <span>🗑️</span> Eliminar
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    renderMobileOffers() {
        const container = document.getElementById('offers-list');
        if (!container) return;

        container.innerHTML = '';

        if (this.offers.length === 0) {
            container.innerHTML = `
                <div class="empty-state-mobile">
                    <div class="empty-state-mobile-icon">🏷️</div>
                    <h3>No hay ofertas</h3>
                    <p>Crea tu primera oferta para comenzar</p>
                </div>
            `;
            return;
        }

        this.offers.forEach(offer => {
            const targetName = this.getTargetName(offer.targetType, offer.targetId);
            const isActive = this.isOfferActive(offer);

            const card = document.createElement('div');
            card.className = 'offer-card';
            card.innerHTML = `
                <div class="offer-card-header">
                    <div class="offer-card-title">${offer.name}</div>
                    <span class="offer-card-type">${offer.type === 'percentage' ? '%' : '$'}</span>
                </div>
                <div class="offer-card-value">
                    ${offer.type === 'percentage' ? offer.value + '%' : '$' + offer.value}
                </div>
                <div class="offer-card-target">
                    ${offer.targetType === 'product' ? 'Producto' : 'Categoría'}: ${targetName}
                </div>
                <div class="offer-card-dates">
                    ${new Date(offer.startDate).toLocaleDateString()} - ${new Date(offer.endDate).toLocaleDateString()}
                </div>
                <div class="offer-card-footer">
                    <span class="offer-card-status ${isActive ? 'active' : 'inactive'}">
                        ${isActive ? 'Activa' : 'Inactiva'}
                    </span>
                    <div class="product-card-actions">
                        <button class="action-btn edit" onclick="adminPanel.editOffer('${offer.id}')">Editar</button>
                        <button class="action-btn delete" onclick="adminPanel.deleteOffer('${offer.id}')">Eliminar</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    updateDashboardSummary() {
        // Update total counts
        const totalProducts = document.getElementById('total-products');
        const totalCategories = document.getElementById('total-categories');
        const totalOffers = document.getElementById('total-offers');

        if (totalProducts) totalProducts.textContent = this.products.length;
        if (totalCategories) totalCategories.textContent = this.categories.length;
        if (totalOffers) totalOffers.textContent = this.offers.length;
    }

    toggleProductActions(productId) {
        const actionsElement = document.getElementById(`product-actions-${productId}`);
        if (actionsElement) {
            actionsElement.classList.toggle('expanded');
        }
    }

    // FAB Menu Management
    toggleFabMenu() {
        const fabMain = document.getElementById('fab-main');
        const fabMenu = document.getElementById('fab-menu');

        if (fabMain && fabMenu) {
            fabMain.classList.toggle('active');
            fabMenu.classList.toggle('active');
        }
    }

    closeFabMenu() {
        const fabMain = document.getElementById('fab-main');
        const fabMenu = document.getElementById('fab-menu');

        if (fabMain && fabMenu) {
            fabMain.classList.remove('active');
            fabMenu.classList.remove('active');
        }
    }

    async saveData() {
        try {
            // Guardar configuración en Firebase
            await db.collection('settings').doc('config').set(this.settings);
            console.log('💾 Configuración guardada en Firebase');
        } catch (error) {
            console.error('Error saving data to Firebase:', error);
            // Fallback a localStorage si hay error
            const data = {
                products: this.products,
                categories: this.categories,
                offers: this.offers,
                settings: this.settings
            };
            localStorage.setItem('adminData', JSON.stringify(data));
            console.log('💾 Datos guardados en localStorage (fallback)');
        }
    }
}

// Initialize the admin panel
const adminPanel = new AdminPanel();

// Make it available globally for onclick handlers
window.adminPanel = adminPanel;