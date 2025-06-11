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

}

module.exports = new UserRepository();