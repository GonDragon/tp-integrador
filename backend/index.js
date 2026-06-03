const express = require('express');
const cors = require('cors');
const { connectDB, sequelize } = require('./config/db');
require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
      res.send('<h1>API del Autoservicio Gym conectada</h1>');
});
        
const rutasProductos = require('./routes/productos');
app.use('/api/productos', rutasProductos);

app.listen(PORT, async () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    
    await connectDB();
    
    await sequelize.sync({ force: false });
    console.log('Tablas sincronizadas correctamente en MySQL');
});