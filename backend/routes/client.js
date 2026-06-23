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
/**
 * GET /
 * Muestra la página de bienvenida donde el cliente ingresa su nombre.
 */
router.get('/', (req, res) => {
    res.render('client/datos_cliente');
});

/**
 * GET /catalogo
 * Muestra el catálogo de productos disponibles para el cliente.
 * Requiere que el cliente esté identificado.
 * 
 * @param {string} [req.query.nombre] - Nombre del cliente (si viene de la redirección inicial).
 */
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

/**
 * GET /carrito
 * Muestra la página del carrito de compras del cliente.
 * Requiere que el cliente esté identificado.
 */
router.get('/carrito', verificarCliente, (req, res) => {
    const cliente = req.cookies.cliente || req.query.nombre;
    res.render('client/carrito', { cliente });
});

/**
 * POST /recibo
 * Procesa el carrito de compras y muestra el recibo final.
 * Requiere que el cliente esté identificado.
 * 
 * @param {string} req.body.carritoData - Cadena JSON que contiene los items del carrito.
 */
router.post('/recibo', verificarCliente, (req, res) => {
    const cliente = req.cookies.cliente || 'Atleta';
    const carritoCrudo = req.body.carritoData;

    let carrito = [];
    let totalPagado = 0;

    if (carritoCrudo) {
        try {
            const parsed = JSON.parse(carritoCrudo);

            if (Array.isArray(parsed)) {
                carrito = parsed.map(item => ({
                    ...item,
                    precio: parseFloat(item.precio) || 0,
                    cantidad: parseInt(item.cantidad) || 1
                }));

                carrito.forEach(item => {
                    totalPagado += (item.precio * item.cantidad);
                });
            }
        } catch (error) {
            console.error('🚨 Error crítico: JSON malformado en el carrito:', error);
            return res.redirect('/catalogo');
        }
    }

    res.render('client/recibo', {
        cliente,
        carrito,
        total: totalPagado
    });
});

module.exports = router;