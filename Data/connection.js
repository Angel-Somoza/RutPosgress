// config/database.js
const { Client } = require('pg');

class Database {// clase de base de dato 
    constructor() {// el construtctor almacena lo que es la conexion de la base de datos
        this.client = new Client({
            user: 'postgres',
            host: 'localhost',
            database: 'scolegio',
            password: '1234',
            port: 5432,
        });
        
        this.isConnected = false;
    }

    async connect() {// hacemos un valor asincrono
        try {// valiamos con try catch
            if (!this.isConnected) { //si no esta conetada
                await this.client.connect(); //espera el client conect
                this.isConnected = true;// se activa la variable isconeted en verdadero
                console.log("conexion a la base de datos exitosa");
                
                this.client.on('error', (err) => { // validamos el error
                    console.error(' Error de conexion:', err);
                    this.isConnected = false;// si hay error colocamos la conexion en falso
                    setTimeout(() => this.connect(), 2000); // intervalo de dos segundo por si falla
                });
            }
        } catch (error) {// exepecion 
            console.error("Error al conectar :", error);
            this.isConnected = false;// si hay error, es false la conexion
            setTimeout(() => this.connect(), 2000);// reitentar la conexionen dos segundos
        }
    }

    async query(text, params) {// variable asicrona
        try {
            if (!this.isConnected) {// si no esta conectada
                await this.connect(); // esperamos el metodo connect 
            }
            return await this.client.query(text, params); // retornamos dos valores en el query 
        } catch (error) {
            console.error( " Error en consulta:" , error);// manejo de errores 
            throw error;
        }
    }

    async disconnect() {
        try {
            if (this.isConnected) {//cuando la conexion sea verdadera
                await this.client.end(); // esperamos un cliente end
                this.isConnected = false;// cerramos la conexio     
                console.log("Conexion cerrada");
            }
        } catch (error) {
            console.error("Error al cerrar conexion:" ,error);
        }
    }
}

const database = new Database();// constante data, que instancia la clase data base
module.exports = database; // y agremos a los modules expo