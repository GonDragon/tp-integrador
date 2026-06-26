const { Producto, Imagen } = require('../models');

/**
 * obtenerProductos
 * Controlador que devuelve los productos activos en formato paginado JSON.
 * Soporta query params `page` y `limit` para controlar paginación.
 *
 * Respuesta:
 * {
 *   data: [{ id, nombre, detalles, precio, imagen, categoria, activo }],
 *   pagination: { page, limit, total, totalPages, hasNextPage, hasPrevPage }
 * }
 */
const obtenerProductos = async (req, res) => {
    try {
        // Obtener parámetros de paginación desde query string
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 6)); // Máximo 100, mínimo 1

        const offset = (page - 1) * limit;

        const categoriaFiltro = req.query.categoria;
        const whereClause = { activo: true };
        if (categoriaFiltro) {
            whereClause.categoria = categoriaFiltro;
        }

        // Contar total de productos activos (con filtro opcional)
        const { count, rows } = await Producto.findAndCountAll({
            where: whereClause,
            include: [{ model: Imagen }],
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
            imagen: producto.Imagen ? `${producto.Imagen.hash}${producto.Imagen.extension}` : null,
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

module.exports = { obtenerProductos };