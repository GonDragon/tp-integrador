const express = require('express');
const router = express.Router();
const { obtenerProductos, crearProducto } = require('../controllers/productoController');


router.get('/productos/', obtenerProductos);
router.post('/productos/', crearProducto);

module.exports = router;