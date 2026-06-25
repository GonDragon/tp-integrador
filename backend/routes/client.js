/**
 * Rutas de cliente
 *
 * Este archivo expone las rutas públicas que usa el cliente en la interfaz web:
 * - `/`             : formulario de ingreso de nombre
 * - `/catalogo`     : catálogo de productos (requiere identificación)
 * - `/carrito`      : vista del carrito (requiere identificación)
 * - `/recibo`       : procesa y muestra el recibo
 *
 * La autenticación es muy ligera: se guarda el nombre en una cookie `cliente`.
 */
const express = require('express');
const router = express.Router();
const { Producto, Venta, VentaProducto, sequelize } = require('../models');

// Middlewares
/**
 * verificarCliente
 * Comprueba que exista una cookie `cliente` válida o que venga `req.query.nombre`.
 * Si el cliente provee `nombre` en query se setea la cookie y continúa.
 * Si no hay cookie ni nombre, redirige a la página de inicio (`/`).
 */
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

// Rutas
/**
 * GET /
 * Muestra la página de bienvenida donde el cliente ingresa su nombre.
 */
router.get('/', (req, res) => {
    res.render('client/datos_cliente');
});

/**
 * GET /catalogo
 * Renderiza el catálogo de productos activos.
 * Requiere identificación del cliente vía cookie `cliente` o query `nombre`.
 *
 * @param {string} [req.query.nombre] - Nombre del cliente (opcional, usado en redirecciones).
 * @returns {HTML} Vista `client/catalogo` con `cliente` y `productos`.
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
 * Muestra la página del carrito de compras del cliente. Requiere identificación.
 * @returns {HTML} Vista `client/carrito` con `cliente`.
 */
router.get('/carrito', verificarCliente, (req, res) => {
    const cliente = req.cookies.cliente || req.query.nombre;
    res.render('client/carrito', { cliente });
});

/**
 * POST /recibo
 * Procesa los datos del carrito enviados desde el cliente y renderiza el recibo.
 * Espera `req.body.carritoData` (JSON string) con los items: id, nombre, precio, cantidad.
 * Guarda la venta en la base de datos.
 *
 * @param {string} req.body.carritoData - Cadena JSON que contiene los items del carrito.
 * @returns {HTML} Vista `client/recibo` con `cliente`, `carrito` y `total`.
 */
router.post('/recibo', verificarCliente, async (req, res) => {
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
            console.error('Error crítico: JSON malformado en el carrito:', error);
            return res.redirect('/catalogo');
        }
    }

    // Transacción ACID: insert Venta + VentaProducto + descuento de stock de forma atómica.
    // Si cualquier paso falla (stock insuficiente, error de BD, etc.) se hace rollback completo.
    try {
        await sequelize.transaction(async (t) => {

            // 1. Validar stock de cada producto con bloqueo pesimista (FOR UPDATE)
            //    para evitar condiciones de carrera con compras concurrentes.
            for (const item of carrito) {
                const producto = await Producto.findByPk(item.id, {
                    lock: t.LOCK.UPDATE,
                    transaction: t
                });

                if (!producto) {
                    throw new Error(`El producto "${item.nombre}" (ID: ${item.id}) ya no existe en el catálogo.`);
                }

                if (producto.stock < item.cantidad) {
                    throw new Error(
                        `Stock insuficiente para "${producto.nombre}": ` +
                        `solicitaste ${item.cantidad} unidad(es) pero solo hay ${producto.stock} disponible(s).`
                    );
                }
            }

            // 2. Crear la cabecera de la venta
            const nuevaVenta = await Venta.create({
                nombre_cliente: cliente,
                total: totalPagado
            }, { transaction: t });

            // 3. Insertar los detalles (VentaProducto) y descontar el stock en paralelo
            await Promise.all(carrito.map(async (item) => {
                await VentaProducto.create({
                    ventaId: nuevaVenta.id,
                    productoId: item.id,
                    cantidad: item.cantidad,
                    precioUnitario: item.precio
                }, { transaction: t });

                await Producto.decrement('stock', {
                    by: item.cantidad,
                    where: { id: item.id },
                    transaction: t
                });
            }));

            console.log(`✅ Venta ID ${nuevaVenta.id} registrada para "${cliente}" | Total: $${totalPagado}`);
        });

        // Transacción exitosa: mostrar recibo
        res.render('client/recibo', {
            cliente,
            carrito,
            total: totalPagado,
            error: null
        });

    } catch (error) {
        // Rollback automático al salir del callback con error.
        // Mostramos el mensaje descriptivo al usuario en la vista del carrito.
        console.error('Error al procesar la compra (rollback ejecutado):', error.message);
        res.render('client/carrito', {
            cliente,
            error: error.message || 'Ocurrió un error al procesar tu compra. Intentá de nuevo.'
        });
    }
});

module.exports = router;