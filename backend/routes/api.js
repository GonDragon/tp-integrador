const express = require('express');
const router = express.Router();
const { obtenerProductos } = require('../controllers/productoController');
const bcrypt = require('bcrypt');
const { Admin, Venta, Producto } = require('../models');


/**
 * GET /api/listadoVentas
 * Retorna la lista de todas las ventas con sus productos incrustados.
 */
router.get('/listadoVentas', async (req, res) => {
    try {
        const ventas = await Venta.findAll({
            include: [{
                model: Producto,
                through: { attributes: ['cantidad', 'precioUnitario'] }
            }]
        });
        res.json(ventas);
    } catch (error) {
        console.error('Error al obtener el listado de ventas:', error);
        res.status(500).json({ error: 'Error al obtener el listado de ventas' });
    }
});


/**
 * GET /api/productos/
 * Retorna la lista paginada de productos activos en JSON.
 * Soporta query params `page` y `limit` para paginación (ver `productoController.obtenerProductos`).
 *
 * @query {number} [page=1] - Página a devolver.
 * @query {number} [limit=6] - Cantidad de items por página.
 * @returns {Object} 200 - Objeto con `data` (array de productos) y `pagination`.
 */
router.get('/productos/', obtenerProductos);

/**
 * POST /api/createAdmin
 * Crea un nuevo usuario administrador.
 * INSEGURO: no requiere autenticacion
 * 
 * @body {string} admin - Nombre de usuario.
 * @body {string} password - Contraseña.
 */
router.post('/createAdmin', async (req, res) => {
    const { admin, password } = req.body;

    if (!admin || !password) {
        return res.status(400).json({ error: 'Faltan datos requeridos (admin y password)' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = await Admin.create({
            username: admin,
            hash: hashedPassword
        });
        res.status(201).json({ message: 'Usuario administrador creado exitosamente', id: newAdmin.id });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el usuario administrador' });
    }
});

module.exports = router;