const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { Admin, Producto } = require('../models');

//MIDDLEWARE
const verificarAdmin = (req, res, next) => {
    if (req.cookies.admin_session) {
        return next();
    }
    res.redirect('/admin/login');
};


router.get('/login', (req, res) => {
    if (req.cookies.admin_session) {
        return res.redirect('/admin');
    }
    res.render('admin/login', { error: null });
});

router.post('/login', async (req, res) => {
    const { usuario, password } = req.body;

    try {
        const adminUser = await Admin.findOne({ where: { username: usuario } });

        if (!adminUser) {
            return res.render('admin/login', { error: 'Usuario o contraseña incorrectos' });
        }

        const passwordValida = await bcrypt.compare(password, adminUser.hash);

        if (passwordValida) {
            res.cookie('admin_session', adminUser.id, { httpOnly: true });
            return res.redirect('/admin');
        } else {
            return res.render('admin/login', { error: 'Usuario o contraseña incorrectos' });
        }
    } catch (error) {
        console.error('Error en el login del admin:', error);
        res.render('admin/login', { error: 'Error interno del servidor. Intentá de nuevo.' });
    }
});

router.get('/', verificarAdmin, async (req, res) => {
    const mensaje = req.query.mensaje; 
    const errorUrl = req.query.error;

    try {
        const productos = await Producto.findAll({ order: [['id', 'DESC']] });
        console.log(`📦 Dashboard cargado: Se encontraron ${productos.length} productos en la BD.`);
        
        res.render('admin/dashboard', { productos, mensaje, error: errorUrl || null });
    } catch (error) {
        console.error('❌ Error al cargar el dashboard:', error);
        res.render('admin/dashboard', { productos: [], mensaje: null, error: 'Hubo un problema al leer la base de datos.' });
    }
});

router.get('/productos/nuevo', verificarAdmin, (req, res) => {
    res.render('admin/nuevo_producto', { error: null });
});

router.post('/productos/nuevo', verificarAdmin, async (req, res) => {
    const { nombre, detalles, precio, imagen, categoria, activo } = req.body;
    
    console.log("📥 Recibiendo datos del form:", req.body); 

    try {
        const nuevoProd = await Producto.create({
            nombre: nombre,
            detalles: detalles,
            precio: parseFloat(precio),
            imagen: imagen,
            categoria: categoria || 'General',
            activo: activo === 'on' ? true : false 
        });

        console.log("✅ Producto guardado en MySQL con ID:", nuevoProd.id);
        res.redirect('/admin?mensaje=creado');
    } catch (error) {
        console.error('❌ Error de Sequelize al guardar:', error.message);
        res.render('admin/nuevo_producto', { error: 'Error al guardar en la base de datos: ' + error.message });
    }
});

router.post('/productos/eliminar/:id', verificarAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        await Producto.destroy({ where: { id: id } });
        console.log(`🗑️ Producto con ID ${id} eliminado.`);
        res.redirect('/admin?mensaje=eliminado');
    } catch (error) {
        console.error('❌ Error al eliminar producto:', error);
        res.redirect('/admin?error=No se pudo eliminar el producto por un error interno.');
    }
});

router.get('/productos/editar/:id', verificarAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const producto = await Producto.findByPk(id);
        
        if (!producto) {
            return res.redirect('/admin?error=Producto no encontrado.');
        }
        res.render('admin/editar_producto', { producto, error: null });
    } catch (error) {
        console.error('❌ Error al buscar producto para editar:', error);
        res.redirect('/admin?error=Error al cargar la pantalla de edición.');
    }
});

router.post('/productos/editar/:id', verificarAdmin, async (req, res) => {
    const id = req.params.id;
    const { nombre, detalles, precio, imagen, categoria, activo } = req.body;
    
    try {
        await Producto.update({
            nombre: nombre,
            detalles: detalles,
            precio: parseFloat(precio),
            imagen: imagen,
            categoria: categoria || 'General',
            activo: activo === 'on' ? true : false 
        }, {
            where: { id: id }
        });

        console.log(`✅ Producto con ID ${id} actualizado correctamente.`);
        res.redirect('/admin?mensaje=editado');
    } catch (error) {
        console.error('❌ Error al editar:', error.message);
        const producto = await Producto.findByPk(id);
        res.render('admin/editar_producto', { producto, error: 'Error al actualizar: ' + error.message });
    }
});

router.get('/logout', (req, res) => {
    res.clearCookie('admin_session');
    res.redirect('/admin/login');
});

module.exports = router;