// Script de inicialización para la colección de pedidos
// Este script crea la estructura de base de datos para pedidos en Firebase

// Importar configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBo5jBsKvQTP7rTy8GYXbs7YlA1nD_7A3s",
  authDomain: "la-pasteleria-b2b83.firebaseapp.com",
  projectId: "la-pasteleria-b2b83",
  storageBucket: "la-pasteleria-b2b83.firebasestorage.app",
  messagingSenderId: "747582851026",
  appId: "1:747582851026:web:caf908805814fc82492a0b",
  measurementId: "G-6FZ21G8Q6X"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Función para crear pedidos de ejemplo
async function initializeOrders() {
  console.log('🚀 Inicializando colección de pedidos...');

  try {
    // Pedidos de ejemplo
    const sampleOrders = [
      {
        id: 'order_' + Date.now() + '_1',
        fecha: new Date(Date.now() - 86400000).toISOString(), // Ayer
        cliente: {
          nombre: 'María García',
          telefono: '+598 99 123 456',
          email: 'maria.garcia@email.com'
        },
        estado: 'pendiente',
        total: 1250,
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
            cantidad: 5,
            precio: 50,
            subtotal: 250
          }
        ],
        metodoPago: 'efectivo',
        direccion: 'Calle 123, Montevideo',
        notas: 'Sin frutos secos'
      },
      {
        id: 'order_' + Date.now() + '_2',
        fecha: new Date(Date.now() - 172800000).toISOString(), // Hace 2 días
        cliente: {
          nombre: 'Juan Pérez',
          telefono: '+598 99 987 654',
          email: 'juan.perez@email.com'
        },
        estado: 'en_preparacion',
        total: 850,
        items: [
          {
            productoId: 'prod_3',
            nombre: 'Torta de Frutas',
            cantidad: 1,
            precio: 850,
            subtotal: 850
          }
        ],
        metodoPago: 'tarjeta',
        direccion: 'Av. Principal 456, Montevideo',
        notas: 'Entrega urgente'
      },
      {
        id: 'order_' + Date.now() + '_3',
        fecha: new Date(Date.now() - 259200000).toISOString(), // Hace 3 días
        cliente: {
          nombre: 'Ana López',
          telefono: '+598 99 555 333',
          email: 'ana.lopez@email.com'
        },
        estado: 'entregado',
        total: 2100,
        items: [
          {
            productoId: 'prod_4',
            nombre: 'Torta de Cumpleaños',
            cantidad: 1,
            precio: 1500,
            subtotal: 1500
          },
          {
            productoId: 'prod_5',
            nombre: 'Macarons (12 unidades)',
            cantidad: 2,
            precio: 300,
            subtotal: 600
          }
        ],
        metodoPago: 'transferencia',
        direccion: 'Calle Los Olivos 789, Montevideo',
        notas: 'Felicitar a Sofía'
      }
    ];

    // Crear pedidos en Firestore
    for (const order of sampleOrders) {
      await db.collection('orders').doc(order.id).set(order);
      console.log(`✅ Pedido creado: ${order.id}`);
    }

    console.log('🎉 Inicialización de pedidos completada!');
    console.log(`📦 Total de pedidos creados: ${sampleOrders.length}`);

    // Verificar pedidos creados
    const snapshot = await db.collection('orders').get();
    console.log(`📋 Pedidos en base de datos: ${snapshot.docs.length}`);

  } catch (error) {
    console.error('❌ Error al inicializar pedidos:', error);
  }
}

// Función para verificar la estructura de pedidos
async function verifyOrdersStructure() {
  console.log('🔍 Verificando estructura de pedidos...');

  try {
    const snapshot = await db.collection('orders').get();

    if (snapshot.empty) {
      console.log('⚠️ No hay pedidos en la base de datos');
      return;
    }

    snapshot.forEach(doc => {
      const order = doc.data();
      console.log(`📦 Pedido ${doc.id}:`);
      console.log(`  - Cliente: ${order.cliente?.nombre}`);
      console.log(`  - Estado: ${order.estado}`);
      console.log(`  - Total: $${order.total}`);
      console.log(`  - Items: ${order.items?.length}`);
      console.log(`  - Fecha: ${order.fecha}`);
    });

  } catch (error) {
    console.error('❌ Error al verificar pedidos:', error);
  }
}

// Función para limpiar pedidos (con cuidado)
async function clearOrders() {
  if (!confirm('⚠️ ¿Estás seguro de que deseas eliminar TODOS los pedidos?')) {
    return;
  }

  console.log('🗑️ Limpiando colección de pedidos...');

  try {
    const snapshot = await db.collection('orders').get();

    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log('✅ Todos los pedidos eliminados');

  } catch (error) {
    console.error('❌ Error al limpiar pedidos:', error);
  }
}

// Ejecutar funciones según necesidad
// Descomenta la función que necesites ejecutar:

// initializeOrders(); // Crear pedidos de ejemplo
// verifyOrdersStructure(); // Verificar estructura existente
// clearOrders(); // Limpiar todos los pedidos

console.log('📝 Script de inicialización de pedidos cargado');
console.log('👉 Descomenta la función que necesitas ejecutar en el código');