const express = require('express');
const router = express.Router();
const { obtenerProductos, crearProducto } = require('../controllers/productoController');


router.get('/', obtenerProductos);
router.post('/', crearProducto);

router.get('/test', (req, res) => {
    res.json({ status: 'success', data: ['hello','world'] });
});

module.exports = router;