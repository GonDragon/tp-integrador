const express = require('express');
const router = express.Router();

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
        // Eliminar la cookie si el parametro nombre es vacio
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

router.get('/catalogo', verificarCliente, (req, res) => {
    const cliente = req.cookies.cliente || req.query.nombre;
    res.render('client/catalogo', { cliente });
});

module.exports = router;