const express = require('express');
const router = express.Router();
const { obtenerProductos } = require('../controllers/productoController');


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

module.exports = router;