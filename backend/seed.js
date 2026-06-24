const { sequelize, Producto } = require('./models');
const { connectDB } = require('./config/db');

const seedProducts = async () => {
    try {
        await connectDB();
        
        const productos = [
            {
                nombre: 'Whey Protein',
                detalles: 'Proteína de suero pura, 25g de proteína por porción',
                precio: 2500,
                categoria: 'Suplementos',
                activo: true
            },
            {
                nombre: 'Creatina Monohidrato',
                detalles: 'Creatina pura de alta pureza, 5g por dosis',
                precio: 1800,
                categoria: 'Suplementos',
                activo: true
            },
            {
                nombre: 'Asesoría Personal',
                detalles: 'Sesión de una hora con entrenador profesional',
                precio: 5000,
                categoria: 'Servicios',
                activo: true
            },
            {
                nombre: 'Membresía Mensual',
                detalles: 'Acceso ilimitado al gimnasio y piscina',
                precio: 3500,
                categoria: 'Servicios',
                activo: true
            }
        ];

        await Producto.bulkCreate(productos);
        console.log('✅ Productos de prueba insertados exitosamente');
        await sequelize.close();
    } catch (error) {
        console.error('❌ Error al insertar productos:', error.message);
        await sequelize.close();
        process.exit(1);
    }
};

seedProducts();
