const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = 3000;

// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));

// Configurar la conexión a PostgreSQL
const pool = new Pool({
    user: 'postgres', // usuario de PostgreSQL
    host: 'localhost',
    database: 'Scolegio', // npmbre base de datos
    password: 'marcogh3141.', // contraseña de PstgreSQL
    port: 5432,
});

// Ruta para la página de inicio de sesión
app.get('/', (req, res) => {
    res.render('login'); // Renderiza la vista login.ejs
});

// Ruta para procesar el formulario de inicio de sesión
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Email y contraseña son obligatorios');
    }

    try {
        const query = 'SELECT * FROM usuarios WHERE email = $1';
        const result = await pool.query(query, [email]);

        if (result.rows.length > 0) {
            const usuario = result.rows[0];

       
            const match = await bcrypt.compare(password, usuario.password); 
            if (match) {
                res.render('dashboard', { usuario });
            } else {
                res.status(401).send('Credenciales incorrectas');
            }
        } else {
            res.status(404).send('Usuario no registrado');
        }
    } catch (err) {
        console.error('Error en la consulta a la base de datos:', err);
        res.status(500).send('Error en el servidor');
    }
});

// Ruta para la vista de dashboard (solo accesible después de autenticación)
app.get('/dashboard', (req, res) => {
    res.render('dashboard'); // Renderiza la vista dashboard.ejs
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});