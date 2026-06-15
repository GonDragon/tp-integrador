const Producto = require('./Producto');
const Venta = require('./Venta');
const Admin = require('./Admin');
const { sequelize } = require('../config/db');

Producto.belongsToMany(Venta, { through: 'Detalle_Venta', foreignKey: 'productoId' });
Venta.belongsToMany(Producto, { through: 'Detalle_Venta', foreignKey: 'ventaId' });

module.exports = { Producto, Venta, Admin, sequelize };