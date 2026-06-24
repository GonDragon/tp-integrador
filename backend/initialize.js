const bcrypt = require('bcrypt');
const { connectDB, sequelize } = require('./config/db');
const { Admin } = require('./models');

const initialize = async () => {
    try {
        await connectDB();

        await sequelize.sync({ force: true });
        console.log('Base de datos sincronizada para inicialización.');

        const adminExists = await Admin.findOne({ where: { username: 'admin' } });

        if (!adminExists) {
            console.log('Creando usuario administrador de pruebas');
            const hashedPassword = await bcrypt.hash('admin', 10);
            await Admin.create({
                username: 'admin',
                hash: hashedPassword
            });
            console.log('Usuario administrador creado exitosamente.');
        } else {
            console.log('Ya existe el usuario administrador.');
        }
        
        console.log('Inicialización completada con éxito.');
    } catch (error) {
        console.error('Error durante la inicialización:', error);
    } finally {
        await sequelize.close();
    }
};

initialize();
