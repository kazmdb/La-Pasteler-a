# Sistema de Administración - La Pastelería

Sistema completo de administración con backend en Firebase para gestionar precios dinámicos y ofertas.

## 🚀 Características

- **Gestión de Productos**: CRUD completo para productos
- **Gestión de Categorías**: Organización de productos por categorías
- **Sistema de Ofertas**: 
  - Ofertas individuales por producto
  - Ofertas por categoría
  - Ofertas por porcentaje o precio fijo
  - Control de fechas de vigencia
- **Precios Dinámicos**: Cálculo automático de precios con ofertas
- **Lógica de Prioridad**: Las ofertas individuales tienen prioridad sobre las de categoría
- **Panel de Administración**: Interfaz moderna y responsiva
- **Autenticación**: Sistema de login seguro
- **Base de Datos Firebase**: Almacenamiento en la nube

## 📋 Requisitos Previos

- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Cuenta de Firebase (opcional para producción)
- Servidor web local o hosting

## 🛠️ Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/la-pasteleria.git
cd la-pasteleria
```

### 2. Configurar Firebase (Opcional)

Si deseas usar Firebase en producción:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto
3. Habilita Firestore Database
4. Habilita Authentication (Email/Password)
5. Copia la configuración de tu proyecto

### 3. Configurar el Archivo Firebase

Edita `firebase-config.js`:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};
```

### 4. Configurar Contraseña de Admin

En `admin.js`, cambia la contraseña por defecto:

```javascript
const ADMIN_PASSWORD = 'tu_contraseña_segura'; // Línea ~95
```

## 🎯 Uso

### Acceder al Panel de Administración

1. Abre `admin.html` en tu navegador
2. Ingresa la contraseña de administrador (por defecto: `admin123`)
3. Navega por las diferentes secciones del panel

### Gestión de Productos

1. **Crear Producto**:
   - Haz clic en "+ Nuevo Producto"
   - Completa el formulario con los datos del producto
   - Selecciona la categoría
   - Agrega URLs de imágenes
   - Guarda el producto

2. **Editar Producto**:
   - Haz clic en "Editar" en la tabla de productos
   - Modifica los datos necesarios
   - Guarda los cambios

3. **Eliminar Producto**:
   - Haz clic en "Eliminar" en la tabla de productos
   - Confirma la eliminación

### Gestión de Categorías

1. **Crear Categoría**:
   - Ve a la sección "Categorías"
   - Haz clic en "+ Nueva Categoría"
   - Completa el formulario
   - Guarda la categoría

2. **Editar/Eliminar Categoría**:
   - Usa los botones correspondientes en cada tarjeta de categoría

### Gestión de Ofertas

1. **Crear Oferta Individual**:
   - Ve a la sección "Ofertas"
   - Haz clic en "+ Nueva Oferta"
   - Selecciona "Tipo de Objetivo: Producto Específico"
   - Elige el producto
   - Define el tipo de oferta (porcentaje o precio fijo)
   - Establece las fechas de vigencia
   - Guarda la oferta

2. **Crear Oferta por Categoría**:
   - Ve a la sección "Ofertas"
   - Haz clic en "+ Nueva Oferta"
   - Selecciona "Tipo de Objetivo: Categoría Completa"
   - Elige la categoría
   - Define el descuento
   - Establece las fechas de vigencia
   - Guarda la oferta

### Configuración de Precios

1. **Configurar Prioridad**:
   - Ve a la sección "Configuración"
   - En "Configuración de Precios"
   - Elige la prioridad por defecto
   - Configura la moneda y redondeo
   - Guarda la configuración

## 📊 Lógica de Precios

### Prioridad de Ofertas

El sistema sigue este orden de prioridad:

1. **Ofertas Individuales (Priority: 2)**: Mayor prioridad
2. **Ofertas por Categoría (Priority: 1)**: Menor prioridad
3. **Precio Base**: Sin ofertas

### Cálculo de Precio

```javascript
// Ejemplo de cálculo
Producto: Cheesecake
Precio Base: $1200

Oferta Individual: 20% descuento
Oferta Categoría: 10% descuento

Resultado: $960 (se aplica la oferta individual)
```

### Tipos de Ofertas

1. **Porcentaje**: Descuento calculado sobre el precio base
   - Ejemplo: 20% de descuento sobre $1200 = $960

2. **Precio Fijo**: Precio específico independientemente del base
   - Ejemplo: Precio fijo $900 (sin importar el precio base)

## 🔐 Seguridad

### Autenticación

- El sistema usa autenticación por contraseña
- Las sesiones expiran después de 1 hora
- Las credenciales se almacenan de forma segura en localStorage

### Recomendaciones de Seguridad

1. **Cambiar la contraseña por defecto**
2. **Usar HTTPS en producción**
3. **Implementar autenticación Firebase real**
4. **Limitar intentos de login**
5. **Usar variables de entorno para configuración sensible**

## 📁 Estructura del Proyecto

```
la-pasteleria/
├── admin.html              # Panel de administración
├── admin.css               # Estilos del panel
├── admin.js                # Lógica del panel
├── firebase-config.js      # Configuración de Firebase
├── index.html              # Página principal
├── styles.css              # Estilos principales
├── script.js               # Lógica principal
├── DATABASE_STRUCTURE.md   # Estructura de base de datos
├── API_DOCUMENTATION.md    # Documentación de API
└── README.md               # Este archivo
```

## 🔧 Desarrollo

### Modo Desarrollo

Para desarrollo local sin Firebase:

1. Abre `admin.html` directamente en el navegador
2. El sistema usará localStorage para almacenamiento
3. Los datos persistirán en el navegador

### Integración con Firebase

Para producción con Firebase:

1. Configura `firebase-config.js`
2. Implementa las funciones de Firebase en `admin.js`
3. Reemplaza las funciones de localStorage por llamadas a Firebase

### Agregar Nuevas Funcionalidades

1. **Nuevos Campos en Productos**:
   - Agrega campos en el formulario HTML
   - Actualiza el esquema de datos
   - Modifica las funciones de guardado/carga

2. **Nuevos Tipos de Ofertas**:
   - Agrega el tipo en el selector
   - Implementa la lógica de cálculo
   - Actualiza la documentación

## 🐛 Solución de Problemas

### Problemas Comunes

1. **No puedo iniciar sesión**:
   - Verifica la contraseña en `admin.js`
   - Limpia el localStorage del navegador

2. **Los datos no se guardan**:
   - Verifica la configuración de Firebase
   - Revisa la consola del navegador para errores

3. **Las ofertas no se aplican**:
   - Verifica las fechas de vigencia
   - Revisa la prioridad de las ofertas
   - Confirma que el producto/categoría estén activos

### Debug Mode

Para habilitar el modo debug:

```javascript
// En admin.js, al inicio
const DEBUG_MODE = true;
```

## 📚 Documentación Adicional

- [Estructura de Base de Datos](DATABASE_STRUCTURE.md)
- [Documentación de API](API_DOCUMENTATION.md)
- [Firebase Documentation](https://firebase.google.com/docs)

## 🤝 Contribuir

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 📞 Soporte

Para soporte técnico:

- Email: admin@lapasteleria.com
- Instagram: @la_pasteleria13
- Teléfono: 092 062 729

## 🎨 Créditos

Desarrollado para La Pastelería - Tortas y Postres Artesanales

---

**Nota**: Este es un sistema de demostración. Para uso en producción, implementa todas las medidas de seguridad recomendadas y usa una configuración de Firebase real.