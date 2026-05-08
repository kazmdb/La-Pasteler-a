# Integración de Pedidos - La Pastelería

## 📋 Descripción

Este documento explica cómo integrar la funcionalidad de pedidos en la web principal de La Pastelería para que los clientes puedan realizar pedidos que se registren automáticamente en el panel de administración.

## 🔗 Estructura de Datos de Pedidos

### Objeto de Pedido

```javascript
{
  id: "order_1234567890",                    // ID único del pedido
  fecha: "2026-05-07T14:30:00.000Z",       // Fecha y hora del pedido
  cliente: {
    nombre: "Juan Pérez",                   // Nombre del cliente
    telefono: "+598 99 123 456",            // Teléfono de contacto
    email: "juan@email.com"                 // Email del cliente
  },
  estado: "pendiente",                      // Estado del pedido
  total: 1250,                             // Total del pedido en pesos
  items: [                                 // Lista de productos
    {
      productoId: "prod_1",                // ID del producto
      nombre: "Torta de Chocolate",         // Nombre del producto
      cantidad: 2,                         // Cantidad solicitada
      precio: 500,                         // Precio unitario
      subtotal: 1000                       // Subtotal (cantidad × precio)
    }
  ],
  metodoPago: "efectivo",                  // Método de pago
  direccion: "Calle 123, Montevideo",      // Dirección de entrega
  notas: "Sin frutos secos"                // Notas adicionales
}
```

### Estados de Pedido

- `pendiente`: Pedido recibido, aún no procesado
- `en_preparacion`: Pedido en preparación
- `entregado`: Pedido entregado al cliente
- `cancelado`: Pedido cancelado

### Métodos de Pago

- `efectivo`: Pago en efectivo
- `tarjeta`: Pago con tarjeta de crédito/débito
- `transferencia`: Transferencia bancaria

## 🚀 Integración en la Web Principal

### Paso 1: Incluir Firebase SDK

Agrega los scripts de Firebase en tu archivo HTML principal:

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
<script src="firebase-config.js"></script>
```

### Paso 2: Crear Formulario de Pedido

```html
<form id="order-form" class="order-form">
    <!-- Información del Cliente -->
    <div class="form-section">
        <h3>👤 Información del Cliente</h3>
        <div class="form-group">
            <label for="customer-name">Nombre Completo *</label>
            <input type="text" id="customer-name" name="customerName" required>
        </div>
        <div class="form-group">
            <label for="customer-phone">Teléfono *</label>
            <input type="tel" id="customer-phone" name="customerPhone" required>
        </div>
        <div class="form-group">
            <label for="customer-email">Email *</label>
            <input type="email" id="customer-email" name="customerEmail" required>
        </div>
    </div>

    <!-- Dirección de Entrega -->
    <div class="form-section">
        <h3>📍 Dirección de Entrega</h3>
        <div class="form-group">
            <label for="delivery-address">Dirección *</label>
            <input type="text" id="delivery-address" name="deliveryAddress" required>
        </div>
    </div>

    <!-- Carrito de Productos -->
    <div class="form-section">
        <h3>🛒 Productos</h3>
        <div id="cart-items">
            <!-- Los items del carrito se agregan dinámicamente -->
        </div>
        <div class="cart-total">
            <strong>Total: $<span id="cart-total">0</span></strong>
        </div>
    </div>

    <!-- Método de Pago -->
    <div class="form-section">
        <h3>💳 Método de Pago</h3>
        <div class="form-group">
            <label for="payment-method">Seleccionar método *</label>
            <select id="payment-method" name="paymentMethod" required>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
            </select>
        </div>
    </div>

    <!-- Notas Adicionales -->
    <div class="form-section">
        <h3>📝 Notas Adicionales</h3>
        <div class="form-group">
            <label for="order-notes">Notas (opcional)</label>
            <textarea id="order-notes" name="orderNotes" rows="3"></textarea>
        </div>
    </div>

    <!-- Botón de Envío -->
    <button type="submit" class="btn-submit">
        🛒 Realizar Pedido
    </button>
</form>
```

### Paso 3: Implementar Lógica de JavaScript

```javascript
// Sistema de Pedidos - La Pastelería

class OrderSystem {
    constructor() {
        this.cart = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadProducts();
    }

    setupEventListeners() {
        // Formulario de pedido
        document.getElementById('order-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitOrder();
        });
    }

    // Agregar producto al carrito
    addToCart(product) {
        const existingItem = this.cart.find(item => item.productoId === product.id);

        if (existingItem) {
            existingItem.cantidad++;
            existingItem.subtotal = existingItem.cantidad * existingItem.precio;
        } else {
            this.cart.push({
                productoId: product.id,
                nombre: product.name,
                cantidad: 1,
                precio: product.price,
                subtotal: product.price
            });
        }

        this.updateCartUI();
    }

    // Eliminar producto del carrito
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.productoId !== productId);
        this.updateCartUI();
    }

    // Actualizar cantidad de producto
    updateQuantity(productId, newQuantity) {
        const item = this.cart.find(item => item.productoId === productId);

        if (item) {
            if (newQuantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.cantidad = newQuantity;
                item.subtotal = item.cantidad * item.precio;
                this.updateCartUI();
            }
        }
    }

    // Calcular total del carrito
    calculateTotal() {
        return this.cart.reduce((total, item) => total + item.subtotal, 0);
    }

    // Actualizar interfaz del carrito
    updateCartUI() {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotalElement = document.getElementById('cart-total');

        // Mostrar items del carrito
        cartItemsContainer.innerHTML = this.cart.map(item => `
            <div class="cart-item" data-product-id="${item.productoId}">
                <div class="cart-item-info">
                    <strong>${item.nombre}</strong>
                    <span>$${item.precio} c/u</span>
                </div>
                <div class="cart-item-controls">
                    <button type="button" class="btn-quantity" onclick="orderSystem.updateQuantity('${item.productoId}', ${item.cantidad - 1})">-</button>
                    <span class="quantity">${item.cantidad}</span>
                    <button type="button" class="btn-quantity" onclick="orderSystem.updateQuantity('${item.productoId}', ${item.cantidad + 1})">+</button>
                </div>
                <div class="cart-item-subtotal">
                    <strong>$${item.subtotal}</strong>
                </div>
                <button type="button" class="btn-remove" onclick="orderSystem.removeFromCart('${item.productoId}')">✕</button>
            </div>
        `).join('');

        // Actualizar total
        cartTotalElement.textContent = this.calculateTotal();
    }

    // Enviar pedido a Firebase
    async submitOrder() {
        if (this.cart.length === 0) {
            alert('El carrito está vacío. Agrega productos antes de realizar el pedido.');
            return;
        }

        try {
            // Recopilar datos del formulario
            const orderData = {
                cliente: {
                    nombre: document.getElementById('customer-name').value,
                    telefono: document.getElementById('customer-phone').value,
                    email: document.getElementById('customer-email').value
                },
                direccion: document.getElementById('delivery-address').value,
                metodoPago: document.getElementById('payment-method').value,
                notas: document.getElementById('order-notes').value,
                items: [...this.cart],
                total: this.calculateTotal()
            };

            // Mostrar indicador de carga
            const submitButton = document.querySelector('.btn-submit');
            submitButton.disabled = true;
            submitButton.textContent = '🔄 Procesando pedido...';

            // Crear pedido en Firebase
            const result = await AdminPanel.createOrder(orderData);

            if (result.success) {
                // Pedido exitoso
                alert(`✅ Pedido realizado exitosamente!\n\nID del pedido: ${result.orderId}\nTotal: $${orderData.total}\n\nTe contactaremos pronto para confirmar tu pedido.`);

                // Limpiar formulario y carrito
                document.getElementById('order-form').reset();
                this.cart = [];
                this.updateCartUI();

            } else {
                // Error al crear pedido
                alert(`❌ Error al realizar el pedido: ${result.error}`);
            }

        } catch (error) {
            console.error('Error submitting order:', error);
            alert('❌ Error al procesar el pedido. Por favor, intenta nuevamente.');

        } finally {
            // Restaurar botón
            const submitButton = document.querySelector('.btn-submit');
            submitButton.disabled = false;
            submitButton.textContent = '🛒 Realizar Pedido';
        }
    }

    // Cargar productos disponibles
    async loadProducts() {
        try {
            const snapshot = await db.collection('products').get();
            this.products = snapshot.docs.map(doc => doc.data());
            console.log(`📦 ${this.products.length} productos cargados`);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }
}

// Inicializar sistema de pedidos
const orderSystem = new OrderSystem();
```

### Paso 4: Botones de Agregar al Carrito

En cada tarjeta de producto, agrega un botón para agregar al carrito:

```html
<div class="product-card">
    <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
    <div class="product-info">
        <h3>${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <p class="product-price">$${product.price}</p>
        <button class="btn-add-to-cart" onclick="orderSystem.addToCart({
            id: '${product.id}',
            name: '${product.name}',
            price: ${product.price}
        })">
            🛒 Agregar al Carrito
        </button>
    </div>
</div>
```

## 🔧 Funciones de API Disponibles

### Crear Pedido

```javascript
// Método estático para crear pedidos
const result = await AdminPanel.createOrder(orderData);

// Resultado:
{
    success: true,        // Indica si el pedido fue creado exitosamente
    orderId: "order_123"  // ID del pedido creado
}
```

### Ejemplo Completo de Uso

```javascript
// Ejemplo de cómo crear un pedido desde la web
async function createSampleOrder() {
    const orderData = {
        cliente: {
            nombre: 'María García',
            telefono: '+598 99 123 456',
            email: 'maria@email.com'
        },
        direccion: 'Calle 123, Montevideo',
        metodoPago: 'efectivo',
        notas: 'Entrega preferiblemente en la tarde',
        items: [
            {
                productoId: 'prod_1',
                nombre: 'Torta de Chocolate',
                cantidad: 2,
                precio: 500,
                subtotal: 1000
            },
            {
                productoId: 'prod_2',
                nombre: 'Cupcakes Vainilla',
                cantidad: 6,
                precio: 50,
                subtotal: 300
            }
        ],
        total: 1300
    };

    const result = await AdminPanel.createOrder(orderData);

    if (result.success) {
        console.log('Pedido creado:', result.orderId);
        alert('¡Pedido realizado exitosamente!');
    } else {
        console.error('Error:', result.error);
        alert('Error al realizar el pedido');
    }
}
```

## 🎨 Estilos Sugeridos

```css
/* Estilos para el formulario de pedido */
.order-form {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

.form-section {
    margin-bottom: 30px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 10px;
}

.form-section h3 {
    margin-bottom: 15px;
    color: #333;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 600;
    color: #555;
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
}

/* Estilos del carrito */
.cart-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    margin-bottom: 10px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.cart-item-info {
    flex: 1;
}

.cart-item-controls {
    display: flex;
    align-items: center;
    gap: 10px;
}

.btn-quantity {
    width: 30px;
    height: 30px;
    border: 1px solid #ddd;
    background: white;
    border-radius: 5px;
    cursor: pointer;
}

.btn-remove {
    background: #ff4757;
    color: white;
    border: none;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    cursor: pointer;
}

.cart-total {
    text-align: right;
    font-size: 1.5rem;
    font-weight: bold;
    color: #e91e63;
    margin-top: 20px;
}

.btn-submit {
    width: 100%;
    padding: 15px;
    background: linear-gradient(135deg, #e91e63 0%, #ff6b9d 100%);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 1.1rem;
    font-weight: bold;
    cursor: pointer;
    transition: transform 0.3s ease;
}

.btn-submit:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(233, 30, 99, 0.3);
}

.btn-submit:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
}
```

## 📱 Consideraciones Móviles

- Asegúrate de que el formulario sea responsive
- Usa inputs de tipo `tel` para teléfonos (muestra teclado numérico en móviles)
- Implementa validación de campos en tiempo real
- Considera agregar autocompletado para direcciones
- Optimiza el tamaño de los botones para touch (mínimo 44px)

## 🔒 Seguridad

- Valida todos los datos del lado del servidor
- Implementa rate limiting para prevenir spam de pedidos
- Considera agregar CAPTCHA para formularios públicos
- Usa HTTPS para todas las comunicaciones
- Implementa autenticación si es necesario

## 📞 Soporte

Para cualquier pregunta o problema con la integración de pedidos, consulta la documentación de Firebase Firestore o contacta al equipo de desarrollo.

---

**Última actualización:** 2026-05-07
**Versión:** 1.0.0