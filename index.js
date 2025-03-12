const { constants } = require('buffer');
const express = require('express');
const { Client } = require('pg');
const app = express();
const API_KEY = "AIzaSyCkPuDJRnH8fNOVAwu1i5Pu_CJrt_TwAco"; 
const query = 'SELECT * FROM ruta'
const PORT = 4000;
app.use(express.json());

const client  = new Client( {
    user: 'postgres',       // Usuario default si es diferente cambiarlo
    host: 'localhost',      // Servidor donde está la base de datos (en este caso, default si es necesario cambiarlo)
    database: 'Ruta',       // Nombre de la base de datos a la que se quiere conectar si es necesario cambiarla
    password: '',       // Contraseña del usuario de PostgreSQL
    port: 3000,             // Puerto en el que se intenta conectar el default es el 5432(esto es un posible error)
});

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

    client.end();
});

app.get('/api/ruta', async (req, res) => {
    try {
        const { origen, destino } = req.query;

        const url = `https://routes.googleapis.com/directions/v2:computeRoutes?key=${API_KEY}`;
        const response = await axios.post(url, {
            origin: {
                location: { latLng: { latitude: parseFloat(origen.split(',')[0]), longitude: parseFloat(origen.split(',')[1]) } }
            },
            destination: {
                location: { latLng: { latitude: parseFloat(destino.split(',')[0]), longitude: parseFloat(destino.split(',')[1]) } }
            },
            travelMode: "DRIVE"
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

