const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Admin, Producto, Imagen } = require('../models');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_dev_cambiar_en_produccion';
const JWT_EXPIRY = '8h';

// CONFIGURACIÓN DE MULTER
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const STORAGE_DIR = process.env.STORAGE_DIR || path.join(__dirname, '../../storage');

async function procesarImagen(file) {
    if (!file) return null;

    const hash = crypto.createHash('md5').update(file.buffer).digest('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    
    let imagen = await Imagen.findOne({ where: { hash: hash } });

    if (!imagen) {
        const fileName = `${hash}${ext}`;
        const filePath = path.join(STORAGE_DIR, fileName);
        
        fs.writeFileSync(filePath, file.buffer);
        
        imagen = await Imagen.create({
            hash: hash,
            extension: ext
        });
    }

    return imagen.id;
}

async function limpiarImagenSiNoSeUsa(imagenId) {
    if (!imagenId) return;

    try {
        const uso = await Producto.count({ where: { imagenId: imagenId } });
        
        if (uso === 0) {
            const imagen = await Imagen.findByPk(imagenId);
            if (imagen) {
                const fileName = `${imagen.hash}${imagen.extension}`;
                const filePath = path.join(STORAGE_DIR, fileName);
                
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`Archivo de imagen eliminado: ${fileName}`);
                }
                
                await Imagen.destroy({ where: { id: imagenId } });
                console.log(`Registro de imagen ID ${imagenId} eliminado de la BD.`);
            }
        }
    } catch (error) {
        console.error(`Error al limpiar imagen ID ${imagenId}:`, error);
    }
}

// MIDDLEWARE
/**
 * verificarAdmin
 * Valida el token JWT almacenado en la cookie `admin_session`.
 * Si el token es válido, expone `req.adminId` y `req.adminUsername` al siguiente handler.
 * Si el token es inválido, expiró o no existe, redirige a la página de login.
 */
const verificarAdmin = (req, res, next) => {
    const token = req.cookies.admin_session;

    if (!token) {
        return res.redirect('/admin/login');
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.adminId = payload.id;
        req.adminUsername = payload.username;
        return next();
    } catch (err) {
        // Token inválido o expirado
        res.clearCookie('admin_session');
        return res.redirect('/admin/login');
    }
};


/**
 * GET /admin/login
 * Muestra la página de inicio de sesión para el administrador.
 * Si ya existe una sesión activa, redirige al dashboard.
 */
router.get('/login', (req, res) => {
    if (req.cookies.admin_session) {
        return res.redirect('/admin');
    }
    res.render('admin/login', { error: null });
});

/**
 * POST /admin/login
 * Procesa el inicio de sesión del administrador.
 * Verifica las credenciales contra la base de datos y establece una cookie de sesión si son correctas.
 * 
 * @param {string} req.body.usuario - Nombre de usuario del administrador.
 * @param {string} req.body.password - Contraseña del administrador.
 */
router.post('/login', async (req, res) => {
    const { usuario, password } = req.body;

    try {
        const adminUser = await Admin.findOne({ where: { username: usuario } });

        if (!adminUser) {
            return res.render('admin/login', { error: 'Usuario o contraseña incorrectos' });
        }

        const passwordValida = await bcrypt.compare(password, adminUser.hash);

        if (passwordValida) {
            // Generar token JWT firmado con el id y username del admin
            const token = jwt.sign(
                { id: adminUser.id, username: adminUser.username },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRY }
            );

            // Guardar el JWT en una cookie httpOnly para protegerlo de acceso JS del cliente
            res.cookie('admin_session', token, {
                httpOnly: true,
                sameSite: 'strict'
            });

            console.log(`✅ Login exitoso para el admin: ${adminUser.username} (ID: ${adminUser.id})`);
            return res.redirect('/admin');
        } else {
            return res.render('admin/login', { error: 'Usuario o contraseña incorrectos' });
        }
    } catch (error) {
        console.error('Error en el login del admin:', error);
        res.render('admin/login', { error: 'Error interno del servidor. Intentá de nuevo.' });
    }
});

/**
 * GET /admin
 * Muestra el dashboard de administración con la lista de productos.
 * Requiere autenticación de administrador.
 * 
 * @param {string} [req.query.mensaje] - Código de mensaje para mostrar notificaciones de éxito.
 * @param {string} [req.query.error] - Mensaje de error para mostrar en el dashboard.
 */
router.get('/', verificarAdmin, async (req, res) => {
    const mensaje = req.query.mensaje; 
    const errorUrl = req.query.error;

    try {
        const productos = await Producto.findAll({ 
            include: [{ model: Imagen }],
            order: [['id', 'DESC']] 
        });
        console.log(`📦 Dashboard cargado: Se encontraron ${productos.length} productos en la BD.`);
        
        res.render('admin/dashboard', { productos, mensaje, error: errorUrl || null });
    } catch (error) {
        console.error('❌ Error al cargar el dashboard:', error);
        res.render('admin/dashboard', { productos: [], mensaje: null, error: 'Hubo un problema al leer la base de datos.' });
    }
});

/**
 * GET /admin/productos/nuevo
 * Muestra el formulario para crear un nuevo producto.
 * Requiere autenticación de administrador.
 */
router.get('/productos/nuevo', verificarAdmin, (req, res) => {
    res.render('admin/nuevo_producto', { error: null });
});

/**
 * POST /admin/productos/nuevo
 * Crea un nuevo producto en la base de datos, incluyendo la carga de su imagen.
 * Requiere autenticación de administrador.
 * 
 * @param {string} req.body.nombre - Nombre del producto.
 * @param {string} req.body.detalles - Descripción detallada del producto.
 * @param {number} req.body.precio - Precio del producto.
 * @param {string} req.body.categoria - Categoría del producto.
 * @param {string} [req.body.activo] - Estado del producto ('on' si está activo).
 * @param {File} req.file - Archivo de imagen del producto.
 */
router.post('/productos/nuevo', verificarAdmin, upload.single('imagen'), async (req, res) => {
    const { nombre, detalles, precio, categoria, activo, stock } = req.body;
    
    console.log("Recibiendo datos del form:", req.body); 

    try {
        const imagenId = await procesarImagen(req.file);

        if (!categoria || categoria.trim() === '') {
            return res.render('admin/nuevo_producto', { error: 'La categoría es obligatoria.' });
        }

        const nuevoProd = await Producto.create({
            nombre: nombre,
            detalles: detalles,
            precio: parseFloat(precio),
            imagenId: imagenId,
            categoria: categoria,
            activo: activo === 'on',
            stock: parseInt(stock) || 0
        });

        console.log("Producto guardado en MySQL con ID:", nuevoProd.id);
        res.redirect('/admin?mensaje=creado');
    } catch (error) {
        console.error('Error de Sequelize al guardar:', error.message);
        res.render('admin/nuevo_producto', { error: 'Error al guardar en la base de datos: ' + error.message });
    }
});

/**
 * POST /admin/productos/eliminar/:id
 * Elimina un producto de la base de datos por su ID.
 * También limpia la imagen asociada si no está siendo usada por otros productos.
 * Requiere autenticación de administrador.
 * 
 * @param {number} req.params.id - ID del producto a eliminar.
 */
router.post('/productos/eliminar/:id', verificarAdmin, async (req, res) => {
    try {
        const id = req.params.id;

        const producto = await Producto.findByPk(id);
        const imagenIdAnterior = producto ? producto.imagenId : null;

        await Producto.destroy({ where: { id: id } });
        console.log(`Producto con ID ${id} eliminado.`);

        if (imagenIdAnterior) {
            await limpiarImagenSiNoSeUsa(imagenIdAnterior);
        }

        res.redirect('/admin?mensaje=eliminado');
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.redirect('/admin?error=No se pudo eliminar el producto por un error interno.');
    }
});

/**
 * GET /admin/productos/editar/:id
 * Muestra el formulario para editar un producto existente.
 * Requiere autenticación de administrador.
 * 
 * @param {number} req.params.id - ID del producto a editar.
 */
router.get('/productos/editar/:id', verificarAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const producto = await Producto.findByPk(id);
        
        if (!producto) {
            return res.redirect('/admin?error=Producto no encontrado.');
        }
        res.render('admin/editar_producto', { producto, error: null });
    } catch (error) {
        console.error('Error al buscar producto para editar:', error);
        res.redirect('/admin?error=Error al cargar la pantalla de edición.');
    }
});

/**
 * POST /admin/productos/editar/:id
 * Actualiza los datos de un producto existente.
 * Permite cambiar la imagen, gestionando la limpieza de la imagen anterior si corresponde.
 * Requiere autenticación de administrador.
 * 
 * @param {number} req.params.id - ID del producto a actualizar.
 * @param {string} req.body.nombre - Nuevo nombre del producto.
 * @param {string} req.body.detalles - Nueva descripción del producto.
 * @param {number} req.body.precio - Nuevo precio del producto.
 * @param {string} req.body.categoria - Nueva categoría del producto.
 * @param {string} [req.body.activo] - Nuevo estado del producto ('on' si está activo).
 * @param {File} [req.file] - Nueva imagen del producto (opcional).
 */
router.post('/productos/editar/:id', verificarAdmin, upload.single('imagen'), async (req, res) => {
    const id = req.params.id;
    const { nombre, detalles, precio, categoria, activo, stock } = req.body;
    
    try {
        const productoAnterior = await Producto.findByPk(id);
        if (!productoAnterior) {
            return res.redirect('/admin?error=Producto no encontrado.');
        }
        const imagenIdAnterior = productoAnterior.imagenId;

        if (!categoria || categoria.trim() === '') {
            const producto = await Producto.findByPk(id);
            return res.render('admin/editar_producto', { producto, error: 'La categoría es obligatoria.' });
        }

        const updateData = {
            nombre: nombre,
            detalles: detalles,
            precio: parseFloat(precio),
            categoria: categoria,
            activo: activo === 'on',
            stock: parseInt(stock) || 0
        };

        let nuevaImagenId = imagenIdAnterior;
        if (req.file) {
            nuevaImagenId = await procesarImagen(req.file);
            updateData.imagenId = nuevaImagenId;
        }

        await Producto.update(updateData, {
            where: { id: id }
        });

        console.log(`Producto con ID ${id} actualizado correctamente.`);

        if (req.file && imagenIdAnterior && nuevaImagenId !== imagenIdAnterior) {
            await limpiarImagenSiNoSeUsa(imagenIdAnterior);
        }

        res.redirect('/admin?mensaje=editado');
    } catch (error) {
        console.error('Error al editar:', error.message);
        const producto = await Producto.findByPk(id);
        res.render('admin/editar_producto', { producto, error: 'Error al actualizar: ' + error.message });
    }
});

/**
 * GET /admin/logout
 * Cierra la sesión del administrador eliminando la cookie de sesión.
 */
router.get('/logout', (req, res) => {
    res.clearCookie('admin_session');
    res.redirect('/admin/login');
});

module.exports = router;