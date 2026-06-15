const express = require('express');
const router = express.Router();
const { Producto } = require('../models');
//Middlewares
const verificarCliente = (req, res, next) => {
    const cookieCliente = req.cookies.cliente;
    const nombreParam = req.query.nombre;
    const nombreTrim =  nombreParam?.trim();

    if (nombreParam && nombreTrim !== '') {
        res.cookie('cliente', nombreTrim, {
            httpOnly: true
        });

        req.cookies.cliente = nombreTrim;

        return next();
    } else if (nombreParam) {
        res.clearCookie('cliente');
        return res.redirect('/');
    }

    if (cookieCliente) {
        return next();
    }

    return res.redirect('/');
};

//Rutas
router.get('/', (req, res) => {
    res.render('client/datos_cliente');
});

router.get('/catalogo', verificarCliente, async (req, res) => {
    const cliente = req.cookies.cliente || req.query.nombre;
    
    try {

        const productos = await Producto.findAll({ where: { activo: true } });

        res.render('client/catalogo', { cliente, productos });
    } catch (error) {
        console.error('Error al cargar el catálogo:', error);
        res.render('client/catalogo', { cliente, productos: [] });
    }
});

router.get('/carrito', (req, res) => {
    res.render('client/carrito');
});

router.post('/recibo', (req, res) => {
    const cliente = req.cookies.cliente || req.query.nombre;
    res.render('client/recibo', { cliente });
});

module.exports = router;