const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('autoservicio_gym', 'root', 'root', {
    host: 'mysql_db',
    dialect: 'mysql',
    port: 3306,
    logging: false 
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('¡Conexión a la base de datos MySQL en Docker establecida con éxito!');
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
    }
};

module.exports = { sequelize, connectDB };