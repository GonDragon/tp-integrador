const express = require('express');
const mysql = require('mysql2');
const app = express();
const PORT = process.env.PORT || 3000;

const clientRoutes = require('./routes/client');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');

app.set('view engine', 'ejs');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;
app.use(express.static('public'));

app.use('/', clientRoutes);
app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});