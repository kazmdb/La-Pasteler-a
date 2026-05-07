// Script de Migración a Firebase
// Ejecutar este script en la consola del navegador después de cargar admin.html

async function migrateToFirebase() {
    // Usar la variable global db
    const database = window.db || (typeof db !== 'undefined' ? db : null);

    if (!database) {
        console.error('❌ Firebase no está inicializado. Asegúrate de cargar firebase-config.js primero.');
        return { success: false, error: 'Firebase no inicializado' };
    }

    console.log('🚀 Iniciando migración a Firebase...');

    try {
        // Datos de categorías
        const categories = [
            {
                id: 'cumpleanos',
                name: 'Tortas de Cumpleaños',
                description: 'Tortas personalizadas para celebraciones especiales',
                isActive: true,
                order: 1
            },
            {
                id: 'postres',
                name: 'Postres Enteros',
                description: 'Postres artesanales en tamaño familiar',
                isActive: true,
                order: 2
            },
            {
                id: 'individuales',
                name: 'Postres Individuales',
                description: 'Postres individuales en vasito, porciones y alfajores',
                type: 'sections',
                isActive: true,
                order: 3
            },
            {
                id: 'budines',
                name: 'Budines',
                description: 'Budines artesanales en variados sabores',
                isActive: true,
                order: 4
            },
            {
                id: 'salados',
                name: 'Salados',
                description: 'Variedad de salados artesanales',
                isActive: true,
                order: 5
            },
            {
                id: 'diadelamadre',
                name: 'Día de la Madre',
                description: 'Desayunos especiales para el día de la madre',
                isActive: true,
                order: 6
            }
        ];

        // Datos de productos
        const products = [
            // CUMPLEAÑOS
            {
                id: 'prod_cumple_1',
                name: 'Torta Personalizada de 1kg',
                description: 'Torta personalizada ideal para 12-15 personas. Diseño único con el tema que elijas.',
                category: 'cumpleanos',
                basePrice: 790,
                currentPrice: 790,
                images: [
                    'assets/images/personalizada2.webp',
                    'assets/images/personalizada1.webp',
                    'assets/images/personalizada3.webp',
                    'assets/images/personalizada4.webp',
                    'assets/images/personalizada5.webp',
                    'assets/images/personalizada6.webp',
                    'assets/images/personalizada7.webp',
                    'assets/images/personalizada8.webp',
                    'assets/images/personalizada9.webp',
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
                ],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            // POSTRES
            {
                id: 'prod_postre_1',
                name: 'Cheesecake',
                description: 'Cheesecake con base de galleta, cubierto de mermelada de frutilla.',
                category: 'postres',
                basePrice: 1800,
                currentPrice: 1800,
                images: ['assets/images/postres/cheesecake.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_postre_2',
                name: 'Chajá',
                description: 'Chajá con merengue, crema y durazno. Dulce de leche opcional.',
                category: 'postres',
                basePrice: 1500,
                currentPrice: 1500,
                images: ['assets/images/postres/chaja.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_postre_3',
                name: 'Rogel',
                description: 'Rogel con capas de masa hojaldrada y dulce de leche.',
                category: 'postres',
                basePrice: 1700,
                currentPrice: 1700,
                images: ['assets/images/postres/rogel.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_postre_4',
                name: 'Red velvet',
                description: 'Red velvet con frosting de queso crema.',
                category: 'postres',
                basePrice: 2000,
                currentPrice: 2000,
                images: ['assets/images/postres/redvelvetentero.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_postre_5',
                name: 'Matilda',
                description: 'Torta matilda de chocolate rellena de ganache de chocolate.',
                category: 'postres',
                basePrice: 1600,
                currentPrice: 1600,
                images: ['assets/images/postres/matildaentero.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_postre_6',
                name: 'Selva negra',
                description: 'Selva negra con chocolate, cerezas y crema batida.',
                category: 'postres',
                basePrice: 2000,
                currentPrice: 2000,
                images: ['assets/images/postres/selvanegra.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_postre_7',
                name: 'Bombón de maní',
                description: 'Torta de chocolate rellena de crema de maní y ganache de chocolate.',
                category: 'postres',
                basePrice: 1400,
                currentPrice: 1400,
                images: ['assets/images/postres/bombondemani.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_postre_8',
                name: 'Chocotorta',
                description: 'Clásica chocotorta con galletitas, queso y dulce de leche.',
                category: 'postres',
                basePrice: 1200,
                currentPrice: 1200,
                images: ['assets/images/postres/chocotorta.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_postre_9',
                name: 'Oreo',
                description: 'Postre de oreo con crema y galletas trituradas.',
                category: 'postres',
                basePrice: 1300,
                currentPrice: 1300,
                images: ['assets/images/postres/oreo.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_postre_10',
                name: 'Lemon Pie',
                description: 'Lemon pie con base de galleta, relleno de limón y merengue italiano.',
                category: 'postres',
                basePrice: 1900,
                currentPrice: 1900,
                images: ['assets/images/postres/lemonpie.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_postre_11',
                name: 'Torta de limón',
                description: 'Torta de limón con crema de limón y merenguitos.',
                category: 'postres',
                basePrice: 1900,
                currentPrice: 1900,
                images: ['assets/images/postres/tortalimon.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_postre_12',
                name: 'Pasta Frola',
                description: 'Pasta Frola de membrillo o dulce de leche.',
                category: 'postres',
                basePrice: 1200,
                currentPrice: 1200,
                images: ['assets/images/postres/pastafrola.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            // INDIVIDUALES - Postres en vasito
            {
                id: 'prod_indiv_1',
                name: 'Cheesecake en vasito',
                description: 'Cheesecake con base de galleta y topping de frutos rojos.',
                category: 'individuales',
                section: 'Postres en vasito',
                basePrice: 150,
                currentPrice: 150,
                images: ['assets/images/postres/cheesecakevaso.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_indiv_2',
                name: 'Chajá en vasito',
                description: 'Clásico chajá uruguayo con merengue, crema y durazno. Dulce de leche opcional.',
                category: 'individuales',
                section: 'Postres en vasito',
                basePrice: 150,
                currentPrice: 150,
                images: ['assets/images/postres/chajavaso.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_indiv_3',
                name: 'Red velvet en vasito',
                description: 'Suave red velvet con frosting de queso crema.',
                category: 'individuales',
                section: 'Postres en vasito',
                basePrice: 150,
                currentPrice: 150,
                images: ['assets/images/postres/redvelvetvaso.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_indiv_4',
                name: 'Matilda en vasito',
                description: 'Torta matilda de chocolate con mousse de chocolate.',
                category: 'individuales',
                section: 'Postres en vasito',
                basePrice: 150,
                currentPrice: 150,
                images: ['assets/images/postres/matildavaso.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_indiv_5',
                name: 'Selva negra en vasito',
                description: 'Selva negra con chocolate, cerezas y crema batida.',
                category: 'individuales',
                section: 'Postres en vasito',
                basePrice: 150,
                currentPrice: 150,
                images: ['assets/images/postres/selvanegravaso.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_indiv_6',
                name: 'Bombón de maní en vasito',
                description: 'Torta de chocolate con crema de maní y ganache de chocolate.',
                category: 'individuales',
                section: 'Postres en vasito',
                basePrice: 150,
                currentPrice: 150,
                images: ['assets/images/postres/bombondemanivaso.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_indiv_7',
                name: 'Chocotorta en vasito',
                description: 'Clásica chocotorta con galletitas, queso y dulce de leche.',
                category: 'individuales',
                section: 'Postres en vasito',
                basePrice: 150,
                currentPrice: 150,
                images: ['assets/images/postres/chocotortavaso.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_indiv_8',
                name: 'Oreo en vasito',
                description: 'Postre de oreo con crema y galletas trituradas.',
                category: 'individuales',
                section: 'Postres en vasito',
                basePrice: 150,
                currentPrice: 150,
                images: ['assets/images/postres/oreovaso.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_indiv_9',
                name: 'Banana split en vasito',
                description: 'Banana split con banana, dulce de leche, crema y salsa de frutilla.',
                category: 'individuales',
                section: 'Postres en vasito',
                basePrice: 150,
                currentPrice: 150,
                images: ['assets/images/postres/bananasplitvaso.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_indiv_10',
                name: 'Lemon Pie en vasito',
                description: 'Lemon pie con base de galleta, relleno de limón y merengue italiano.',
                category: 'individuales',
                section: 'Postres en vasito',
                basePrice: 150,
                currentPrice: 150,
                images: ['assets/images/postres/lemonpievaso.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            // INDIVIDUALES - Porciones y alfajores
            {
                id: 'prod_indiv_11',
                name: 'Porción de Red velvet',
                description: 'Porción de red velvet con frosting de queso crema.',
                category: 'individuales',
                section: 'Porciones y alfajores',
                basePrice: 150,
                currentPrice: 150,
                images: ['assets/images/postres/redvelvet.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_indiv_12',
                name: 'Porción de Matilda',
                description: 'Porción de torta matilda de chocolate rellena de ganache de chocolate.',
                category: 'individuales',
                section: 'Porciones y alfajores',
                basePrice: 150,
                currentPrice: 150,
                images: ['assets/images/postres/matilda.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_indiv_13',
                name: 'Porción de Carrot Cake',
                description: 'Porción de torta de zanahoria con crema de queso y nueces.',
                category: 'individuales',
                section: 'Porciones y alfajores',
                basePrice: 150,
                currentPrice: 150,
                images: ['assets/images/postres/carrotcake.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_indiv_14',
                name: 'Alfajores de chocolate',
                description: '5 Alfajores de chocolate con relleno de dulce de leche.',
                category: 'individuales',
                section: 'Porciones y alfajores',
                basePrice: 150,
                currentPrice: 150,
                images: ['assets/images/postres/alfajoreschocolate.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_indiv_15',
                name: 'Alfajores de maicena',
                description: '5 Alfajores de maicena con relleno de dulce de leche.',
                category: 'individuales',
                section: 'Porciones y alfajores',
                basePrice: 150,
                currentPrice: 150,
                images: ['assets/images/postres/alfajoresmaicena.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            // BUDINES
            {
                id: 'prod_budin_1',
                name: 'Budín de Limón',
                description: 'Budín de limón con glaseado de limón.',
                category: 'budines',
                basePrice: 350,
                currentPrice: 350,
                images: ['assets/images/budines/budinlimon.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_budin_2',
                name: 'Budín de Naranja',
                description: 'Budín de naranja cítrico con ralladura de naranja.',
                category: 'budines',
                basePrice: 250,
                currentPrice: 250,
                images: ['assets/images/budines/budinnaranja.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_budin_3',
                name: 'Budín Marmolado',
                description: 'Budín marmolado de vainilla y chocolate.',
                category: 'budines',
                basePrice: 250,
                currentPrice: 250,
                images: ['assets/images/budines/budinmarmolado.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_budin_4',
                name: 'Budín de Banana con Nuez',
                description: 'Budín de banana con nueces crujientes.',
                category: 'budines',
                basePrice: 350,
                currentPrice: 350,
                images: ['assets/images/budines/budinbananaconnuez.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_budin_5',
                name: 'Budín Carrot Cake',
                description: 'Budín de zanahoria con frosting de queso crema.',
                category: 'budines',
                basePrice: 350,
                currentPrice: 350,
                images: ['assets/images/budines/budincarrotcake.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_budin_6',
                name: 'Budín de Vainilla con Chispas de Chocolate',
                description: 'Budín de vainilla con chispas de chocolate.',
                category: 'budines',
                basePrice: 350,
                currentPrice: 350,
                images: ['assets/images/budines/budinvainillaconchips.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_budin_7',
                name: 'Budín de Vainilla con Nuez y Pasas',
                description: 'Budín de vainilla con nueces y pasas de uva.',
                category: 'budines',
                basePrice: 350,
                currentPrice: 350,
                images: ['assets/images/budines/budinvainillaconnuezyapasas.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_budin_8',
                name: 'Budín de Chocolate',
                description: 'Budín de Chocolate.',
                category: 'budines',
                basePrice: 250,
                currentPrice: 250,
                images: ['assets/images/budines/budinchocolate.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_budin_9',
                name: 'Budín de Vainilla',
                description: 'Budín de Vainilla.',
                category: 'budines',
                basePrice: 250,
                currentPrice: 250,
                images: ['assets/images/budines/budinvainilla.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            // SALADOS
            {
                id: 'prod_salado_1',
                name: 'Tarta de zapallitos',
                description: 'Tarta de zapallitos con queso y cebolla. Ideal para acompañar.',
                category: 'salados',
                basePrice: 800,
                currentPrice: 800,
                images: ['assets/images/salados/tartazapallitos.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_salado_2',
                name: 'Torta de fiambre',
                description: 'Torta de fiambre con mayonesa y vegetales. Perfecta para compartir.',
                category: 'salados',
                basePrice: 900,
                currentPrice: 900,
                images: ['assets/images/salados/tortafiambre.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_salado_3',
                name: 'Pascualina',
                description: 'Pascualina rellena de acelga, espinaca y huevo.',
                category: 'salados',
                basePrice: 700,
                currentPrice: 700,
                images: ['assets/images/salados/pascualina.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_salado_4',
                name: 'Pre-Pizza',
                description: 'Pizzas congeladas listas para hornear.',
                category: 'salados',
                basePrice: 150,
                currentPrice: 150,
                images: ['assets/images/salados/prepizza.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            // DÍA DE LA MADRE
            {
                id: 'prod_madre_1',
                name: 'Desayuno Opción 1',
                description: 'Porción de Red Velvet, 2 mini budines, 5 galletas de avena y naranja, 3 sandwiches de jamón y queso, bombones, bebida a elección: jugo o capuccino y Tarjeta con mensaje personalizado.',
                category: 'diadelamadre',
                basePrice: 650,
                currentPrice: 650,
                images: ['assets/images/festivos/desayuno1.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_madre_2',
                name: 'Desayuno Opción 2',
                description: 'Mini torta rellena de dulce de leche, Scons de queso y orégano, Taza + capuccino y tarjeta con mensaje personalizado.',
                category: 'diadelamadre',
                basePrice: 750,
                currentPrice: 750,
                images: ['assets/images/festivos/desayuno2.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_madre_3',
                name: 'Desayuno Opción 3',
                description: 'Mini torta rellena de dulce de leche, 2 postres en vasito, bolsita de bombones, taza, sobre de capuccino y tarjeta con mensaje personalizado.',
                category: 'diadelamadre',
                basePrice: 790,
                currentPrice: 790,
                images: ['assets/images/festivos/desayuno3.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_madre_4',
                name: 'Desayuno Opción 4',
                description: 'Torta delicada y riquísima, elegí tu diseño favorito. Incluye topper con el mensaje que quieras.',
                category: 'diadelamadre',
                basePrice: 500,
                currentPrice: 500,
                images: ['assets/images/festivos/desayuno4.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 'prod_madre_5',
                name: 'Desayuno Opción 5',
                description: '4 cuadrados de pasta frola, 4 cuadrados de tarta de coco y dulce de leche, 4 cuadrados de limón, 4 galletas de avena y naranja, taza + sobre de capuccino.',
                category: 'diadelamadre',
                basePrice: 450,
                currentPrice: 450,
                images: ['assets/images/festivos/desayuno5.webp'],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];

        // Migrar categorías
        console.log('📁 Migrando categorías...');
        for (const category of categories) {
            await database.collection('categories').doc(category.id).set(category);
            console.log(`✅ Categoría "${category.name}" migrada`);
        }

        // Migrar productos
        console.log('📦 Migrando productos...');
        for (const product of products) {
            await database.collection('products').doc(product.id).set(product);
            console.log(`✅ Producto "${product.name}" migrado`);
        }

        // Crear configuración inicial
        console.log('⚙️ Creando configuración inicial...');
        const settings = {
            pricing: {
                defaultPriority: 'individual',
                currency: 'UYU',
                roundTo: 10
            },
            admin: {
                sessionTimeout: 3600
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        await database.collection('settings').doc('config').set(settings);
        console.log('✅ Configuración creada');

        console.log('🎉 ¡Migración completada exitosamente!');
        console.log(`📊 Resumen:`);
        console.log(`   - ${categories.length} categorías migradas`);
        console.log(`   - ${products.length} productos migrados`);
        console.log(`   - 1 configuración creada`);

        return { success: true, categories: categories.length, products: products.length };

    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        return { success: false, error: error.message };
    }
}

// Ejecutar la migración
console.log('📋 Para ejecutar la migración, llama a: migrateToFirebase()');