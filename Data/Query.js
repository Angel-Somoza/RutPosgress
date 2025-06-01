const database = require('../Data/connection');

class UserRepository {
    //consulta de usuarios
    async findByUsername(username) {
        try {
            const query = 'SELECT id, usuario, contraseña FROM usuario WHERE usuario = $1';
            const result = await database.query(query, [username]);
            return result.rows[0] || null;
        } catch (error) {
            console.error( error);
        }
    }


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