const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Imagen = sequelize.define('Imagen', {
    hash: { type: DataTypes.STRING, allowNull: false },
    extension: { type: DataTypes.STRING, allowNull: false },
}, {
    timestamps: false
});

module.exports = Imagen;