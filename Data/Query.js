const database = require('../Data/connection');

class UserRepository {
    //querys
    //consulta de usuarios
    async findByUsername(username) {
        try {
            const query = 'SELECT id, usuario, contraseña FROM usuario WHERE usuario = $1';// aca hacemos un variable query, el cual 
            // tiene la consulta
            const result = await database.query(query, [username]);// hacemos variable para almacenar el resultado
            // donde espera al valor de database, usamos la funcion query y mandamos los parametros
            return result.rows[0] || null;
        } catch (error) {
            console.error( error);
        }
    }



    // manejo de las query de arriba
    // Verificar si el usuario ya existe en la base de datos
    async exists(username) {
        try {
            const user = await this.findByUsername(username);
            return user !== null;
        } catch (error) {
            console.error(error);
        }
    }

  async createUser(userData) {//funcion para crear el usuario 
        try {
            const query = 'INSERT INTO usuario (usuario, contraseña) VALUES ($1, $2) RETURNING id, usuario'; //query a utilizar par la insercion en la base de datos
            const result = await database.query(query, [userData.usuario, userData.contraseña]);//esperamos la query, con los parametos de usaurio y contrasena
            return result.rows[0];
        } catch (error) {// manejo de erroes
            console.error('Error al crear usuario:', error);
            throw error;
        }
    }

}

module.exports = new UserRepository();