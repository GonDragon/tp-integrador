const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Venta = sequelize.define('Venta', {
    nombre_cliente: { type: DataTypes.STRING, allowNull: false },
    fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    total: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
}, {
    timestamps: false
});

module.exports = Venta;