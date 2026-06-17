const { Producto } = require('../models');

const obtenerProductos = async (req, res) => {
    try {
        // Obtener parámetros de paginación desde query string
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 6)); // Máximo 100, mínimo 1

        const offset = (page - 1) * limit;

        // Contar total de productos activos
        const { count, rows } = await Producto.findAndCountAll({
            where: { activo: true },
            offset,
            limit,
            order: [['id', 'ASC']]
        });

        const totalPages = Math.ceil(count / limit);

        // Normalizar datos: convertir precio a número y asegurar tipos correctos
        const data = rows.map(producto => ({
            id: producto.id,
            nombre: producto.nombre,
            detalles: producto.detalles,
            precio: parseFloat(producto.precio), // Convertir a número
            imagen: producto.imagen,
            categoria: producto.categoria,
            activo: producto.activo
        }));

        return res.json({
            data,
            pagination: {
                page,
                limit,
                total: count,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Error al traer los productos desde DB:', error.message);
        return res.status(500).json({ 
            error: 'Hubo un problema al cargar los productos',
            message: error.message 
        });
    }
};

const crearProducto = async (req, res) => {
    try {
        const { nombre, detalles, precio, imagen, categoria, activo } = req.body;

        if (!nombre || !detalles || !precio || !categoria) {
            return res.status(400).json({ error: 'Faltan campos obligatorios para crear el producto' });
        }

        const nuevoProducto = await Producto.create({
            nombre,
            detalles,
            precio,
            imagen: imagen || '',
            categoria,
            activo: activo !== undefined ? activo : true 
        });

        res.status(201).json(nuevoProducto);
    } catch (error) {
        console.error('Error al crear el producto:', error);
        res.status(500).json({ error: 'Hubo un problema al guardar el producto en la base de datos' });
    }
};

module.exports = { obtenerProductos, crearProducto };