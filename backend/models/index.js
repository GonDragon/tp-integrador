const Producto = require('./Producto');
const Venta = require('./Venta');
const Admin = require('./Admin');
const Imagen = require('./Imagen');
const { sequelize } = require('../config/db');

Producto.belongsToMany(Venta, { through: 'Detalle_Venta', foreignKey: 'productoId' });
Venta.belongsToMany(Producto, { through: 'Detalle_Venta', foreignKey: 'ventaId' });

Producto.belongsTo(Imagen, { foreignKey: 'imagenId' });
Imagen.hasMany(Producto, { foreignKey: 'imagenId' });

module.exports = { Producto, Venta, Admin, Imagen, sequelize };