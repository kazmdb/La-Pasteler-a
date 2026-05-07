# API Documentation - La Pastelería Admin System

## Base URL
```
https://tu-proyecto.firebaseio.com
```

## Authentication
Todas las solicitudes requieren autenticación mediante token de sesión.

### Headers
```
Authorization: Bearer <session_token>
Content-Type: application/json
```

## Endpoints

### Productos

#### GET /products
Obtener todos los productos.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod1",
      "name": "Cheesecake Entero",
      "description": "Delicioso cheesecake artesanal",
      "category": "postres",
      "basePrice": 1200,
      "currentPrice": 1200,
      "images": ["cheesecake.webp"],
      "isActive": true,
      "createdAt": "2026-05-07T10:00:00Z",
      "updatedAt": "2026-05-07T10:00:00Z"
    }
  ]
}
```

#### GET /products/:id
Obtener un producto específico.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "prod1",
    "name": "Cheesecake Entero",
    "description": "Delicioso cheesecake artesanal",
    "category": "postres",
    "basePrice": 1200,
    "currentPrice": 1200,
    "images": ["cheesecake.webp"],
    "isActive": true,
    "createdAt": "2026-05-07T10:00:00Z",
    "updatedAt": "2026-05-07T10:00:00Z"
  }
}
```

#### POST /products
Crear un nuevo producto.

**Request Body:**
```json
{
  "name": "Nuevo Producto",
  "description": "Descripción del producto",
  "category": "postres",
  "basePrice": 1500,
  "images": ["imagen1.webp", "imagen2.webp"],
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "prod_new_id",
    "name": "Nuevo Producto",
    "description": "Descripción del producto",
    "category": "postres",
    "basePrice": 1500,
    "currentPrice": 1500,
    "images": ["imagen1.webp", "imagen2.webp"],
    "isActive": true,
    "createdAt": "2026-05-07T10:00:00Z",
    "updatedAt": "2026-05-07T10:00:00Z"
  }
}
```

#### PUT /products/:id
Actualizar un producto existente.

**Request Body:**
```json
{
  "name": "Producto Actualizado",
  "description": "Nueva descripción",
  "category": "postres",
  "basePrice": 1600,
  "images": ["imagen1.webp"],
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "prod1",
    "name": "Producto Actualizado",
    "description": "Nueva descripción",
    "category": "postres",
    "basePrice": 1600,
    "currentPrice": 1600,
    "images": ["imagen1.webp"],
    "isActive": true,
    "updatedAt": "2026-05-07T11:00:00Z"
  }
}
```

#### DELETE /products/:id
Eliminar un producto.

**Response:**
```json
{
  "success": true,
  "message": "Producto eliminado correctamente"
}
```

#### GET /products/:id/price
Obtener el precio calculado de un producto (con ofertas aplicadas).

**Response:**
```json
{
  "success": true,
  "data": {
    "productId": "prod1",
    "basePrice": 1200,
    "finalPrice": 960,
    "discountPercentage": 20,
    "appliedOffer": {
      "id": "offer1",
      "name": "Oferta Especial",
      "type": "percentage",
      "value": 20,
      "targetType": "product",
      "targetId": "prod1"
    }
  }
}
```

#### PUT /products/:id/base-price
Actualizar el precio base de un producto.

**Request Body:**
```json
{
  "basePrice": 1500
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "prod1",
    "basePrice": 1500,
    "currentPrice": 1500,
    "updatedAt": "2026-05-07T11:00:00Z"
  }
}
```

### Categorías

#### GET /categories
Obtener todas las categorías.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "postres",
      "name": "Postres Enteros",
      "description": "Postres artesanales en tamaño familiar",
      "isActive": true,
      "order": 1
    }
  ]
}
```

#### POST /categories
Crear una nueva categoría.

**Request Body:**
```json
{
  "name": "Nueva Categoría",
  "description": "Descripción de la categoría",
  "order": 4,
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "nueva-categoria",
    "name": "Nueva Categoría",
    "description": "Descripción de la categoría",
    "order": 4,
    "isActive": true
  }
}
```

#### PUT /categories/:id
Actualizar una categoría.

**Request Body:**
```json
{
  "name": "Categoría Actualizada",
  "description": "Nueva descripción",
  "order": 4,
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "nueva-categoria",
    "name": "Categoría Actualizada",
    "description": "Nueva descripción",
    "order": 4,
    "isActive": true
  }
}
```

#### DELETE /categories/:id
Eliminar una categoría.

**Response:**
```json
{
  "success": true,
  "message": "Categoría eliminada correctamente"
}
```

#### GET /categories/:id/products/prices
Obtener los precios de todos los productos de una categoría.

**Response:**
```json
{
  "success": true,
  "data": {
    "categoryId": "postres",
    "categoryName": "Postres Enteros",
    "products": [
      {
        "id": "prod1",
        "name": "Cheesecake Entero",
        "basePrice": 1200,
        "finalPrice": 960,
        "discountPercentage": 20
      }
    ]
  }
}
```

### Ofertas

#### GET /offers
Obtener todas las ofertas.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "offer1",
      "name": "Oferta Especial",
      "type": "percentage",
      "value": 20,
      "targetType": "product",
      "targetId": "prod1",
      "isActive": true,
      "startDate": "2026-05-07T00:00:00Z",
      "endDate": "2026-05-14T23:59:59Z",
      "priority": 2,
      "createdAt": "2026-05-07T10:00:00Z"
    }
  ]
}
```

#### GET /offers/active
Obtener solo las ofertas activas.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "offer1",
      "name": "Oferta Especial",
      "type": "percentage",
      "value": 20,
      "targetType": "product",
      "targetId": "prod1",
      "isActive": true,
      "startDate": "2026-05-07T00:00:00Z",
      "endDate": "2026-05-14T23:59:59Z",
      "priority": 2
    }
  ]
}
```

#### POST /offers
Crear una nueva oferta.

**Request Body:**
```json
{
  "name": "Nueva Oferta",
  "type": "percentage",
  "value": 15,
  "targetType": "category",
  "targetId": "postres",
  "startDate": "2026-05-07T00:00:00Z",
  "endDate": "2026-05-14T23:59:59Z",
  "priority": 1,
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "offer_new_id",
    "name": "Nueva Oferta",
    "type": "percentage",
    "value": 15,
    "targetType": "category",
    "targetId": "postres",
    "isActive": true,
    "startDate": "2026-05-07T00:00:00Z",
    "endDate": "2026-05-14T23:59:59Z",
    "priority": 1,
    "createdAt": "2026-05-07T10:00:00Z"
  }
}
```

#### PUT /offers/:id
Actualizar una oferta existente.

**Request Body:**
```json
{
  "name": "Oferta Actualizada",
  "type": "percentage",
  "value": 25,
  "targetType": "category",
  "targetId": "postres",
  "startDate": "2026-05-07T00:00:00Z",
  "endDate": "2026-05-14T23:59:59Z",
  "priority": 1,
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "offer1",
    "name": "Oferta Actualizada",
    "type": "percentage",
    "value": 25,
    "targetType": "category",
    "targetId": "postres",
    "isActive": true,
    "startDate": "2026-05-07T00:00:00Z",
    "endDate": "2026-05-14T23:59:59Z",
    "priority": 1,
    "updatedAt": "2026-05-07T11:00:00Z"
  }
}
```

#### DELETE /offers/:id
Eliminar una oferta.

**Response:**
```json
{
  "success": true,
  "message": "Oferta eliminada correctamente"
}
```

### Autenticación

#### POST /admin/login
Iniciar sesión de administrador.

**Request Body:**
```json
{
  "password": "contraseña_segura"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "session_token_here",
    "user": {
      "email": "admin@lapasteleria.com",
      "role": "admin"
    },
    "expiresAt": "2026-05-07T11:00:00Z"
  }
}
```

#### POST /admin/logout
Cerrar sesión de administrador.

**Response:**
```json
{
  "success": true,
  "message": "Sesión cerrada correctamente"
}
```

#### GET /admin/session
Verificar sesión activa.

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "user": {
      "email": "admin@lapasteleria.com",
      "role": "admin"
    },
    "expiresAt": "2026-05-07T11:00:00Z"
  }
}
```

### Configuración

#### GET /settings
Obtener configuración del sistema.

**Response:**
```json
{
  "success": true,
  "data": {
    "pricing": {
      "defaultPriority": "individual",
      "currency": "UYU",
      "roundTo": 10
    },
    "admin": {
      "sessionTimeout": 3600
    }
  }
}
```

#### PUT /settings
Actualizar configuración del sistema.

**Request Body:**
```json
{
  "pricing": {
    "defaultPriority": "individual",
    "currency": "UYU",
    "roundTo": 10
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pricing": {
      "defaultPriority": "individual",
      "currency": "UYU",
      "roundTo": 10
    },
    "updatedAt": "2026-05-07T11:00:00Z"
  }
}
```

## Códigos de Estado HTTP

- `200 OK` - Solicitud exitosa
- `201 Created` - Recurso creado exitosamente
- `400 Bad Request` - Solicitud inválida
- `401 Unauthorized` - No autenticado
- `403 Forbidden` - Sin permisos
- `404 Not Found` - Recurso no encontrado
- `500 Internal Server Error` - Error del servidor

## Errores

### Formato de Error
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descripción del error",
    "details": {}
  }
}
```

### Códigos de Error Comunes

- `AUTH_REQUIRED` - Autenticación requerida
- `INVALID_CREDENTIALS` - Credenciales inválidas
- `SESSION_EXPIRED` - Sesión expirada
- `VALIDATION_ERROR` - Error de validación
- `NOT_FOUND` - Recurso no encontrado
- `CONFLICT` - Conflicto con datos existentes
- `INTERNAL_ERROR` - Error interno del servidor

## Rate Limiting

- **Límite**: 100 solicitudes por minuto por IP
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Webhooks

### Eventos Disponibles

- `product.created` - Nuevo producto creado
- `product.updated` - Producto actualizado
- `product.deleted` - Producto eliminado
- `offer.created` - Nueva oferta creada
- `offer.updated` - Oferta actualizada
- `offer.deleted` - Oferta eliminada

### Configurar Webhook

**POST /webhooks**
```json
{
  "url": "https://tu-sistema.com/webhook",
  "events": ["product.created", "offer.created"],
  "secret": "webhook_secret_here"
}
```

## Ejemplos de Uso

### Calcular Precio con Ofertas

```javascript
// Obtener precio calculado
fetch('/api/products/prod1/price', {
  headers: {
    'Authorization': 'Bearer <token>'
  }
})
.then(response => response.json())
.then(data => {
  console.log('Precio base:', data.data.basePrice);
  console.log('Precio final:', data.data.finalPrice);
  console.log('Descuento:', data.data.discountPercentage + '%');
});
```

### Crear Oferta por Categoría

```javascript
fetch('/api/offers', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Oferta Postres',
    type: 'percentage',
    value: 20,
    targetType: 'category',
    targetId: 'postres',
    startDate: '2026-05-07T00:00:00Z',
    endDate: '2026-05-14T23:59:59Z',
    priority: 1,
    isActive: true
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

### Actualizar Precio Base

```javascript
fetch('/api/products/prod1/base-price', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    basePrice: 1500
  })
})
.then(response => response.json())
.then(data => console.log(data));
```