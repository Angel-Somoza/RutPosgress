const { constants } = require('buffer');
const express = require('express');
const { Client } = require('pg');
const app = express();
const PORT = 4000;
app.use(express.json());

const query = 'SELECT * FROM ruta'



const client  = new Client( {
    user: 'postgres',       // Usuario de PostgreSQL
    host: 'localhost',      // Servidor donde está la base de datos (en este caso, local)
    database: 'Ruta',       // Nombre de la base de datos a la que se quiere conectar
    password: '1234',       // Contraseña del usuario de PostgreSQL
    port: 3000,             // Puerto en el que se intenta conectar (esto es un posible error)
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

