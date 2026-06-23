const express = require('express');
const router = express.Router();
const { obtenerProductos } = require('../controllers/productoController');


/**
 * GET /api/productos/
 * Retorna la lista de todos los productos en formato JSON.
 * Se utiliza para obtener los datos de los productos desde el cliente.
 * 
 * @returns {Object[]} 200 - Un arreglo de objetos de productos.
 */
router.get('/productos/', obtenerProductos);

module.exports = router;