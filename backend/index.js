const express = require('express');
const mysql = require('mysql2');
const app = express();
const PORT = process.env.PORT || 3000;

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

app.get('/', (req, res) => {
    res.send('<h1>Hello World</h1>');
});

app.get('/test', (req, res) => {
    pool.query('SHOW TABLES', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error al consultar la base de datos');
        }

        res.render('test', { tablas: results });
    });
});

app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});