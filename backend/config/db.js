const { Sequelize } = require('sequelize');

const DB_NAME = process.env.DB_NAME || 'autoservicio_gym';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'root';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    dialect: 'mysql',
    port: DB_PORT,
    logging: false
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log(`Conexión a la base de datos MySQL establecida: ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
    }
};

module.exports = { sequelize, connectDB };