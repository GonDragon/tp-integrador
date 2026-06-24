const Producto = require('./Producto');
const Venta = require('./Venta');
const Admin = require('./Admin');
const Imagen = require('./Imagen');
const VentaProducto = require('./VentaProducto');
const { sequelize } = require('../config/db');

Producto.belongsToMany(Venta, { through: VentaProducto, foreignKey: 'productoId' });
Venta.belongsToMany(Producto, { through: VentaProducto, foreignKey: 'ventaId' });

Producto.belongsTo(Imagen, { foreignKey: 'imagenId' });
Imagen.hasMany(Producto, { foreignKey: 'imagenId' });

module.exports = { Producto, Venta, Admin, Imagen, VentaProducto, sequelize };