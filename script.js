// Firebase ya está inicializado por firebase-config.js (cargado antes en el HTML)
// db, auth y storage están disponibles globalmente desde ese archivo.
let catalogData = {};
let offers = [];

// Logger de desarrollo — cambiar DEBUG a true solo en local para ver logs
const DEBUG = false;
const log = (...args) => { if (DEBUG) console.log(...args); };

// HTML escape helper — prevents XSS when inserting Firestore data in innerHTML
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Load offers from Firebase
async function loadOffers() {
  try {
    log('🔄 Cargando ofertas desde Firebase...');
    const offersSnapshot = await db.collection('offers').get();
    offers = offersSnapshot.docs.map(doc => doc.data());
    log(`✅ ${offers.length} ofertas cargadas desde Firebase`);

    // Mostrar detalles de las ofertas cargadas
    offers.forEach(offer => {
      log(`   - ${offer.name}:`);
      log(`     ID: ${offer.id}`);
      log(`     Tipo: ${offer.targetType}, Target: ${offer.targetId}`);
      log(`     Descuento: ${offer.type} - ${offer.value}`); // Cambiado a type y value
      log(`     Activa: ${offer.isActive}`);
      log(`     Fechas: ${offer.startDate} - ${offer.endDate}`);
    });

    // Aplicar ofertas a los productos cargados
    if (Object.keys(catalogData).length > 0) {
      applyOffersToProducts();
    }
  } catch (error) {
    console.error('Error cargando ofertas:', error);
    offers = [];
    // Las ofertas no son críticas — el catálogo sigue funcionando sin ellas.
    // Solo logueamos; no mostramos error al usuario.
  }
}

// Apply offers to products
function applyOffersToProducts() {
  log('🏷️ Aplicando ofertas a productos...');

  Object.keys(catalogData).forEach(categoryId => {
    const category = catalogData[categoryId];

    // Aplicar a productos directos
    category.products.forEach(product => {
      const pricing = calculateProductPrice(product);
      product.price = pricing.finalPrice;
      product.appliedOffer = pricing.appliedOffer;
      product.discountPercentage = pricing.discountPercentage;
    });

    // Aplicar a productos en secciones
    if (category.sections) {
      category.sections.forEach(section => {
        section.products.forEach(product => {
          const pricing = calculateProductPrice(product);
          product.price = pricing.finalPrice;
          product.appliedOffer = pricing.appliedOffer;
          product.discountPercentage = pricing.discountPercentage;
        });
      });
    }
  });

  log('✅ Ofertas aplicadas');

  // Actualizar badges de categorías después de aplicar ofertas
  updateCategoryBadges();
}

// Calculate product price with offers
function calculateProductPrice(product) {
  // Usar siempre basePrice como precio original
  const basePrice = product.basePrice || product.price;
  let finalPrice = basePrice;
  let appliedOffer = null;

  log(`🔍 Calculando precio para ${product.name}:`);
  log(`   Base: $${basePrice}, Category: ${product.category}, ID: ${product.id}`);

  // Get active offers for this product
  const productOffers = offers.filter(offer =>
    offer.targetType === 'product' &&
    offer.targetId === product.id &&
    offer.isActive &&
    isOfferValid(offer)
  );

  const categoryOffers = offers.filter(offer =>
    offer.targetType === 'category' &&
    offer.targetId === product.category &&
    offer.isActive &&
    isOfferValid(offer)
  );

  log(`   Ofertas de producto: ${productOffers.length}`);
  log(`   Ofertas de categoría: ${categoryOffers.length}`);

  // Apply offer with highest priority
  if (productOffers.length > 0) {
    // Individual offers have priority
    appliedOffer = productOffers.sort((a, b) => b.priority - a.priority)[0];
    finalPrice = applyOfferToPrice(basePrice, appliedOffer);
    log(`   ✅ Oferta de producto aplicada: ${appliedOffer.name}`);
  } else if (categoryOffers.length > 0) {
    // Category offers
    appliedOffer = categoryOffers.sort((a, b) => b.priority - a.priority)[0];
    finalPrice = applyOfferToPrice(basePrice, appliedOffer);
    log(`   ✅ Oferta de categoría aplicada: ${appliedOffer.name}`);
  } else {
    log(`   ❌ No se aplicaron ofertas`);
  }

  // Round price
  finalPrice = Math.round(finalPrice);

  const result = {
    finalPrice: finalPrice,
    appliedOffer: appliedOffer,
    basePrice: basePrice,
    discountPercentage: appliedOffer ? calculateDiscountPercentage(basePrice, finalPrice) : 0
  };

  log(`   Resultado: $${result.finalPrice} (descuento: ${result.discountPercentage}%)`);

  return result;
}

// Apply offer to price
function applyOfferToPrice(basePrice, offer) {
  switch (offer.type) { // Cambiado de discountType a type
    case 'percentage':
      return basePrice * (1 - offer.value / 100); // Cambiado de discountValue a value
    case 'fixed':
      return Math.max(0, basePrice - offer.value); // Cambiado de discountValue a value
    case 'price':
      return offer.value; // Cambiado de discountValue a value
    default:
      return basePrice;
  }
}

// Check if offer is valid (date range)
function isOfferValid(offer) {
  const now = new Date();
  const startDate = offer.startDate ? new Date(offer.startDate) : null;
  const endDate = offer.endDate ? new Date(offer.endDate) : null;

  if (startDate && now < startDate) return false;
  if (endDate && now > endDate) return false;

  return true;
}

// Calculate discount percentage
function calculateDiscountPercentage(basePrice, finalPrice) {
  if (basePrice <= 0) return 0;
  return Math.round(((basePrice - finalPrice) / basePrice) * 100);
}

// Calculate highest discount for each category
function calculateCategoryDiscounts() {
  const categoryDiscounts = {};

  Object.keys(catalogData).forEach(categoryId => {
    const category = catalogData[categoryId];
    let maxDiscount = 0;

    // Check products in main category
    category.products.forEach(product => {
      if (product.appliedOffer && product.discountPercentage > maxDiscount) {
        maxDiscount = product.discountPercentage;
      }
    });

    // Check products in sections
    if (category.sections) {
      category.sections.forEach(section => {
        section.products.forEach(product => {
          if (product.appliedOffer && product.discountPercentage > maxDiscount) {
            maxDiscount = product.discountPercentage;
          }
        });
      });
    }

    categoryDiscounts[categoryId] = maxDiscount;
  });

  return categoryDiscounts;
}

// Update category badges with discount information
function updateCategoryBadges() {
  const categoryDiscounts = calculateCategoryDiscounts();

  Object.keys(categoryDiscounts).forEach(categoryId => {
    const discount = categoryDiscounts[categoryId];
    const serviceCard = document.querySelector(`.service-card[data-category="${categoryId}"]`);

    if (serviceCard && discount > 0) {
      // Remove existing badge if any
      const existingBadge = serviceCard.querySelector('.category-offer-badge');
      if (existingBadge) {
        existingBadge.remove();
      }

      // Create and add new badge
      const badge = document.createElement('div');
      badge.className = 'category-offer-badge';
      badge.innerHTML = `<span class="discount-text">-${discount}%</span>`;
      serviceCard.appendChild(badge);
    }
  });
}

// Función de prueba para verificar el sistema de precios
function testPricingSystem() {
  log('🧪 Probando sistema de precios...');

  if (Object.keys(catalogData).length === 0) {
    log('❌ No hay datos cargados');
    return;
  }

  log(`📦 Catálogo cargado: ${Object.keys(catalogData).length} categorías`);
  log(`🏷️ Ofertas cargadas: ${offers.length}`);

  // Mostrar ofertas disponibles
  if (offers.length > 0) {
    log('\n📋 Ofertas disponibles:');
    offers.forEach(offer => {
      log(`   - ${offer.name} (${offer.targetType}: ${offer.targetId})`);
      log(`     Tipo: ${offer.type}, Valor: ${offer.value}`); // Cambiado a type y value
      log(`     Activa: ${offer.isActive}, Válida: ${isOfferValid(offer)}`);
    });
  }

  // Mostrar productos con precios
  Object.keys(catalogData).forEach(categoryId => {
    const category = catalogData[categoryId];
    log(`\n📂 ${categoryId} (${category.title}):`);

    category.products.forEach(product => {
      const hasDiscount = product.appliedOffer !== null;
      log(`   ${hasDiscount ? '🏷️' : '💰'} ${product.name}:`);
      log(`      ID: ${product.id}`);
      log(`      Categoría: ${product.category}`);
      log(`      Precio base: $${product.basePrice}`);
      log(`      Precio final: $${product.price}`);
      if (hasDiscount) {
        log(`      Descuento: ${product.discountPercentage}% (${product.appliedOffer.name})`);
        log(`      Oferta aplicada:`, product.appliedOffer);
      } else {
        log(`      Sin descuento aplicado`);
      }
    });
  });

  log('\n✅ Prueba completada');
}

// Hacer la función disponible globalmente para pruebas
window.testPricingSystem = testPricingSystem;

// Muestra un mensaje de error visible en el catálogo cuando Firebase falla
function showCatalogError(message) {
  const catalogGrid = document.getElementById('catalog-grid');
  if (catalogGrid) {
    catalogGrid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:40px 20px; color:#c0392b;">
        <p style="font-size:1.1rem; margin-bottom:8px;">⚠️ ${esc(message)}</p>
        <p style="font-size:0.9rem; color:#666;">Verificá tu conexión y recargá la página.</p>
      </div>`;
  }
}

// Load catalog data from Firebase
async function loadCatalogData() {
  try {
    log('🔄 Cargando catálogo desde Firebase...');

    // Load categories
    const categoriesSnapshot = await db.collection('categories').get();
    const categories = {};

    categoriesSnapshot.forEach(doc => {
      const category = doc.data();
      categories[category.id] = {
        title: category.name,
        type: category.type || 'slideshow',
        products: []
      };
    });

    // Load products
    const productsSnapshot = await db.collection('products').get();
    productsSnapshot.forEach(doc => {
      const product = doc.data();
      // Usar 'category' en lugar de 'categoryId' según la estructura de migración
      const categoryId = product.category || product.categoryId;
      if (categories[categoryId]) {
        // Para categorías tipo sections, necesitamos organizar por secciones
        if (categories[categoryId].type === 'sections' && !categories[categoryId].sections) {
          // Inicializar estructura de secciones si no existe
          categories[categoryId].sections = [];
        }

        const productData = {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.currentPrice,
          basePrice: product.basePrice,
          category: categoryId, // Agregar categoría para ofertas
          image: product.images && product.images.length > 0 ? product.images[0] : product.image,
          images: product.images || (product.image ? [product.image] : [])
        };

        log(`📦 Producto cargado: ${product.name} - Base: $${product.basePrice}, Current: $${product.currentPrice}, Category: ${categoryId}`);

        // Si es tipo sections y el producto tiene sección, agregar a la sección correspondiente
        if (categories[categoryId].type === 'sections' && product.section) {
          let section = categories[categoryId].sections.find(s => s.title === product.section);
          if (!section) {
            section = { title: product.section, products: [] };
            categories[categoryId].sections.push(section);
          }
          section.products.push(productData);
        } else {
          // Agregar directamente a products
          categories[categoryId].products.push(productData);
        }
      }
    });

    catalogData = categories;
    log('✅ Catálogo cargado desde Firebase:', Object.keys(catalogData));

    // Log de precios para verificar
    Object.keys(catalogData).forEach(categoryId => {
      const category = categories[categoryId];
      log(`📦 ${categoryId}: ${category.products.length} productos`);
      category.products.forEach(product => {
        log(`   - ${product.name}: $${product.price} (base: $${product.basePrice})`);
      });
    });

    // Aplicar ofertas si ya están cargadas
    if (offers.length > 0) {
      applyOffersToProducts();
    }

    // Actualizar badges de categorías con ofertas
    updateCategoryBadges();

    // Inicializar imágenes de servicios ahora que los datos están listos
    onCatalogLoaded();
  } catch (error) {
    console.error('Error cargando catálogo:', error);
    showCatalogError('No se pudo cargar el catálogo de productos.');
  }
}

// Iniciar carga del catálogo cuando el DOM esté listo
// (Firebase ya está inicializado por firebase-config.js)
document.addEventListener('DOMContentLoaded', () => {
  if (window.db) {
    loadCatalogData();
    loadOffers();
  }
});

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
        const href = this.getAttribute('href');
        if (!href || href === '#') return; // ignore bare # anchors
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Parallax effect on scroll — single rAF-throttled handler, DOM refs cached once
const _parallaxContent = document.querySelector('.hero-content');
let parallaxTicking = false;
function handleParallax() {
    const scrolled = window.pageYOffset;
    if (_parallaxContent) {
        _parallaxContent.style.transform = `translateY(${scrolled * 0.15}px)`;
    }
    parallaxTicking = false;
}
window.addEventListener('scroll', () => {
    if (!parallaxTicking) {
        requestAnimationFrame(handleParallax);
        parallaxTicking = true;
    }
}, { passive: true });

// Hover effects handled entirely by CSS :hover rules — no JS needed.

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

// Fade-in de body manejado por CSS (ver styles.css — @keyframes bodyFadeIn)

// Mobile menu toggle (if needed in future)
const addMobileMenu = () => {
    // Placeholder for future mobile menu functionality
    log('Mobile menu ready for implementation');
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
        // Parallax is handled by a single rAF handler; no separate mobile removal needed
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

log('La Pastelería website loaded successfully! 🎂');

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

// Iniciar el hero slideshow al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    startHeroSlideshow();
});

// Llamado desde loadCatalogData() cuando los datos de Firebase están listos
function onCatalogLoaded() {
    // Los slideshows del catálogo se inician al renderizar las tarjetas
}

// ==================== SISTEMA DE CARRITO ====================

// Pausar/reanudar todos los intervals cuando el tab no es visible
// Evita trabajo innecesario de CPU/GPU cuando el usuario no está mirando
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pausar hero
        if (heroSlideshowInterval) { clearInterval(heroSlideshowInterval); heroSlideshowInterval = null; }
        // Pausar catalog slideshows
        clearSlideshowIntervals();
    } else {
        // Reanudar hero
        startHeroSlideshow();
        // Los catalog slideshows se reanudan al volver al catálogo
    }
});

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
    quantityContainer.dataset.productName = productName;
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

    // Actualizar el mostrador de cantidad en el botón (catálogo)
    updateQuantityDisplay(productName, item.quantity);

    // Si el carrito está abierto, re-renderizar
    const cartModal = document.getElementById('cart-modal');
    if (!cartModal.classList.contains('hidden')) {
        renderCartItems();
    }
}

// Función para actualizar el mostrador de cantidad en el botón
function updateQuantityDisplay(productName, quantity) {
    const container = document.querySelector(`.quantity-controls-container[data-product-name="${productName}"]`);
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
    const container = document.querySelector(`.quantity-controls-container[data-product-name="${productName}"]`);

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

// Función para restaurar todos los botones en el catálogo
function restoreAllCatalogButtons() {
    // Recorrer todos los contenedores de controles de cantidad
    document.querySelectorAll('.quantity-controls-container').forEach(container => {
        const productName = container.dataset.productName;
        restoreOriginalButton(productName);
    });

    // Limpiar todas las referencias a botones
    productButtons = {};
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

    // Actualizar todas las cantidades en el catálogo al cerrar el carrito
    updateAllCatalogQuantities();
}

// Función para actualizar todas las cantidades en el catálogo
function updateAllCatalogQuantities() {
    // Primero, eliminar todos los controles de cantidad del catálogo
    document.querySelectorAll('.quantity-controls-container').forEach(container => {
        const productName = container.dataset.productName;
        const item = cart.items.find(item => item.name === productName);

        if (item) {
            // Si el producto está en el carrito, actualizar la cantidad
            const quantitySpan = container.querySelector('.quantity');
            if (quantitySpan) {
                quantitySpan.textContent = item.quantity;
            }
        } else {
            // Si el producto no está en el carrito, restaurar el botón original
            restoreOriginalButton(productName);
        }
    });
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
                <h4 class="cart-item-name">${esc(item.name)}</h4>
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
async function checkout() {
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

    // 6. Guardar pedido en Firebase
    try {
        showNotification('🔄 Procesando pedido...');

        // Preparar datos del pedido para Firebase
        const orderData = {
            cliente: {
                nombre: 'Cliente Web', // Se puede personalizar más adelante
                telefono: phoneNumber,
                email: 'cliente@web.com' // Se puede personalizar más adelante
            },
            direccion: 'A coordinar', // Se puede personalizar más adelante
            metodoPago: 'a_coordinar', // Se puede personalizar más adelante
            notas: 'Pedido realizado desde la web',
            items: cart.items.map(item => ({
                productoId: 'web_' + item.name.replace(/\s+/g, '_').toLowerCase(),
                nombre: item.name,
                cantidad: item.quantity,
                precio: item.price,
                subtotal: item.price * item.quantity
            })),
            total: total,
            fuente: 'web' // Indica que el pedido viene de la web
        };

        // Crear pedido en Firebase
        const orderId = 'order_' + Date.now();
        await db.collection('orders').doc(orderId).set({
            id: orderId,
            ...orderData,
            fecha: new Date().toISOString(),
            estado: 'pendiente'
        });

        log('✅ Pedido guardado en Firebase:', orderId);

        // Mostrar confirmación antes de redirigir
        if (confirm(`¿Confirmar pedido por $${total}?\n\nSerás redirigido a WhatsApp para enviar tu pedido.\n\n✅ Pedido registrado en el sistema.`)) {
            // Redirigir a WhatsApp
            window.open(whatsappLink, '_blank');

            // Cerrar el carrito
            closeCart();

            // Limpiar el carrito después de enviar el pedido
            cart.items = [];
            cart.total = 0;
            updateCartTotal();
            updateCartCount();

            // Restaurar todos los botones en el catálogo
            restoreAllCatalogButtons();

            // Mostrar notificación de éxito
            showNotification('✅ Pedido enviado a WhatsApp y registrado en el sistema');
        }

    } catch (error) {
        console.error('Error al guardar pedido en Firebase:', error);
        showNotification('❌ Error al procesar el pedido. Por favor, intenta nuevamente.');
    }
}

// Catálogo dinámico
// NOTA: catalogData ahora se carga dinámicamente desde Firebase
// Ver función loadCatalogData() arriba en el archivo

// Variables globales para controlar los intervalos de slideshow
let slideshowIntervals = [];
let currentNavigationLevel = 0; // 0: inicio, 1: nivel 1, 2: nivel 2
let currentCategory = null;
let currentSubCategory = null;

// Función para mostrar el catálogo
function showCatalog(category, subCategory = null) {
    // Verificar si Firebase está inicializado y los datos están cargados
    if (!db || Object.keys(catalogData).length === 0) {
        log('⏳ Esperando carga de datos de Firebase...');
        // Mostrar mensaje de carga
        const catalogSection = document.getElementById('catalogo');
        const catalogGrid = document.getElementById('catalog-grid');
        catalogSection.classList.remove('hidden');
        catalogGrid.innerHTML = '<div class="loading-message">🔄 Cargando productos desde Firebase...</div>';

        // Intentar cargar datos nuevamente
        if (db) {
            loadCatalogData().then(() => {
                showCatalog(category, subCategory);
            });
        } else {
            // Esperar a que Firebase se inicialice
            setTimeout(() => showCatalog(category, subCategory), 1000);
        }
        return;
    }

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

            // Deduplicar imágenes para evitar que se muestre la misma foto dos veces
            const uniqueImages = [...new Set(product.images)];

            slideshowCard.innerHTML = `
                <div class="catalog-slideshow" id="${slideshowId}">
                    <div class="slideshow-images-container">
                        ${uniqueImages.map((img, imgIndex) => `
                            <img src="${esc(img)}" alt="${esc(product.name)}" class="slideshow-image ${imgIndex === 0 ? 'active' : ''}" data-index="${imgIndex}">
                        `).join('')}
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${esc(product.name)}</h3>
                    <p class="product-description">${esc(product.description)}</p>
                    <div class="product-price">
                        ${product.appliedOffer ? `
                            <span class="price-group">
                                <span class="original-price">$${product.basePrice}</span>
                                <span class="discounted-price">$${product.price}</span>
                            </span>
                            <span class="discount-badge">-${product.discountPercentage}%</span>
                        ` : `$${product.price}`}
                    </div>
                    <button class="add-to-cart-button" onclick="addToCartWithRange(this, ${JSON.stringify(esc(product.name))}, '${product.price}')">
                        Añadir al Carrito
                    </button>
                </div>
            `;

            catalogGrid.appendChild(slideshowCard);

            // Iniciar la rotación de imágenes para este slideshow
            startSlideshowRotation(slideshowId, product.id, uniqueImages.length);

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
                        <img src="${esc(product.images && product.images.length > 0 ? product.images[0] : '')}" alt="${esc(product.name)}" class="product-image-img" loading="lazy">
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${esc(product.name)}</h3>
                        <p class="product-description">${esc(product.description)}</p>
                        <div class="product-price">
                            ${product.appliedOffer ? `
                                <span class="price-group">
                                    <span class="original-price">$${product.basePrice}</span>
                                    <span class="discounted-price">$${product.price}</span>
                                </span>
                                <span class="discount-badge">-${product.discountPercentage}%</span>
                            ` : `$${product.price}`}
                        </div>
                        <button class="add-to-cart-button" onclick="addToCart(this, ${JSON.stringify(esc(product.name))}, ${product.price})">
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

                const imageContent = product.images && product.images.length > 0
                    ? `<img src="${esc(product.images[0])}" alt="${esc(product.name)}" class="product-image-img" loading="lazy">`
                    : `<span>${esc(product.emoji)}</span>`;

                productCard.innerHTML = `
                    <div class="product-image">
                        ${imageContent}
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${esc(product.name)}</h3>
                        <p class="product-description">${esc(product.description)}</p>
                        <div class="product-price">
                            ${product.appliedOffer ? `
                                <span class="price-group">
                                    <span class="original-price">$${product.basePrice}</span>
                                    <span class="discounted-price">$${product.price}</span>
                                </span>
                                <span class="discount-badge">-${product.discountPercentage}%</span>
                            ` : `$${product.price}`}
                        </div>
                        <button class="add-to-cart-button" onclick="addToCart(this, ${JSON.stringify(esc(product.name))}, ${product.price})">
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
            const imageContent = product.images && product.images.length > 0
                ? `<img src="${esc(product.images[0])}" alt="${esc(product.name)}" class="product-image-img" loading="lazy">`
                : `<span>${esc(product.emoji)}</span>`;

            productCard.innerHTML = `
                <div class="product-image">
                    ${imageContent}
                </div>
                <div class="product-info">
                    <h3 class="product-name">${esc(product.name)}</h3>
                    <p class="product-description">${esc(product.description)}</p>
                    <div class="product-price">$${product.price}</div>
                    <button class="add-to-cart-button" onclick="addToCart(this, ${JSON.stringify(esc(product.name))}, ${product.price})">
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
    if (imageCount <= 1) return; // Sin sentido rotar si solo hay una imagen

    const slideshowElement = document.getElementById(slideshowId);
    if (!slideshowElement) return;

    // Cachear referencias al DOM una sola vez — no re-consultar en cada tick
    const images = Array.from(slideshowElement.querySelectorAll('.slideshow-image'));
    if (images.length === 0) return;

    let currentIndex = 0; // La primera imagen arranca activa

    const interval = setInterval(() => {
        // Desactivar imagen actual
        images[currentIndex].classList.remove('active');

        // Avanzar secuencialmente (evita repetición y es más predecible que random)
        currentIndex = (currentIndex + 1) % images.length;

        // Activar la siguiente
        images[currentIndex].classList.add('active');
    }, 3000);

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