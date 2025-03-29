console.clear();
const { constants } = require('buffer');
const express = require('express');
const { Client } = require('pg');
const app = express();
const API_KEY = "AIzaSyAW8hX4eFHiokYjCGSHtYZgTyMXXeXreoY"; // si no funciona notificarse conmigo
const query = 'SELECT * FROM tbl_usuario';
const PORT = 4000;
const axios = require('axios');
app.use(express.json());

const client  = new Client( {
    user: 'postgres',       // Usuario default si es diferente cambiarlo
    host: 'localhost',      // Servidor donde está la base de datos (en este caso, default si es necesario cambiarlo)
    database: 'DB_USUARIOS',    // Nombre de la base de datos a la que se quiere conectar si es necesario cambiarla
    password: 'admin123',            // Contraseña del usuario de PostgreSQL
    port: 5432,             // Puerto en el que se intenta conectar el default es el 5432(esto es un posible error)
});
//await client.connect();

client.connect()
.then (()=>console.log("la conexion de datos fue exitosa"))
.catch(Error=>console.log("Error en la conexion ",Error))

app.listen(PORT, (error) =>
{
    if(!error){
        console.log("server is running")
    }else{
        console.log("server error")
    }
});

client.query(query, (err, res) => {
    if (err) {
        console.error(err);
        return;
    }
    const rows = res.rows
    
        app.get('/User', (req, res) => {
            res.status(200).json(rows);
            console.log("Datos mostrados con exito")
        });

   // client.end();
});

app.get('/api/ruta', async (req, res) => {
    try {
        const {origin, destination } = req.query;

        if (!origin || !destination) {
            return res.status(400).json({ error: "Parametros de origen y destino son requeridos" });
        }

        const [latorigin, lngorigin] = origin.split(',').map(Number);//traformamos las coordenadas de la url en string, ademas se le quitan las comas
        const [latdestination, lngdestination] = destination.split(',').map(Number);

        if (isNaN(latorigin) || isNaN(lngorigin) || isNaN(latdestination) || isNaN(lngdestination)) {//se verifica si no es un numero
            return res.status(400).json({ error: "Formato de coordenadas invalidos'." });
        }
        const url = `https://routes.googleapis.com/directions/v2:computeRoutes?key=${API_KEY}`; 
        const response = await axios.post(url, {
            origin: { location: { latLng: { latitude: latorigin, longitude: lngorigin } } },
            destination: { location: { latLng: { latitude: latdestination, longitude: lngdestination } } },
            travelMode: "DRIVE"
        },{ headers: {
            'Content-Type': 'application/json',
            'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline'}});
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
    }
});

// Middleware para validar las credenciales
const validate = module.exports = (req, res, next) => {
    const { user, password } = req.body;
    if (req.path === "/login") {
        if (!user || !password) {
            return res.status(400).json({
                error: "Faltan credenciales"
            });
        }
    }
    next();
};

// Función para manejar el inicio de sesión
const user_login = async (req, res) => {
    try {
        const { user, password } = req.body;// Se obtienen las credenciales del cuerpo de la solicitud
        const users = await client.query(
            "SELECT usuario, contraseña FROM tbl_usuario WHERE usuario = $1",
            [user]
        );

        if (users.rows.length !== 1) { // Verifica si no hay exactamente un usuario
            return res.status(409).json({
                error: "Lo siento, su usuario no existe",
            });
        } else if (password === users.rows[0].contraseña) { // Verifica si la contraseña es correcta
            res.json({
                message: "Inicio de sesión exitoso"
            });
        } else {// Si la contraseña no es correcta
            res.status(401).json({
                error: "Error al inicio de sesión"
            });
        }
    } catch (error) {// Manejo de errores
        console.log(error.message);
        res.status(500).json({
            error: error.message,
        });
    }
};
// Ruta para el inicio de sesión
app.post("/login", validate, user_login);