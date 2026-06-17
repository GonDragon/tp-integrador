const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Producto = sequelize.define('Producto', {
    nombre: { type: DataTypes.STRING, allowNull: false },
    detalles: { type: DataTypes.TEXT, allowNull: false },
    precio: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    imagen: { type: DataTypes.STRING, allowNull: true },
    categoria: { type: DataTypes.STRING, allowNull: false }, 
    activo: { type: DataTypes.BOOLEAN, defaultValue: true } 
}, {
    timestamps: false
});

module.exports = Producto;