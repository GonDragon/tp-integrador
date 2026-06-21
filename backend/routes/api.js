const express = require('express');
const router = express.Router();
const { obtenerProductos } = require('../controllers/productoController');


router.get('/productos/', obtenerProductos);

module.exports = router;