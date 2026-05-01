// Scroll Animation Observer
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all animated elements
document.addEventListener('DOMContentLoaded', () => {
    // Observe section titles
    document.querySelectorAll('.section-title').forEach(el => {
        observer.observe(el);
    });

    // Observe service cards with stagger
    document.querySelectorAll('.service-card').forEach((el, index) => {
        el.style.transitionDelay = `${index * 0.2}s`;
        observer.observe(el);
    });

    // Observe price cards with stagger
    document.querySelectorAll('.price-card').forEach((el, index) => {
        el.style.transitionDelay = `${index * 0.2}s`;
        observer.observe(el);
    });

    // Observe testimonial cards with stagger
    document.querySelectorAll('.testimonial-card').forEach((el, index) => {
        el.style.transitionDelay = `${index * 0.2}s`;
        observer.observe(el);
    });

    // Observe contact sections
    document.querySelectorAll('.contact-info, .contact-image').forEach(el => {
        observer.observe(el);
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Parallax effect on scroll
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    const heroImage = document.querySelector('.hero-image');

    if (hero && heroContent && heroImage) {
        heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
        heroImage.style.transform = `translateY(${scrolled * 0.2}px)`;
    }
});

// Add hover effect to cards
document.querySelectorAll('.service-card, .price-card, .testimonial-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });

    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Dynamic background animation
const createFloatingElement = () => {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const element = document.createElement('div');
    element.className = 'floating-element';
    element.innerHTML = ['🎂', '🍰', '🧁', '🎉', '✨'][Math.floor(Math.random() * 5)];
    element.style.cssText = `
        position: absolute;
        font-size: ${20 + Math.random() * 30}px;
        left: ${Math.random() * 100}%;
        top: 100%;
        opacity: 0.6;
        pointer-events: none;
        animation: floatUp ${5 + Math.random() * 5}s linear forwards;
    `;

    hero.appendChild(element);

    setTimeout(() => {
        element.remove();
    }, 10000);
};

// Create floating elements periodically
setInterval(createFloatingElement, 2000);

// Add CSS for floating animation
const style = document.createElement('style');
style.textContent = `
    @keyframes floatUp {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.6;
        }
        100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Counter animation for single prices
const animateCounter = (element, target, duration = 2000) => {
    let start = 0;
    const increment = target / (duration / 16);

    const updateCounter = () => {
        start += increment;
        if (start < target) {
            element.textContent = `$${Math.floor(start)}`;
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = `$${target}`;
        }
    };

    updateCounter();
};

// Counter animation for price ranges
const animateRangeCounter = (element, minPrice, maxPrice, duration = 2000) => {
    let startMin = 0;
    let startMax = 0;
    const incrementMin = minPrice / (duration / 16);
    const incrementMax = maxPrice / (duration / 16);

    const updateCounter = () => {
        startMin += incrementMin;
        startMax += incrementMax;

        if (startMin < minPrice || startMax < maxPrice) {
            const currentMin = Math.min(Math.floor(startMin), minPrice);
            const currentMax = Math.min(Math.floor(startMax), maxPrice);
            element.textContent = `$${currentMin}-$${currentMax}`;
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = `$${minPrice}-$${maxPrice}`;
        }
    };

    updateCounter();
};

// Observe price elements for counter animation
const priceObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const priceElement = entry.target.querySelector('.price');
            if (priceElement) {
                // Only animate if not already animated
                if (!priceElement.dataset.animated) {
                    priceElement.dataset.animated = 'true';

                    // Check if price is a range (contains dash)
                    if (priceElement.textContent.includes('-')) {
                        // Extract min and max prices from range
                        const prices = priceElement.textContent.match(/\$?(\d+)-\$?(\d+)/);
                        if (prices) {
                            const minPrice = parseInt(prices[1]);
                            const maxPrice = parseInt(prices[2]);
                            priceElement.textContent = '$0-$0';
                            animateRangeCounter(priceElement, minPrice, maxPrice);
                        }
                    } else {
                        // Single price animation
                        const priceText = priceElement.textContent.replace(/[^0-9]/g, '');
                        const priceValue = parseInt(priceText);
                        priceElement.textContent = '$0';
                        animateCounter(priceElement, priceValue);
                    }
                }
            }
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.price-card').forEach(card => {
    priceObserver.observe(card);
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';

    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Mobile menu toggle (if needed in future)
const addMobileMenu = () => {
    // Placeholder for future mobile menu functionality
    console.log('Mobile menu ready for implementation');
};

// Mobile-specific optimizations
const isMobile = () => {
    return window.innerWidth <= 768;
};

// Adjust animations for mobile
const adjustForMobile = () => {
    if (isMobile()) {
        // Reduce floating elements on mobile for better performance
        const floatingElements = document.querySelectorAll('.floating-element');
        if (floatingElements.length > 3) {
            floatingElements.forEach((el, index) => {
                if (index > 2) el.remove();
            });
        }

        // Disable parallax on mobile for better performance
        window.removeEventListener('scroll', debouncedParallax);
    }
};

// Run mobile optimizations on load and resize
window.addEventListener('load', adjustForMobile);
window.addEventListener('resize', () => {
    // Reload page if switching between mobile and desktop for optimal experience
    const wasMobile = document.body.dataset.mobile === 'true';
    const isNowMobile = isMobile();

    if (wasMobile !== isNowMobile) {
        document.body.dataset.mobile = isNowMobile;
        adjustForMobile();
    }
});

// Set initial mobile state
document.body.dataset.mobile = isMobile();

// Performance optimization: Debounce scroll events
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Debounced parallax effect
const debouncedParallax = debounce(() => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    const heroImage = document.querySelector('.hero-image');

    if (hero && heroContent && heroImage) {
        heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
        heroImage.style.transform = `translateY(${scrolled * 0.2}px)`;
    }
}, 10);

window.removeEventListener('scroll', () => {});
window.addEventListener('scroll', debouncedParallax);

console.log('La Pastelería website loaded successfully! 🎂');

// ==================== SISTEMA DE CARRITO ====================

// Objeto global del carrito
let cart = {
    items: [],
    total: 0
};

// Función para añadir al carrito
function addToCart(button, productName, price) {
    if (button.classList.contains('added')) return;

    button.classList.add('added');
    button.textContent = '✓ Añadido';

    // Buscar si el producto ya existe en el carrito
    const existingItem = cart.items.find(item => item.name === productName);

    if (existingItem) {
        // Si existe, incrementar cantidad
        existingItem.quantity += 1;
    } else {
        // Si no existe, agregar nuevo item
        cart.items.push({
            name: productName,
            price: price,
            quantity: 1
        });
    }

    // Actualizar total
    updateCartTotal();

    // Actualizar contador del carrito
    updateCartCount();

    // Mostrar notificación
    showNotification(`${productName} añadido al carrito - $${price}`);

    // Resetear botón después de 2 segundos
    setTimeout(() => {
        button.classList.remove('added');
        button.textContent = 'Añadir al Carrito';
    }, 2000);
}

// Función para añadir al carrito con precio en rango
function addToCartWithRange(button, productName, priceRange) {
    if (button.classList.contains('added')) return;

    button.classList.add('added');
    button.textContent = '✓ Añadido';

    // Buscar si el producto ya existe en el carrito
    const existingItem = cart.items.find(item => item.name === productName);

    if (existingItem) {
        // Si existe, incrementar cantidad
        existingItem.quantity += 1;
    } else {
        // Si no existe, agregar nuevo item con el rango de precio
        cart.items.push({
            name: productName,
            price: priceRange,
            quantity: 1,
            isRange: true
        });
    }

    // Actualizar total (para rangos, usamos el valor mínimo del rango)
    updateCartTotal();

    // Actualizar contador del carrito
    updateCartCount();

    // Mostrar notificación
    showNotification(`${productName} añadido al carrito - $${priceRange}`);

    // Resetear botón después de 2 segundos
    setTimeout(() => {
        button.classList.remove('added');
        button.textContent = 'Añadir al Carrito';
    }, 2000);
}

// Función para actualizar el total del carrito
function updateCartTotal() {
    cart.total = cart.items.reduce((sum, item) => {
        if (item.isRange) {
            // Para rangos, extraer el valor mínimo del rango (ej: "500-800" -> 500)
            const minPrice = parseInt(item.price.toString().split('-')[0]);
            return sum + (minPrice * item.quantity);
        } else {
            return sum + (item.price * item.quantity);
        }
    }, 0);
    const cartTotalElement = document.getElementById('cart-total');
    if (cartTotalElement) {
        cartTotalElement.textContent = `$${cart.total}`;
    }
}

// Función para actualizar el contador del carrito
function updateCartCount() {
    const totalCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalCount;
    }
}

// Función para abrir el carrito
function openCart() {
    const cartModal = document.getElementById('cart-modal');
    cartModal.classList.remove('hidden');
    renderCartItems();
}

// Función para cerrar el carrito
function closeCart() {
    const cartModal = document.getElementById('cart-modal');
    cartModal.classList.add('hidden');
}

// Función para renderizar los items del carrito
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');

    if (cart.items.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <span class="empty-cart-icon">🛒</span>
                <p>Tu carrito está vacío</p>
                <small>Agrega productos para comenzar</small>
            </div>
        `;
        return;
    }

    cartItemsContainer.innerHTML = '';

    cart.items.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';

        // Calcular el subtotal para este item
        let itemSubtotal;
        if (item.isRange) {
            const minPrice = parseInt(item.price.toString().split('-')[0]);
            itemSubtotal = minPrice * item.quantity;
        } else {
            itemSubtotal = item.price * item.quantity;
        }

        cartItem.innerHTML = `
            <div class="cart-item-info">
                <h4 class="cart-item-name">${item.name}</h4>
                <p class="cart-item-price">$${item.price} c/u</p>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-controls">
                    <button class="quantity-button" onclick="updateQuantity(${index}, -1)">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-button" onclick="updateQuantity(${index}, 1)">+</button>
                </div>
                <div class="cart-item-total">
                    <span>$${itemSubtotal}</span>
                </div>
                <button class="remove-item-button" onclick="removeFromCart(${index})">
                    🗑️
                </button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
    });
}

// Función para actualizar la cantidad de un producto
function updateQuantity(index, change) {
    const item = cart.items[index];

    if (change === -1 && item.quantity === 1) {
        // Si la cantidad es 1 y se quiere restar, preguntar si eliminar
        if (confirm('¿Deseas eliminar este producto del carrito?')) {
            removeFromCart(index);
        }
        return;
    }

    item.quantity += change;

    // Actualizar total y contador
    updateCartTotal();
    updateCartCount();

    // Re-renderizar el carrito
    renderCartItems();
}

// Función para eliminar un producto del carrito
function removeFromCart(index) {
    const item = cart.items[index];
    cart.items.splice(index, 1);

    // Actualizar total y contador
    updateCartTotal();
    updateCartCount();

    // Re-renderizar el carrito
    renderCartItems();

    // Mostrar notificación
    showNotification(`${item.name} eliminado del carrito`);
}

// Función para realizar el pedido (checkout)
function checkout() {
    // 1. Validar que el carrito no esté vacío
    if (cart.items.length === 0) {
        showNotification('❌ Tu carrito está vacío');
        return;
    }

    const total = cart.total;
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    // 2. Generar mensaje formateado para WhatsApp
    let orderMessage = `Hola La Pastelería, me gustaría realizar el siguiente pedido:\n\n`;
    orderMessage += `📦 *${itemCount} productos*\n\n`;
    orderMessage += `*Detalle del pedido:*\n`;

    cart.items.forEach((item, index) => {
        orderMessage += `${index + 1}. ${item.name}\n`;
        orderMessage += `   Cantidad: ${item.quantity}\n`;
        orderMessage += `   Precio unitario: $${item.price}\n`;
        orderMessage += `   Subtotal: $${item.price * item.quantity}\n\n`;
    });

    orderMessage += `💰 *Total: $${total}*\n\n`;
    orderMessage += `📞 Espero su confirmación para coordinar el pago y entrega.`;

    // 3. Crear enlace de WhatsApp API con el número +598 92 062 729
    const phoneNumber = '59892062729'; // Sin espacios ni guiones

    // 4. Aplicar encodeURIComponent al mensaje
    const encodedMessage = encodeURIComponent(orderMessage);

    // 5. Crear el enlace completo de WhatsApp
    const whatsappLink = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;

    // Mostrar confirmación antes de redirigir
    if (confirm(`¿Confirmar pedido por $${total}?\n\nSerás redirigido a WhatsApp para enviar tu pedido.`)) {
        // Redirigir a WhatsApp
        window.open(whatsappLink, '_blank');

        // Cerrar el carrito
        closeCart();

        // Limpiar el carrito después de enviar el pedido
        cart.items = [];
        cart.total = 0;
        updateCartTotal();
        updateCartCount();

        // Mostrar notificación de éxito
        showNotification('✅ Pedido enviado a WhatsApp');
    }
}

// Catálogo dinámico
const catalogData = {
    cumpleanos: {
        title: 'Tortas de Cumpleaños',
        type: 'slideshow',
        products: [
            {
                id: 1,
                name: 'Torta Personalizada de 1kg',
                description: 'Torta personalizada ideal para 12-15 personas. Diseño único con el tema que elijas.',
                price: '790',
                priceRange: true,
                images: [
                    'assets/images/personalizada2.jpg',
                    'assets/images/personalizada1.jpg',
                    'assets/images/personalizada3.jpg',
                    'assets/images/personalizada4.jpg',
                    'assets/images/personalizada5.jpg',
                    'assets/images/flores1.jpg',
                    'assets/images/flores2.jpg',
                    'assets/images/flores3.jpg',
                    'assets/images/flores4.jpg',
                    'assets/images/flores5.jpg',
                    'assets/images/mariposas1.jpg',
                    'assets/images/mariposas2.jpg',
                    'assets/images/mariposas3.jpg',
                    'assets/images/mariposas4.jpg',
                    'assets/images/mariposas5.jpg'
                ]
            }
        ]
    },
    postres: {
        title: 'Postres Enteros',
        products: [
            {
                id: 1,
                name: 'Cheesecake',
                description: 'Cremoso cheesecake con base de galleta.',
                price: 1800,
                image: 'assets/images/postres/cheesecake.jpg'
            },
            {
                id: 2,
                name: 'Chajá',
                description: 'Clásico chajá uruguayo con merengue, crema y durazno. Dulce de leche opcional.',
                price: 1500,
                image: 'assets/images/postres/chaja.jpg'
            },
            {
                id: 3,
                name: 'Rogel',
                description: 'Delicioso rogel con capas de masa hojaldrada y dulce de leche.',
                price: 1700,
                image: 'assets/images/postres/rogel.jpg'
            },
            {
                id: 4,
                name: 'Red velvet',
                description: 'Suave red velvet con frosting de queso crema.',
                price: 2000,
                image: 'assets/images/postres/redvelvetentero.jpg'
            },
            {
                id: 5,
                name: 'Matilda',
                description: 'Torta matilda de chocolate rellena de ganache de chocolate.',
                price: 1600,
                image: 'assets/images/postres/matildaentero.jpg'
            },
            {
                id: 6,
                name: 'Selva negra',
                description: 'Selva negra con chocolate, cerezas y crema batida.',
                price: 2000,
                image: 'assets/images/postres/selvanegra.jpg'
            },
            {
                id: 7,
                name: 'Bombón de maní',
                description: 'Torta de chocolate rellena de crema de maní y ganache de chocolate.',
                price: 1400,
                image: 'assets/images/postres/bombondemani.jpg'
            },
            {
                id: 8,
                name: 'Chocotorta',
                description: 'Clásica chocotorta con galletitas, queso y dulce de leche.',
                price: 1200,
                image: 'assets/images/postres/chocotorta.jpg'
            },
            {
                id: 9,
                name: 'Oreo',
                description: 'Postre de oreo con crema y galletas trituradas.',
                price: 1300,
                image: 'assets/images/postres/oreo.jpg'
            },
            {
                id: 10,
                name: 'Lemon Pie',
                description: 'Refrescante lemon pie con base de galleta, relleno de limón y merengue italiano.',
                price: 1900,
                image: 'assets/images/postres/lemonpie.jpg'
            }
        ]
    },
    individuales: {
        title: 'Postres Individuales',
        products: [
            {
                id: 1,
                name: 'Cheesecake en vasito',
                description: 'Cremoso cheesecake con base de galleta y topping de frutos rojos.',
                price: 150,
                image: 'assets/images/postres/cheesecakevaso.jpg'
            },
            {
                id: 2,
                name: 'Chajá en vasito',
                description: 'Clásico chajá uruguayo con merengue, crema y durazno. Dulce de leche opcional.',
                price: 150,
                image: 'assets/images/postres/chajavaso.jpg'
            },
            {
                id: 4,
                name: 'Red velvet en vasito',
                description: 'Suave red velvet con frosting de queso crema.',
                price: 150,
                image: 'assets/images/postres/redvelvetvaso.jpg'
            },
            {
                id: 5,
                name: 'Matilda en vasito',
                description: 'Torta matilda de chocolate con mousse de chocolate.',
                price: 150,
                image: 'assets/images/postres/matildavaso.jpg'
            },
            {
                id: 6,
                name: 'Selva negra en vasito',
                description: 'Selva negra con chocolate, cerezas y crema batida.',
                price: 150,
                image: 'assets/images/postres/selvanegravaso.jpg'
            },
            {
                id: 7,
                name: 'Bombón de maní en vasito',
                description: 'Torta de chocolate con crema de maní y ganache de chocolate.',
                price: 150,
                image: 'assets/images/postres/bombondemanivaso.jpg'
            },
            {
                id: 8,
                name: 'Chocotorta en vasito',
                description: 'Clásica chocotorta con galletitas, queso y dulce de leche.',
                price: 150,
                image: 'assets/images/postres/chocotortavaso.jpg'
            },
            {
                id: 9,
                name: 'Oreo en vasito',
                description: 'Postre de oreo con crema y galletas trituradas.',
                price: 150,
                image: 'assets/images/postres/oreovaso.jpg'
            },
            {
                id: 10,
                name: 'Banana split en vasito',
                description: 'Banana split con banana, dulce de leche, crema y salsa de frutilla.',
                price: 150,
                image: 'assets/images/postres/bananasplitvaso.jpg'
            },
            {
                id: 11,
                name: 'Lemon Pie en vasito',
                description: 'Refrescante lemon pie con base de galleta, relleno de limón y merengue italiano.',
                price: 150,
                image: 'assets/images/postres/lemonpievaso.jpg'
            },
            {
                id: 12,
                name: 'Porción de Red velvet',
                description: 'Porción de red velvet con frosting de queso crema.',
                price: 200,
                image: 'assets/images/postres/redvelvet.jpg'
            },
            {
                id: 13,
                name: 'Porción de Matilda',
                description: 'Porción de torta matilda de chocolate rellena de ganache de chocolate.',
                price: 200,
                image: 'assets/images/postres/matilda.jpg'
            },
            { 
                id: 14,
                name: 'Porción de Carrot Cake',
                description: 'Porción de torta de zanahoria con crema de queso y nueces.',
                price: 200,
                image: 'assets/images/postres/carrotcake.jpg'
            },
        ]
    }
};

// Variables globales para controlar los intervalos de slideshow
let slideshowIntervals = [];
let currentNavigationLevel = 0; // 0: inicio, 1: nivel 1, 2: nivel 2
let currentCategory = null;
let currentSubCategory = null;

// Función para mostrar el catálogo
function showCatalog(category, subCategory = null) {
    const catalogSection = document.getElementById('catalogo');
    const catalogTitle = document.getElementById('catalog-title');
    const catalogGrid = document.getElementById('catalog-grid');
    const mainContent = document.querySelector('.hero, .prices, .testimonials, .contact, .footer');

    // Limpiar intervalos existentes antes de crear nuevos
    clearSlideshowIntervals();

    // Ocultar contenido principal
    if (mainContent) {
        mainContent.style.display = 'none';
    }

    // Ocultar sección de servicios temporalmente
    const servicesSection = document.getElementById('servicios');
    if (servicesSection) {
        servicesSection.style.display = 'none';
    }

    // Mostrar catálogo
    catalogSection.classList.remove('hidden');

    // Cargar productos
    const categoryData = catalogData[category];
    currentCategory = category;

    catalogGrid.innerHTML = '';

    // Verificar si es un catálogo tipo slideshow
    if (categoryData.type === 'slideshow') {
        currentNavigationLevel = 1;
        catalogTitle.textContent = categoryData.title;

        categoryData.products.forEach((product, index) => {
            const slideshowCard = document.createElement('div');
            slideshowCard.className = 'product-card slideshow-card';
            slideshowCard.style.transitionDelay = `${index * 0.1}s`;

            // Crear ID único para este slideshow
            const slideshowId = `slideshow-${product.id}`;

            slideshowCard.innerHTML = `
                <div class="catalog-slideshow" id="${slideshowId}">
                    <div class="slideshow-images-container">
                        ${product.images.map((img, imgIndex) => `
                            <img src="${img}" alt="${product.name}" class="slideshow-image ${imgIndex === 0 ? 'active' : ''}" data-index="${imgIndex}">
                        `).join('')}
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">$${product.price}</div>
                    <button class="add-to-cart-button" onclick="addToCartWithRange(this, '${product.name}', '${product.price}')">
                        Añadir al Carrito
                    </button>
                </div>
            `;

            catalogGrid.appendChild(slideshowCard);

            // Iniciar la rotación de imágenes para este slideshow
            startSlideshowRotation(slideshowId, product.id, product.images.length);

            // Animar entrada
            setTimeout(() => {
                slideshowCard.classList.add('visible');
            }, 100 + index * 100);
        });
    } else if (categoryData.type === 'two-level') {
        // Navegación de dos niveles
        if (!subCategory) {
            // Mostrar nivel 1: opciones grandes
            currentNavigationLevel = 1;
            currentSubCategory = null;
            catalogTitle.textContent = categoryData.title;

            categoryData.level1.forEach((option, index) => {
                const optionCard = document.createElement('div');
                optionCard.className = 'category-option-card';
                optionCard.style.transitionDelay = `${index * 0.15}s`;
                optionCard.onclick = () => showCatalog(category, option.id);

                optionCard.innerHTML = `
                    <div class="category-option-emoji">${option.emoji}</div>
                    <div class="category-option-info">
                        <h3 class="category-option-name">${option.name}</h3>
                        <p class="category-option-description">${option.description}</p>
                    </div>
                `;

                catalogGrid.appendChild(optionCard);

                // Animar entrada
                setTimeout(() => {
                    optionCard.classList.add('visible');
                }, 100 + index * 150);
            });
        } else {
            // Mostrar nivel 2: productos específicos
            currentNavigationLevel = 2;
            currentSubCategory = subCategory;

            const subCategoryData = categoryData.level2[subCategory];
            const subCategoryInfo = categoryData.level1.find(opt => opt.id === subCategory);

            if (subCategoryInfo) {
                catalogTitle.textContent = subCategoryInfo.name;
            }

            subCategoryData.forEach((product, index) => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                productCard.style.transitionDelay = `${index * 0.1}s`;

                productCard.innerHTML = `
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}" class="product-image-img">
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-description">${product.description}</p>
                        <div class="product-price">$${product.price}</div>
                        <button class="add-to-cart-button" onclick="addToCart(this, '${product.name}', ${product.price})">
                            Añadir al Carrito
                        </button>
                    </div>
                `;

                catalogGrid.appendChild(productCard);

                // Animar entrada
                setTimeout(() => {
                    productCard.classList.add('visible');
                }, 100 + index * 100);
            });
        }
    } else {
        // Catálogo normal de productos
        currentNavigationLevel = 1;
        catalogTitle.textContent = categoryData.title;

        categoryData.products.forEach((product, index) => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.style.transitionDelay = `${index * 0.1}s`;

            // Usar imagen si está disponible, si no usar emoji
            const imageContent = product.image
                ? `<img src="${product.image}" alt="${product.name}" class="product-image-img">`
                : `<span>${product.emoji}</span>`;

            productCard.innerHTML = `
                <div class="product-image">
                    ${imageContent}
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">$${product.price}</div>
                    <button class="add-to-cart-button" onclick="addToCart(this, '${product.name}', ${product.price})">
                        Añadir al Carrito
                    </button>
                </div>
            `;

            catalogGrid.appendChild(productCard);

            // Animar entrada
            setTimeout(() => {
                productCard.classList.add('visible');
            }, 100 + index * 100);
        });
    }

    // Scroll suave hacia el catálogo
    catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Función para iniciar la rotación de imágenes de un slideshow
function startSlideshowRotation(slideshowId, productId, imageCount) {
    const slideshowElement = document.getElementById(slideshowId);

    if (!slideshowElement) return;

    // Crear intervalo para rotar imágenes cada 3 segundos
    const interval = setInterval(() => {
        // Obtener todas las imágenes
        const images = slideshowElement.querySelectorAll('.slideshow-image');
        if (images.length === 0) return;

        // Encontrar la imagen activa actual
        const currentActive = slideshowElement.querySelector('.slideshow-image.active');
        let currentActiveIndex = 0;

        if (currentActive) {
            currentActiveIndex = parseInt(currentActive.dataset.index);
            currentActive.classList.remove('active');
        }

        // Seleccionar una imagen aleatoria diferente a la actual
        let nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * imageCount);
        } while (nextIndex === currentActiveIndex && imageCount > 1);

        // Activar la siguiente imagen aleatoria
        const nextImage = slideshowElement.querySelector(`.slideshow-image[data-index="${nextIndex}"]`);
        if (nextImage) {
            nextImage.classList.add('active');
        }
    }, 3000); // 3 segundos

    // Guardar el intervalo para limpiarlo después
    slideshowIntervals.push(interval);
}

// Función para limpiar todos los intervalos de slideshow
function clearSlideshowIntervals() {
    slideshowIntervals.forEach(interval => {
        clearInterval(interval);
    });
    slideshowIntervals = [];
}

// Función para volver al inicio
function goBack() {
    const catalogSection = document.getElementById('catalogo');
    const mainContent = document.querySelector('.hero, .prices, .testimonials, .contact, .footer');
    const servicesSection = document.getElementById('servicios');

    // Limpiar intervalos de slideshow al volver
    clearSlideshowIntervals();

    // Verificar el nivel de navegación actual
    if (currentNavigationLevel === 2) {
        // Si estamos en nivel 2, volver a nivel 1
        currentNavigationLevel = 1;
        showCatalog(currentCategory, null);
    } else {
        // Si estamos en nivel 1 o inicio, volver al inicio del sitio
        currentNavigationLevel = 0;
        currentCategory = null;
        currentSubCategory = null;

        // Ocultar catálogo
        catalogSection.classList.add('hidden');

        // Mostrar contenido principal
        if (mainContent) {
            mainContent.style.display = '';
        }

        // Mostrar sección de servicios
        if (servicesSection) {
            servicesSection.style.display = '';
        }

        // Scroll al inicio
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Función para mostrar notificación
function showNotification(message) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    // Estilos
    notification.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: var(--primary-color);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
        font-weight: 600;
    `;

    // Agregar animaciones si no existen
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes fadeOut {
                from {
                    opacity: 1;
                }
                to {
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Eliminar después de 3 segundos
    setTimeout(() => {
        notification.remove();
    }, 3000);
}