const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connectDB, sequelize } = require('./config/db');
require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

const clientRoutes = require('./routes/client');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');
const imgProductosRoutes = require('./routes/imgProductos');

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/', clientRoutes);
app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);
app.use('/img/productos', imgProductosRoutes)

app.listen(PORT, async () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    
    await connectDB();
    try {
        await sequelize.sync({ force: false });
        console.log('Tablas sincronizadas correctamente en MySQL');
    } catch (err) {
        console.warn('No se pudo sincronizar las tablas con MySQL — se continuará sin DB:', err.message);
    }
});