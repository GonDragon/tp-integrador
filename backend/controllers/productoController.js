const { Producto } = require('../models');

const obtenerProductos = async (req, res) => {
    try {
        const productos = await Producto.findAll({
            where: { activo: true }
        });
        return res.json(productos);
    } catch (error) {
        console.warn('Error al traer los productos desde DB, usando catálogo estático:', error.message);
        try {
            const catalogo = require('../catalogo.json');
            return res.json(catalogo);
        } catch (fsErr) {
            console.error('No se pudo leer catalogo.json como fallback:', fsErr);
            return res.status(500).json({ error: 'Hubo un problema al cargar los productos' });
        }
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