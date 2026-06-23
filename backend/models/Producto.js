/**
 * Modelo Producto
 * Representa un producto del catálogo con atributos básicos:
 * - `nombre`, `detalles`, `precio`, `categoria`, `activo` y relación con `Imagen`.
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Imagen = require('./Imagen');

const Producto = sequelize.define('Producto', {
    nombre: { type: DataTypes.STRING, allowNull: false },
    detalles: { type: DataTypes.TEXT, allowNull: false },
    precio: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    imagenId: { type: DataTypes.INTEGER, allowNull: true, references: { model: Imagen, key: 'id' }},
    categoria: { type: DataTypes.STRING, allowNull: false },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true } 
}, {
    timestamps: false
});

module.exports = Producto;