# Sistema de Administración - Estructura de Base de Datos

## Estructura de Base de Datos Firebase

### 1. Colección `products`
```json
{
  "products": {
    "product_id_1": {
      "id": "product_id_1",
      "name": "Cheesecake Entero",
      "description": "Delicioso cheesecake artesanal con base de galleta",
      "category": "postres",
      "basePrice": 1200,
      "currentPrice": 1200,
      "images": ["cheesecake.webp", "cheesecake2.webp"],
      "isActive": true,
      "createdAt": "2026-05-07T10:00:00Z",
      "updatedAt": "2026-05-07T10:00:00Z"
    },
    "product_id_2": {
      "id": "product_id_2",
      "name": "Chajá Entero",
      "description": "Clásico chajá uruguayo con merengue italiano",
      "category": "postres",
      "basePrice": 1000,
      "currentPrice": 800,
      "images": ["chaja.webp"],
      "isActive": true,
      "createdAt": "2026-05-07T10:00:00Z",
      "updatedAt": "2026-05-07T10:00:00Z"
    }
  }
}
```

### 2. Colección `categories`
```json
{
  "categories": {
    "postres": {
      "id": "postres",
      "name": "Postres Enteros",
      "description": "Postres artesanales en tamaño familiar",
      "isActive": true,
      "order": 1
    },
    "budines": {
      "id": "budines",
      "name": "Budines",
      "description": "Budines artesanales variados",
      "isActive": true,
      "order": 2
    }
  }
}
```

### 3. Colección `offers`
```json
{
  "offers": {
    "offer_id_1": {
      "id": "offer_id_1",
      "name": "Oferta Semana del Postre",
      "type": "percentage",
      "value": 20,
      "targetType": "category",
      "targetId": "postres",
      "isActive": true,
      "startDate": "2026-05-07T00:00:00Z",
      "endDate": "2026-05-14T23:59:59Z",
      "priority": 1,
      "createdAt": "2026-05-07T10:00:00Z"
    },
    "offer_id_2": {
      "id": "offer_id_2",
      "name": "Cheesecake Especial",
      "type": "fixed",
      "value": 900,
      "targetType": "product",
      "targetId": "product_id_1",
      "isActive": true,
      "startDate": "2026-05-07T00:00:00Z",
      "endDate": "2026-05-10T23:59:59Z",
      "priority": 2,
      "createdAt": "2026-05-07T10:00:00Z"
    }
  }
}
```

### 4. Colección `settings`
```json
{
  "settings": {
    "pricing": {
      "defaultPriority": "individual",
      "taxRate": 0,
      "currency": "UYU",
      "roundTo": 10
    },
    "admin": {
      "passwordHash": "hashed_password_here",
      "sessionTimeout": 3600
    }
  }
}
```

## Lógica de Prioridad de Ofertas

### Reglas de Prioridad
1. **Ofertas individuales (priority: 2)**: Tienen mayor prioridad
2. **Ofertas por categoría (priority: 1)**: Tienen menor prioridad
3. **Precio base**: Se usa cuando no hay ofertas activas

### Algoritmo de Cálculo de Precio

```javascript
function calculateFinalPrice(product, activeOffers) {
  let finalPrice = product.basePrice;
  let appliedOffer = null;

  // Filtrar ofertas activas para este producto
  const productOffers = activeOffers.filter(offer => 
    offer.targetType === 'product' && 
    offer.targetId === product.id &&
    offer.isActive &&
    isOfferValid(offer)
  );

  const categoryOffers = activeOffers.filter(offer =>
    offer.targetType === 'category' &&
    offer.targetId === product.category &&
    offer.isActive &&
    isOfferValid(offer)
  );

  // Aplicar oferta con mayor prioridad
  if (productOffers.length > 0) {
    // Oferta individual tiene prioridad
    appliedOffer = productOffers.sort((a, b) => b.priority - a.priority)[0];
    finalPrice = applyOffer(product.basePrice, appliedOffer);
  } else if (categoryOffers.length > 0) {
    // Oferta por categoría
    appliedOffer = categoryOffers.sort((a, b) => b.priority - a.priority)[0];
    finalPrice = applyOffer(product.basePrice, appliedOffer);
  }

  return {
    finalPrice: finalPrice,
    appliedOffer: appliedOffer,
    basePrice: product.basePrice,
    discountPercentage: appliedOffer ? 
      (product.basePrice - finalPrice) / product.basePrice * 100 : 0
  };
}

function applyOffer(basePrice, offer) {
  if (offer.type === 'percentage') {
    return basePrice * (1 - offer.value / 100);
  } else if (offer.type === 'fixed') {
    return offer.value;
  }
  return basePrice;
}

function isOfferValid(offer) {
  const now = new Date();
  const startDate = new Date(offer.startDate);
  const endDate = new Date(offer.endDate);
  return now >= startDate && now <= endDate;
}
```

## Endpoints de API

### Productos
- `GET /api/products` - Obtener todos los productos
- `GET /api/products/:id` - Obtener un producto específico
- `POST /api/products` - Crear nuevo producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto

### Categorías
- `GET /api/categories` - Obtener todas las categorías
- `POST /api/categories` - Crear nueva categoría
- `PUT /api/categories/:id` - Actualizar categoría
- `DELETE /api/categories/:id` - Eliminar categoría

### Ofertas
- `GET /api/offers` - Obtener todas las ofertas
- `GET /api/offers/active` - Obtener ofertas activas
- `POST /api/offers` - Crear nueva oferta
- `PUT /api/offers/:id` - Actualizar oferta
- `DELETE /api/offers/:id` - Eliminar oferta

### Precios
- `GET /api/products/:id/price` - Obtener precio calculado de un producto
- `PUT /api/products/:id/base-price` - Actualizar precio base
- `GET /api/categories/:id/products/prices` - Obtener precios de productos de una categoría

### Autenticación
- `POST /api/admin/login` - Iniciar sesión
- `POST /api/admin/logout` - Cerrar sesión
- `GET /api/admin/session` - Verificar sesión