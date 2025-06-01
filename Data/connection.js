// config/database.js
const { Client } = require('pg');

class Database {
    constructor() {
        this.client = new Client({
            user: 'postgres',
            host: 'localhost',
            database: 'scolegio',
            password: '1234',
            port: 5432,
        });
        
        this.isConnected = false;
    }

    async connect() {
        try {
            if (!this.isConnected) {
                await this.client.connect();
                this.isConnected = true;
                console.log("conexion a la base de datos exitosa");
                
                this.client.on('error', (err) => {
                    console.error(' Error de conexion:', err);
                    this.isConnected = false;
                    setTimeout(() => this.connect(), 2000);
                });
            }
        } catch (error) {
            console.error("Error al conectar :", error);
            this.isConnected = false;
            setTimeout(() => this.connect(), 2000);// reitentar la conexionen dos segundos
        }
    }

    async query(text, params) {
        try {
            if (!this.isConnected) {
                await this.connect();
            }
            return await this.client.query(text, params);
        } catch (error) {
            console.error( " Error en consulta:" , error);
            throw error;
        }
    }

    async disconnect() {
        try {
            if (this.isConnected) {
                await this.client.end();
                this.isConnected = false;
                console.log("🔌 Conexion cerrada");
            }
        } catch (error) {
            console.error("Error al cerrar conexion:" ,error);
        }
    }
}

const database = new Database();
module.exports = database;