const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const VentaProducto = sequelize.define('VentaProducto', {
    ventaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Venta',
            key: 'id'
        }
    },
    productoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Producto',
            key: 'id'
        }
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    precioUnitario: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    tableName: 'VentaProducto',
    timestamps: false
});

module.exports = VentaProducto;
