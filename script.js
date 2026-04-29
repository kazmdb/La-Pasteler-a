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

// Counter animation for prices
const animateCounter = (element, target, duration = 2000) => {
    let start = 0;
    const increment = target / (duration / 16);

    const updateCounter = () => {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
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
                // Check if price is a range (contains dash) - don't animate ranges
                if (priceElement.textContent.includes('-')) {
                    // Skip animation for price ranges
                    return;
                }

                const priceText = priceElement.textContent.replace(/[^0-9]/g, '');
                const priceValue = parseInt(priceText);

                // Only animate if not already animated
                if (!priceElement.dataset.animated) {
                    priceElement.dataset.animated = 'true';
                    priceElement.textContent = '$0';
                    animateCounter(priceElement, priceValue);
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

// Función para actualizar el total del carrito
function updateCartTotal() {
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
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
                    <span>$${item.price * item.quantity}</span>
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
        products: [
            {
                id: 1,
                name: 'Torta Chocolate Clásica',
                description: 'Deliciosa torta de chocolate con ganache y decoración colorida.',
                price: 800,
                emoji: '🎂'
            },
            {
                id: 2,
                name: 'Torta Vainilla con Frutas',
                description: 'Bizcocho de vainilla fresco con frutas de estación.',
                price: 750,
                emoji: '🍓'
            },
            {
                id: 3,
                name: 'Torta Oreo',
                description: 'Torta de chocolate con galletas Oreo y crema de queso.',
                price: 900,
                emoji: '🍪'
            },
            {
                id: 4,
                name: 'Torta Mousse de Limón',
                description: 'Refrescante mousse de limón con base de bizcocho.',
                price: 850,
                emoji: '🍋'
            },
            {
                id: 5,
                name: 'Torta Red Velvet',
                description: 'Elegante torta Red Velvet con frosting de queso crema.',
                price: 950,
                emoji: '🎀'
            },
            {
                id: 6,
                name: 'Torta de Cumpleaños Personalizada',
                description: 'Diseño personalizado con el tema que elijas.',
                price: 1200,
                emoji: '🎉'
            }
        ]
    },
    casamientos: {
        title: 'Tortas de Casamientos',
        products: [
            {
                id: 7,
                name: 'Torta Nupcial Clásica',
                description: 'Elegante torta de varios pisos con decoración tradicional.',
                price: 2500,
                emoji: '💒'
            },
            {
                id: 8,
                name: 'Torta de Frutas',
                description: 'Torta con frutas frescas y crema batida ligera.',
                price: 2200,
                emoji: '🍇'
            },
            {
                id: 9,
                name: 'Torta Chocolate Gourmet',
                description: 'Torta de chocolate belga con ganache de lujo.',
                price: 2800,
                emoji: '🍫'
            },
            {
                id: 10,
                name: 'Torta Minimalista',
                description: 'Diseño moderno y minimalista con flores naturales.',
                price: 3000,
                emoji: '🌸'
            },
            {
                id: 11,
                name: 'Torta Cupcake Tower',
                description: 'Torre de cupcakes decorados con temática de boda.',
                price: 1800,
                emoji: '🧁'
            }
        ]
    },
    postres: {
        title: 'Postres Variados',
        products: [
            {
                id: 12,
                name: 'Tiramisú Clásico',
                description: 'Auténtico tiramisú italiano con mascarpone y café.',
                price: 450,
                emoji: '☕'
            },
            {
                id: 13,
                name: 'Cheesecake de Frutos Rojos',
                description: 'Cremoso cheesecake con salsa de frutos rojos.',
                price: 400,
                emoji: '🍒'
            },
            {
                id: 14,
                name: 'Mousse de Chocolate',
                description: 'Suave mousse de chocolate belga.',
                price: 350,
                emoji: '🍫'
            },
            {
                id: 15,
                name: 'Flan de Caramelo',
                description: 'Flan casero con caramelo artesanal.',
                price: 300,
                emoji: '🍮'
            },
            {
                id: 16,
                name: 'Profiteroles',
                description: 'Bolas de masa rellenas de crema con chocolate.',
                price: 380,
                emoji: '🥐'
            },
            {
                id: 17,
                name: 'Pavlova de Frutas',
                description: 'Merengue crujiente con crema y frutas frescas.',
                price: 420,
                emoji: '🍓'
            }
        ]
    }
};

// Función para mostrar el catálogo
function showCatalog(category) {
    const catalogSection = document.getElementById('catalogo');
    const catalogTitle = document.getElementById('catalog-title');
    const catalogGrid = document.getElementById('catalog-grid');
    const mainContent = document.querySelector('.hero, .prices, .testimonials, .contact, .footer');

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
    catalogTitle.textContent = categoryData.title;

    catalogGrid.innerHTML = '';

    categoryData.products.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.style.transitionDelay = `${index * 0.1}s`;

        productCard.innerHTML = `
            <div class="product-image">
                <span>${product.emoji}</span>
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

    // Scroll suave hacia el catálogo
    catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Función para volver al inicio
function goBack() {
    const catalogSection = document.getElementById('catalogo');
    const mainContent = document.querySelector('.hero, .prices, .testimonials, .contact, .footer');
    const servicesSection = document.getElementById('servicios');

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