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

    // Observe shipping cards with stagger
    document.querySelectorAll('.shipping-card').forEach((el, index) => {
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
document.querySelectorAll('.service-card, .price-card, .testimonial-card, .shipping-card').forEach(card => {
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

// ==================== HERO SLIDESHOW ====================

// Variables para el slideshow del hero
let heroSlideshowInterval;
let currentHeroImageIndex = 0;

// Función para obtener un índice aleatorio diferente al actual
function getRandomImageIndex(totalImages, currentIndex) {
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * totalImages);
    } while (newIndex === currentIndex && totalImages > 1);
    return newIndex;
}

// Función para iniciar el slideshow del hero
function startHeroSlideshow() {
    const heroSlideshow = document.getElementById('hero-slideshow');
    if (!heroSlideshow) return;

    const heroImages = heroSlideshow.querySelectorAll('.hero-bg-image');
    if (heroImages.length === 0) return;

    // Seleccionar una imagen aleatoria al inicio
    const randomStartIndex = Math.floor(Math.random() * heroImages.length);
    currentHeroImageIndex = randomStartIndex;

    // Activar inmediatamente la imagen aleatoria inicial
    heroImages.forEach((img, index) => {
        if (index === randomStartIndex) {
            img.classList.add('active');
        } else {
            img.classList.remove('active');
        }
    });

    // Iniciar rotación cada 4 segundos con selección aleatoria
    heroSlideshowInterval = setInterval(() => {
        // Remover clase active de la imagen actual
        heroImages[currentHeroImageIndex].classList.remove('active');

        // Obtener un índice aleatorio diferente al actual
        currentHeroImageIndex = getRandomImageIndex(heroImages.length, currentHeroImageIndex);

        // Agregar clase active a la siguiente imagen aleatoria
        heroImages[currentHeroImageIndex].classList.add('active');
    }, 4000); // 4 segundos
}

// Iniciar el slideshow cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    startHeroSlideshow();
    setRandomServiceImages(); // Establecer imágenes iniciales
    startServiceImagesRotation(); // Iniciar rotación continua
});

// ==================== IMÁGENES ALEATORIAS DE SERVICIOS ====================

// Variables para controlar la rotación de imágenes de servicios
let serviceImagesIntervals = {};
let serviceCurrentImageIndices = {};

// Función para obtener un índice aleatorio diferente al actual
function getServiceRandomImageIndex(totalImages, currentIndex) {
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * totalImages);
    } while (newIndex === currentIndex && totalImages > 1);
    return newIndex;
}

// Función para obtener todas las imágenes de una categoría
function getCategoryImages(category) {
    const categoryData = catalogData[category];
    if (!categoryData) return [];

    let images = [];

    if (categoryData.type === 'slideshow' && categoryData.products[0].images) {
        // Para categorías tipo slideshow (cumpleanos), usar imágenes del array
        images = categoryData.products[0].images;
    } else if (categoryData.type === 'sections' && categoryData.sections) {
        // Para categorías tipo sections (individuales), obtener productos de todas las secciones
        const allProducts = categoryData.sections.flatMap(section => section.products);
        images = allProducts.map(product => product.image);
    } else if (categoryData.products && categoryData.products.length > 0) {
        // Para categorías normales, usar las imágenes de los productos
        images = categoryData.products.map(product => product.image);
    }

    return images;
}

// Función para establecer imágenes aleatorias en las tarjetas de servicio
function setRandomServiceImages() {
    const categories = ['cumpleanos', 'postres', 'individuales', 'budines', 'salados', 'diadelamadre'];

    categories.forEach(category => {
        const images = getCategoryImages(category);
        if (images.length === 0) return;

        const serviceSlideshow = document.getElementById(`${category}-service-slideshow`);
        if (!serviceSlideshow) return;

        const serviceImages = serviceSlideshow.querySelectorAll('.service-bg-image');
        if (serviceImages.length === 0) return;

        // Seleccionar índices aleatorios iniciales (asegurando que sean diferentes)
        serviceCurrentImageIndices[category] = [];

        for (let i = 0; i < serviceImages.length; i++) {
            let randomIndex;
            if (i === 0) {
                // Primera imagen: completamente aleatoria
                randomIndex = Math.floor(Math.random() * images.length);
            } else {
                // Imágenes siguientes: diferentes a las anteriores
                let previousIndex = serviceCurrentImageIndices[category][i - 1];
                randomIndex = getServiceRandomImageIndex(images.length, previousIndex);
            }

            serviceCurrentImageIndices[category].push(randomIndex);
            serviceImages[i].src = images[randomIndex];
            serviceImages[i].classList.add('active');
        }
    });
}

// Función para iniciar la rotación continua de imágenes de servicios
function startServiceImagesRotation() {
    const categories = ['cumpleanos', 'postres', 'individuales', 'budines', 'salados', 'diadelamadre'];

    categories.forEach(category => {
        const images = getCategoryImages(category);
        if (images.length === 0) return;

        const serviceSlideshow = document.getElementById(`${category}-service-slideshow`);
        if (!serviceSlideshow) return;

        const serviceImages = serviceSlideshow.querySelectorAll('.service-bg-image');
        if (serviceImages.length === 0) return;

        // Inicializar índices actuales si no existen
        if (!serviceCurrentImageIndices[category]) {
            serviceCurrentImageIndices[category] = serviceImages.map((_, i) =>
                i === 0 ? Math.floor(Math.random() * images.length) : getServiceRandomImageIndex(images.length, serviceCurrentImageIndices[category]?.[i - 1] || 0)
            );
        }

        // Crear intervalo para cada categoría
        serviceImagesIntervals[category] = setInterval(() => {
            serviceImages.forEach((serviceImage, imageIndex) => {
                // Remover clase active de la imagen actual
                serviceImage.classList.remove('active');

                // Obtener un índice aleatorio diferente al actual
                const currentIndex = serviceCurrentImageIndices[category][imageIndex];
                const nextIndex = getServiceRandomImageIndex(images.length, currentIndex);
                serviceCurrentImageIndices[category][imageIndex] = nextIndex;

                // Cambiar la imagen
                serviceImage.src = images[nextIndex];

                // Agregar clase active después de un breve retraso para suavizar la transición
                setTimeout(() => {
                    serviceImage.classList.add('active');
                }, 50);
            });
        }, 4000); // Cambiar cada 4 segundos (igual que el hero)
    });
}

// Función para detener la rotación de imágenes de servicios
function stopServiceImagesRotation() {
    Object.keys(serviceImagesIntervals).forEach(category => {
        clearInterval(serviceImagesIntervals[category]);
    });
    serviceImagesIntervals = {};
}

// ==================== SISTEMA DE CARRITO ====================

// Objeto global del carrito
let cart = {
    items: [],
    total: 0
};

// Objeto para mantener referencia a los botones de cantidad por producto
let productButtons = {};

// Función para añadir al carrito
function addToCart(button, productName, price) {
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

    // Reemplazar el botón con controles de cantidad
    replaceButtonWithQuantityControls(button, productName, price);

    // Mostrar notificación
    showNotification(`${productName} añadido al carrito - $${price}`);
}

// Función para añadir al carrito con precio en rango
function addToCartWithRange(button, productName, priceRange) {
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

    // Reemplazar el botón con controles de cantidad
    replaceButtonWithQuantityControls(button, productName, priceRange, true);

    // Mostrar notificación
    showNotification(`${productName} añadido al carrito - $${priceRange}`);
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

// Función para reemplazar el botón con controles de cantidad
function replaceButtonWithQuantityControls(button, productName, price, isRange = false) {
    // Obtener el item actual del carrito
    const item = cart.items.find(item => item.name === productName);
    if (!item) return;

    // Guardar referencia al botón original
    productButtons[productName] = button;

    // Crear contenedor de controles de cantidad
    const quantityContainer = document.createElement('div');
    quantityContainer.className = 'quantity-controls-container';
    quantityContainer.innerHTML = `
        <div class="quantity-controls">
            <button class="quantity-button" onclick="updateProductQuantity('${productName}', -1, ${isRange})">-</button>
            <span class="quantity">${item.quantity}</span>
            <button class="quantity-button" onclick="updateProductQuantity('${productName}', 1, ${isRange})">+</button>
        </div>
    `;

    // Reemplazar el botón con el contenedor de controles
    button.replaceWith(quantityContainer);
}

// Función para actualizar la cantidad de un producto desde el catálogo
function updateProductQuantity(productName, change, isRange = false) {
    const item = cart.items.find(item => item.name === productName);
    if (!item) return;

    if (change === -1 && item.quantity === 1) {
        // Si la cantidad es 1 y se quiere restar, eliminar del carrito
        removeFromCartByName(productName);
        return;
    }

    // Actualizar cantidad
    item.quantity += change;

    // Actualizar total y contador
    updateCartTotal();
    updateCartCount();

    // Actualizar el mostrador de cantidad en el botón
    updateQuantityDisplay(productName, item.quantity);

    // Si el carrito está abierto, re-renderizar
    const cartModal = document.getElementById('cart-modal');
    if (!cartModal.classList.contains('hidden')) {
        renderCartItems();
    }
}

// Función para actualizar el mostrador de cantidad en el botón
function updateQuantityDisplay(productName, quantity) {
    const container = document.querySelector(`.quantity-controls-container`);
    if (container) {
        const quantitySpan = container.querySelector('.quantity');
        if (quantitySpan) {
            quantitySpan.textContent = quantity;
        }
    }
}

// Función para eliminar un producto del carrito por nombre
function removeFromCartByName(productName) {
    const item = cart.items.find(item => item.name === productName);
    if (!item) return;

    const index = cart.items.indexOf(item);
    cart.items.splice(index, 1);

    // Actualizar total y contador
    updateCartTotal();
    updateCartCount();

    // Restaurar el botón original
    restoreOriginalButton(productName);

    // Si el carrito está abierto, re-renderizar
    const cartModal = document.getElementById('cart-modal');
    if (!cartModal.classList.contains('hidden')) {
        renderCartItems();
    }

    // Mostrar notificación
    showNotification(`${productName} eliminado del carrito`);
}

// Función para restaurar el botón original
function restoreOriginalButton(productName) {
    const originalButton = productButtons[productName];
    const container = document.querySelector(`.quantity-controls-container`);

    if (originalButton && container) {
        // Crear un nuevo botón igual al original
        const newButton = originalButton.cloneNode(true);
        newButton.classList.remove('added');
        newButton.textContent = 'Añadir al Carrito';

        // Reemplazar el contenedor con el botón original
        container.replaceWith(newButton);

        // Eliminar la referencia
        delete productButtons[productName];
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
                    'assets/images/personalizada2.webp',
                    'assets/images/personalizada1.webp',
                    'assets/images/personalizada3.webp',
                    'assets/images/personalizada4.webp',
                    'assets/images/personalizada5.webp',
                    'assets/images/flores1.webp',
                    'assets/images/flores2.webp',
                    'assets/images/flores3.webp',
                    'assets/images/flores4.webp',
                    'assets/images/flores5.webp',
                    'assets/images/mariposas1.webp',
                    'assets/images/mariposas2.webp',
                    'assets/images/mariposas3.webp',
                    'assets/images/mariposas4.webp',
                    'assets/images/mariposas5.webp'
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
                description: 'Cheesecake con base de galleta, cubierto de mermelada de frutilla.',
                price: 1800,
                image: 'assets/images/postres/cheesecake.webp'
            },
            {
                id: 2,
                name: 'Chajá',
                description: 'Chajá con merengue, crema y durazno. Dulce de leche opcional.',
                price: 1500,
                image: 'assets/images/postres/chaja.webp'
            },
            {
                id: 3,
                name: 'Rogel',
                description: 'Rogel con capas de masa hojaldrada y dulce de leche.',
                price: 1700,
                image: 'assets/images/postres/rogel.webp'
            },
            {
                id: 4,
                name: 'Red velvet',
                description: 'Red velvet con frosting de queso crema.',
                price: 2000,
                image: 'assets/images/postres/redvelvetentero.webp'
            },
            {
                id: 5,
                name: 'Matilda',
                description: 'Torta matilda de chocolate rellena de ganache de chocolate.',
                price: 1600,
                image: 'assets/images/postres/matildaentero.webp'
            },
            {
                id: 6,
                name: 'Selva negra',
                description: 'Selva negra con chocolate, cerezas y crema batida.',
                price: 2000,
                image: 'assets/images/postres/selvanegra.webp'
            },
            {
                id: 7,
                name: 'Bombón de maní',
                description: 'Torta de chocolate rellena de crema de maní y ganache de chocolate.',
                price: 1400,
                image: 'assets/images/postres/bombondemani.webp'
            },
            {
                id: 8,
                name: 'Chocotorta',
                description: 'Clásica chocotorta con galletitas, queso y dulce de leche.',
                price: 1200,
                image: 'assets/images/postres/chocotorta.webp'
            },
            {
                id: 9,
                name: 'Oreo',
                description: 'Postre de oreo con crema y galletas trituradas.',
                price: 1300,
                image: 'assets/images/postres/oreo.webp'
            },
            {
                id: 10,
                name: 'Lemon Pie',
                description: 'Lemon pie con base de galleta, relleno de limón y merengue italiano.',
                price: 1900,
                image: 'assets/images/postres/lemonpie.webp'
            },
            {
                id: 11,
                name: 'Torta de limón',
                description: 'Torta de limón con crema de limón y merenguitos.',
                price: 1900,
                image: 'assets/images/postres/tortalimon.webp'
            },
            {
                id: 12,
                name: 'Pasta Frola',
                description: 'Pasta Frola de membrillo o dulce de leche.',
                price: 1200,
                image: 'assets/images/postres/pastafrola.webp'
            }
        ]
    },
    individuales: {
        title: 'Postres Individuales',
        type: 'sections',
        sections: [
            {
                title: 'Postres en vasito',
                products: [
                    {
                        id: 1,
                        name: 'Cheesecake en vasito',
                        description: 'Cheesecake con base de galleta y topping de frutos rojos.',
                        price: 150,
                        image: 'assets/images/postres/cheesecakevaso.webp'
                    },
                    {
                        id: 2,
                        name: 'Chajá en vasito',
                        description: 'Clásico chajá uruguayo con merengue, crema y durazno. Dulce de leche opcional.',
                        price: 150,
                        image: 'assets/images/postres/chajavaso.webp'
                    },
                    {
                        id: 3,
                        name: 'Red velvet en vasito',
                        description: 'Suave red velvet con frosting de queso crema.',
                        price: 150,
                        image: 'assets/images/postres/redvelvetvaso.webp'
                    },
                    {
                        id: 4,
                        name: 'Matilda en vasito',
                        description: 'Torta matilda de chocolate con mousse de chocolate.',
                        price: 150,
                        image: 'assets/images/postres/matildavaso.webp'
                    },
                    {
                        id: 5,
                        name: 'Selva negra en vasito',
                        description: 'Selva negra con chocolate, cerezas y crema batida.',
                        price: 150,
                        image: 'assets/images/postres/selvanegravaso.webp'
                    },
                    {
                        id: 6,
                        name: 'Bombón de maní en vasito',
                        description: 'Torta de chocolate con crema de maní y ganache de chocolate.',
                        price: 150,
                        image: 'assets/images/postres/bombondemanivaso.webp'
                    },
                    {
                        id: 7,
                        name: 'Chocotorta en vasito',
                        description: 'Clásica chocotorta con galletitas, queso y dulce de leche.',
                        price: 150,
                        image: 'assets/images/postres/chocotortavaso.webp'
                    },
                    {
                        id: 8,
                        name: 'Oreo en vasito',
                        description: 'Postre de oreo con crema y galletas trituradas.',
                        price: 150,
                        image: 'assets/images/postres/oreovaso.webp'
                    },
                    {
                        id: 9,
                        name: 'Banana split en vasito',
                        description: 'Banana split con banana, dulce de leche, crema y salsa de frutilla.',
                        price: 150,
                        image: 'assets/images/postres/bananasplitvaso.webp'
                    },
                    {
                        id: 10,
                        name: 'Lemon Pie en vasito',
                        description: 'Lemon pie con base de galleta, relleno de limón y merengue italiano.',
                        price: 150,
                        image: 'assets/images/postres/lemonpievaso.webp'
                    }
                ]
            },
            {
                title: 'Porciones y alfajores',
                products: [
                    {
                        id: 11,
                        name: 'Porción de Red velvet',
                        description: 'Porción de red velvet con frosting de queso crema.',
                        price: 150,
                        image: 'assets/images/postres/redvelvet.webp'
                    },
                    {
                        id: 12,
                        name: 'Porción de Matilda',
                        description: 'Porción de torta matilda de chocolate rellena de ganache de chocolate.',
                        price: 150,
                        image: 'assets/images/postres/matilda.webp'
                    },
                    {
                        id: 13,
                        name: 'Porción de Carrot Cake',
                        description: 'Porción de torta de zanahoria con crema de queso y nueces.',
                        price: 150,
                        image: 'assets/images/postres/carrotcake.webp'
                    },
                    {
                        id: 14,
                        name: 'Alfajores de chocolate',
                        description: '5 Alfajores de chocolate con relleno de dulce de leche.',
                        price: 150,
                        image: 'assets/images/postres/alfajoreschocolate.webp'
                    },
                    {
                        id: 15,
                        name: 'Alfajores de maicena',
                        description: '5 Alfajores de maicena con relleno de dulce de leche.',
                        price: 150,
                        image: 'assets/images/postres/alfajoresmaicena.webp'
                    }
                ]
            }
        ]
    },
    budines: {
        title: 'Budines',
        products: [
            {
                id: 1,
                name: 'Budín de Limón',
                description: 'Budín de limón con glaseado de limón.',
                price: 350,
                image: 'assets/images/budines/budinlimon.webp'
            },
            {
                id: 2,
                name: 'Budín de Naranja',
                description: 'Budín de naranja cítrico con ralladura de naranja.',
                price: 250,
                image: 'assets/images/budines/budinnaranja.webp'
            },
            {
                id: 3,
                name: 'Budín Marmolado',
                description: 'Budín marmolado de vainilla y chocolate.',
                price: 250,
                image: 'assets/images/budines/budinmarmolado.webp'
            },
            {
                id: 4,
                name: 'Budín de Banana con Nuez',
                description: 'Budín de banana con nueces crujientes.',
                price: 350,
                image: 'assets/images/budines/budinbananaconnuez.webp'
            },
            {
                id: 5,
                name: 'Budín Carrot Cake',
                description: 'Budín de zanahoria con frosting de queso crema.',
                price: 350,
                image: 'assets/images/budines/budincarrotcake.webp'
            },
            {
                id: 6,
                name: 'Budín de Vainilla con Chispas de Chocolate',
                description: 'Budín de vainilla con chispas de chocolate.',
                price: 350,
                image: 'assets/images/budines/budinvainillaconchips.webp'
            },
            {
                id: 7,
                name: 'Budín de Vainilla con Nuez y Pasas',
                description: 'Budín de vainilla con nueces y pasas de uva.',
                price: 350,
                image: 'assets/images/budines/budinvainillaconnuezyapasas.webp'
            },
            {
                id: 8,
                name: 'Budín de Chocolate.',
                description: 'Budín de Chocolate.',
                price: 250,
                image: 'assets/images/budines/budinchocolate.webp'
            },
            {
                id: 9,
                name: 'Budín de Vainilla',
                description: 'Budín de Vainilla.',
                price: 250,
                image: 'assets/images/budines/budinvainilla.webp'
            }
        ]
    },
    salados: {
        title: 'Salados',
        products: [
            {
                id: 1,
                name: 'Tarta de zapallitos',
                description: 'Tarta de zapallitos con queso y cebolla. Ideal para acompañar.',
                price: 800,
                image: 'assets/images/salados/tartazapallitos.webp'
            },
            {
                id: 2,
                name: 'Torta de fiambre',
                description: 'Torta de fiambre con mayonesa y vegetales. Perfecta para compartir.',
                price: 900,
                image: 'assets/images/salados/tortafiambre.webp'
            },
            {
                id: 3,
                name: 'Milanesa al pan',
                description: 'Milanesa al pan con lechuga, tomate y mayonesa. Clásica y deliciosa.',
                price: 350,
                image: 'assets/images/salados/milanesapan.webp'
            },
            {
                id: 4,
                name: 'Arrolladitos primavera',
                description: 'Arrolladitos primavera con jamón, queso y vegetales frescos.',
                price: 200,
                image: 'assets/images/salados/arrolladitosprimavera.webp'
            }
        ]
    },
    diadelamadre: {
        title: 'Día de la Madre',
        products: [
            {
                id: 1,
                name: 'Opción 1',
                description: 'Porción de Red Velvet, 2 mini budines, 5 galletas de avena y naranja, 3 sandwiches de jamón y queso, bombones, bebida a elección: jugo o capuccino y Tarjeta con mensaje personalizado.',
                price: 650,
                image: 'assets/images/festivos/desayuno1.webp'
            },
            {
                id: 2,
                name: 'Opción 2',
                description: 'Mini torta rellena de dulce de leche, Scons de queso y orégano, Taza + capuccino y tarjeta con mensaje personalizado.',
                price: 750,
                image: 'assets/images/festivos/desayuno2.webp'
            },
            {
                id: 3,
                name: 'Opción 3',
                description: 'Mini torta rellena de dulce de leche, 2 postres en vasito, bolsita de bombones, taza, sobre de capuccino y tarjeta con mensaje personalizado.',
                price: 790,
                image: 'assets/images/festivos/desayuno3.webp'
            },
            {
                id: 4,
                name: 'Opción 4',
                description: 'Torta delicada y riquísima, elegí tu diseño favorito. Incluye topper con el mensaje que quieras.',
                price: 500,
                image: 'assets/images/festivos/desayuno4.webp'
            },
            {
                id: 5,
                name: 'Opción 5',
                description: '4 cuadrados de pasta frola, 4 cuadrados de tarta de coco y dulce de leche, 4 cuadrados de limón, 4 galletas de avena y naranja, taza + sobre de capuccino.',
                price: 450,
                image: 'assets/images/festivos/desayuno5.webp'
            }
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
    const shippingSection = document.getElementById('envios');

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

    // Ocultar aviso de pedidos limitados en la página principal
    const orderNotice = document.querySelector('.order-notice');
    if (orderNotice) {
        orderNotice.style.display = 'none';
    }

    // Mostrar catálogo
    catalogSection.classList.remove('hidden');

    // Insertar aviso de pedidos limitados al principio del catálogo
    const catalogContainer = catalogSection.querySelector('.container');
    if (catalogContainer && !catalogContainer.querySelector('.catalog-order-notice')) {
        const orderNoticeClone = document.createElement('div');
        orderNoticeClone.className = 'order-notice catalog-order-notice';
        orderNoticeClone.innerHTML = `
            <div class="order-notice-content">
                <span class="order-notice-icon">⚠️</span>
                <p class="order-notice-text">Pedidos limitados, recomendamos reservar con tiempo para asegurar disponibilidad.</p>
            </div>
        `;
        catalogContainer.insertBefore(orderNoticeClone, catalogContainer.firstChild);
    }

    // Mostrar sección de envíos
    if (shippingSection) {
        shippingSection.classList.remove('hidden');
    }

    // Cargar productos
    const categoryData = catalogData[category];
    currentCategory = category;

    catalogGrid.innerHTML = '';

    // Remover clase especial de slideshow si existe
    catalogGrid.classList.remove('slideshow-grid');

    // Verificar si es un catálogo tipo slideshow
    if (categoryData.type === 'slideshow') {
        currentNavigationLevel = 1;
        catalogTitle.textContent = categoryData.title;

        // Agregar clase especial al grid para catálogos de slideshow
        catalogGrid.classList.add('slideshow-grid');

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
    } else if (categoryData.type === 'sections') {
        // Catálogo con secciones múltiples
        currentNavigationLevel = 1;
        catalogTitle.textContent = categoryData.title;

        let globalIndex = 0;

        categoryData.sections.forEach((section, sectionIndex) => {
            // Crear título de sección
            const sectionTitle = document.createElement('h3');
            sectionTitle.className = 'section-subtitle';
            sectionTitle.textContent = section.title;
            sectionTitle.style.gridColumn = '1 / -1';
            sectionTitle.style.marginTop = sectionIndex > 0 ? '40px' : '0';
            sectionTitle.style.marginBottom = '20px';
            sectionTitle.style.fontSize = '2rem';
            sectionTitle.style.color = 'var(--primary-color)';
            sectionTitle.style.fontWeight = '700';
            sectionTitle.style.textAlign = 'center';
            catalogGrid.appendChild(sectionTitle);

            // Animar entrada del título de sección
            setTimeout(() => {
                sectionTitle.style.opacity = '1';
                sectionTitle.style.transform = 'translateY(0)';
            }, 100 + globalIndex * 100);

            // Mostrar productos de esta sección
            section.products.forEach((product, productIndex) => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                productCard.style.transitionDelay = `${globalIndex * 0.1}s`;

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
                }, 100 + globalIndex * 100);

                globalIndex++;
            });
        });
    } else {
        // Catálogo normal de productos
        currentNavigationLevel = 1;
        catalogTitle.textContent = categoryData.title;

        categoryData.products.forEach((product, index) => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';

            // Agregar clase especial para Día de la madre
            if (category === 'diadelamadre') {
                productCard.classList.add('diadelamadre-card');
            }

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
    const catalogGrid = document.getElementById('catalog-grid');
    const shippingSection = document.getElementById('envios');
    const orderNotice = document.querySelector('.order-notice');

    // Limpiar intervalos de slideshow al volver
    clearSlideshowIntervals();

    // Remover clase especial de slideshow
    catalogGrid.classList.remove('slideshow-grid');

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

        // Mostrar aviso de pedidos limitados
        if (orderNotice) {
            orderNotice.style.display = '';
        }

        // Eliminar aviso de pedidos limitados del catálogo
        const catalogOrderNotice = catalogSection.querySelector('.catalog-order-notice');
        if (catalogOrderNotice) {
            catalogOrderNotice.remove();
        }

        // Scroll a la sección de servicios
        servicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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