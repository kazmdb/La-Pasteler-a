// Firebase SDK
const firebaseScript = document.createElement('script');
firebaseScript.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js';
document.head.appendChild(firebaseScript);

const firestoreScript = document.createElement('script');
firestoreScript.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js';
document.head.appendChild(firestoreScript);

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBo5jBsKvQTP7rTy8GYXbs7YlA1nD_7A3s",
  authDomain: "la-pasteleria-b2b83.firebaseapp.com",
  projectId: "la-pasteleria-b2b83",
  storageBucket: "la-pasteleria-b2b83.firebasestorage.app",
  messagingSenderId: "747582851026",
  appId: "1:747582851026:web:caf908805814fc82492a0b",
  measurementId: "G-6FZ21G8Q6X"
};

// Initialize Firebase
let db = null;
let catalogData = {};
let offers = [];

// Initialize Firebase when scripts are loaded
function initializeFirebase() {
  if (typeof firebase !== 'undefined' && !db) {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    loadCatalogData();
    loadOffers();
  }
}

// Load offers from Firebase
async function loadOffers() {
  try {
    console.log('🔄 Cargando ofertas desde Firebase...');
    const offersSnapshot = await db.collection('offers').get();
    offers = offersSnapshot.docs.map(doc => doc.data());
    console.log(`✅ ${offers.length} ofertas cargadas desde Firebase`);

    // Mostrar detalles de las ofertas cargadas
    offers.forEach(offer => {
      console.log(`   - ${offer.name}:`);
      console.log(`     ID: ${offer.id}`);
      console.log(`     Tipo: ${offer.targetType}, Target: ${offer.targetId}`);
      console.log(`     Descuento: ${offer.type} - ${offer.value}`); // Cambiado a type y value
      console.log(`     Activa: ${offer.isActive}`);
      console.log(`     Fechas: ${offer.startDate} - ${offer.endDate}`);
    });

    // Aplicar ofertas a los productos cargados
    if (Object.keys(catalogData).length > 0) {
      applyOffersToProducts();
    }
  } catch (error) {
    console.error('❌ Error cargando ofertas:', error);
    offers = [];
  }
}

// Apply offers to products
function applyOffersToProducts() {
  console.log('🏷️ Aplicando ofertas a productos...');

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

  console.log('✅ Ofertas aplicadas');

  // Actualizar badges de categorías después de aplicar ofertas
  updateCategoryBadges();
}

// Calculate product price with offers
function calculateProductPrice(product) {
  // Usar siempre basePrice como precio original
  const basePrice = product.basePrice || product.price;
  let finalPrice = basePrice;
  let appliedOffer = null;

  console.log(`🔍 Calculando precio para ${product.name}:`);
  console.log(`   Base: $${basePrice}, Category: ${product.category}, ID: ${product.id}`);

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

  console.log(`   Ofertas de producto: ${productOffers.length}`);
  console.log(`   Ofertas de categoría: ${categoryOffers.length}`);

  // Apply offer with highest priority
  if (productOffers.length > 0) {
    // Individual offers have priority
    appliedOffer = productOffers.sort((a, b) => b.priority - a.priority)[0];
    finalPrice = applyOfferToPrice(basePrice, appliedOffer);
    console.log(`   ✅ Oferta de producto aplicada: ${appliedOffer.name}`);
  } else if (categoryOffers.length > 0) {
    // Category offers
    appliedOffer = categoryOffers.sort((a, b) => b.priority - a.priority)[0];
    finalPrice = applyOfferToPrice(basePrice, appliedOffer);
    console.log(`   ✅ Oferta de categoría aplicada: ${appliedOffer.name}`);
  } else {
    console.log(`   ❌ No se aplicaron ofertas`);
  }

  // Round price
  finalPrice = Math.round(finalPrice);

  const result = {
    finalPrice: finalPrice,
    appliedOffer: appliedOffer,
    basePrice: basePrice,
    discountPercentage: appliedOffer ? calculateDiscountPercentage(basePrice, finalPrice) : 0
  };

  console.log(`   Resultado: $${result.finalPrice} (descuento: ${result.discountPercentage}%)`);

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
  console.log('🧪 Probando sistema de precios...');

  if (Object.keys(catalogData).length === 0) {
    console.log('❌ No hay datos cargados');
    return;
  }

  console.log(`📦 Catálogo cargado: ${Object.keys(catalogData).length} categorías`);
  console.log(`🏷️ Ofertas cargadas: ${offers.length}`);

  // Mostrar ofertas disponibles
  if (offers.length > 0) {
    console.log('\n📋 Ofertas disponibles:');
    offers.forEach(offer => {
      console.log(`   - ${offer.name} (${offer.targetType}: ${offer.targetId})`);
      console.log(`     Tipo: ${offer.type}, Valor: ${offer.value}`); // Cambiado a type y value
      console.log(`     Activa: ${offer.isActive}, Válida: ${isOfferValid(offer)}`);
    });
  }

  // Mostrar productos con precios
  Object.keys(catalogData).forEach(categoryId => {
    const category = catalogData[categoryId];
    console.log(`\n📂 ${categoryId} (${category.title}):`);

    category.products.forEach(product => {
      const hasDiscount = product.appliedOffer !== null;
      console.log(`   ${hasDiscount ? '🏷️' : '💰'} ${product.name}:`);
      console.log(`      ID: ${product.id}`);
      console.log(`      Categoría: ${product.category}`);
      console.log(`      Precio base: $${product.basePrice}`);
      console.log(`      Precio final: $${product.price}`);
      if (hasDiscount) {
        console.log(`      Descuento: ${product.discountPercentage}% (${product.appliedOffer.name})`);
        console.log(`      Oferta aplicada:`, product.appliedOffer);
      } else {
        console.log(`      Sin descuento aplicado`);
      }
    });
  });

  console.log('\n✅ Prueba completada');
}

// Hacer la función disponible globalmente para pruebas
window.testPricingSystem = testPricingSystem;

// Load catalog data from Firebase
async function loadCatalogData() {
  try {
    console.log('🔄 Cargando catálogo desde Firebase...');

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

        console.log(`📦 Producto cargado: ${product.name} - Base: $${product.basePrice}, Current: $${product.currentPrice}, Category: ${categoryId}`);

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
    console.log('✅ Catálogo cargado desde Firebase:', Object.keys(catalogData));

    // Log de precios para verificar
    Object.keys(catalogData).forEach(categoryId => {
      const category = categories[categoryId];
      console.log(`📦 ${categoryId}: ${category.products.length} productos`);
      category.products.forEach(product => {
        console.log(`   - ${product.name}: $${product.price} (base: $${product.basePrice})`);
      });
    });

    // Aplicar ofertas si ya están cargadas
    if (offers.length > 0) {
      applyOffersToProducts();
    }

    // Actualizar badges de categorías con ofertas
    updateCategoryBadges();

    // Actualizar imágenes de servicios después de cargar datos
    if (typeof setRandomServiceImages === 'function') {
      setRandomServiceImages();
    }
  } catch (error) {
    console.error('❌ Error cargando catálogo:', error);
  }
}

// Wait for Firebase scripts to load
firebaseScript.onload = () => {
  firestoreScript.onload = initializeFirebase;
};

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

    // Esperar a que Firebase cargue antes de inicializar las imágenes de servicios
    const checkFirebaseReady = setInterval(() => {
        if (db && Object.keys(catalogData).length > 0) {
            clearInterval(checkFirebaseReady);
            console.log('✅ Firebase listo, inicializando imágenes de servicios...');
            setRandomServiceImages();
            startServiceImagesRotation();
        }
    }, 500);

    // Timeout después de 10 segundos
    setTimeout(() => {
        clearInterval(checkFirebaseReady);
        if (Object.keys(catalogData).length === 0) {
            console.log('⚠️ Timeout esperando Firebase, usando fallback...');
            setRandomServiceImages();
            startServiceImagesRotation();
        }
    }, 10000);
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
    // Verificar si hay datos cargados
    if (!catalogData || Object.keys(catalogData).length === 0) {
        console.log('⏳ Esperando datos de Firebase para getCategoryImages');
        return [];
    }

    const categoryData = catalogData[category];
    if (!categoryData) {
        console.log(`❌ Categoría ${category} no encontrada`);
        return [];
    }

    console.log(`🔍 Analizando categoría ${category}:`);
    console.log(`   Tipo: ${categoryData.type}`);
    console.log(`   Productos directos: ${categoryData.products ? categoryData.products.length : 0}`);
    console.log(`   Secciones: ${categoryData.sections ? categoryData.sections.length : 0}`);

    let images = [];

    if (categoryData.type === 'sections' && categoryData.sections) {
        // Para categorías tipo sections (individuales), obtener productos de todas las secciones
        const allProducts = categoryData.sections.flatMap(section => section.products);
        images = allProducts
            .filter(product => product.images && product.images.length > 0)
            .map(product => product.images[0]);
        console.log(`   ✅ Usando imágenes de secciones: ${images.length} imágenes de ${allProducts.length} productos`);
    } else if (categoryData.products && categoryData.products.length > 0) {
        // Para categorías normales y slideshow, usar las imágenes de todos los productos
        images = categoryData.products
            .filter(product => product.images && product.images.length > 0)
            .flatMap(product => product.images); // Usar flatMap para obtener todas las imágenes de cada producto
        console.log(`   ✅ Usando imágenes de productos: ${images.length} imágenes de ${categoryData.products.length} productos`);
    } else {
        console.log(`   ❌ No se encontraron imágenes para esta categoría`);
    }

    console.log(`   📷 Total de imágenes: ${images.length}`);
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

        console.log('✅ Pedido guardado en Firebase:', orderId);

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
        console.log('⏳ Esperando carga de datos de Firebase...');
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
                    <div class="product-price">
                        ${product.appliedOffer ? `
                            <span class="original-price">$${product.basePrice}</span>
                            <span class="discounted-price">$${product.price}</span>
                            <span class="discount-badge">-${product.discountPercentage}%</span>
                        ` : `$${product.price}`}
                    </div>
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
                        <img src="${product.images && product.images.length > 0 ? product.images[0] : ''}" alt="${product.name}" class="product-image-img">
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-description">${product.description}</p>
                        <div class="product-price">
                            ${product.appliedOffer ? `
                                <span class="original-price">$${product.basePrice}</span>
                                <span class="discounted-price">$${product.price}</span>
                                <span class="discount-badge">-${product.discountPercentage}%</span>
                            ` : `$${product.price}`}
                        </div>
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

                const imageContent = product.images && product.images.length > 0
                    ? `<img src="${product.images[0]}" alt="${product.name}" class="product-image-img">`
                    : `<span>${product.emoji}</span>`;

                productCard.innerHTML = `
                    <div class="product-image">
                        ${imageContent}
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-description">${product.description}</p>
                        <div class="product-price">
                            ${product.appliedOffer ? `
                                <span class="original-price">$${product.basePrice}</span>
                                <span class="discounted-price">$${product.price}</span>
                                <span class="discount-badge">-${product.discountPercentage}%</span>
                            ` : `$${product.price}`}
                        </div>
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
            const imageContent = product.images && product.images.length > 0
                ? `<img src="${product.images[0]}" alt="${product.name}" class="product-image-img">`
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