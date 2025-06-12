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
    //___________________________________query para rutas_______________________________________________
    async createRoute(nombreRuta, origin, destination) {
        try {
            const query = 'INSERT INTO rutas (nombre_ruta, origin, destination) VALUES ($1, $2, $3) RETURNING *';//se crea el query para insertar rutas 
            const result = await database.query(query, [nombreRuta, origin, destination]);// se espera el query y se le asigan los parametros 
            return result.rows[0]; //retornamos el objeto en especifico del arreglo
        } catch (error) {
            console.error('Error al crear ruta:', error);// manejo de errores
            throw error;
        }
    }
    // Obtener todas las rutas
    async getAllRoutes() {
        try {
            const query = 'SELECT * FROM rutas ORDER BY nombre_ruta';// query para obtner las rutas por medio de nombre 
            const result = await database.query(query);// se esoera la query 
            return result.rows; // se retorna todo los resultados 
        } catch (error) {
            console.error('Error al obtener rutas:', error);// control de errores 
            throw error;
        }
    }
//actualizar rutas
     async updateRoute(id, newOrigin, newDestination) {
        try {
            const query = 'UPDATE rutas SET origin = $2, destination = $3 WHERE id = $1 RETURNING *';// se crea el query en este caso un update
             const result = await database.query(query, [id, newOrigin, newDestination]);// se le agrega los parametros
            return result.rows[0] || null; // retorna 1 dato del arreglo o puede retornadar null
        } catch (error) {
            console.error('Error al actualizar ruta:', error);// manejo de errores
            throw error;
        }

    }
    //borrar rutas
     async deleteRoute(id) {
        try {
            const query = 'DELETE FROM rutas WHERE id = $1 RETURNING *';// se declara el query con un delete y filtro
            const result = await database.query(query, [id]);// le agregamos parametro
            return result.rows[0] || null;//puede retonar un valor o null
        } catch (error) {
            console.error('Error al eliminar ruta:', error);//manejo de erroes 
            throw error;
        }
    }

    // NUEVO: Obtener ruta por nombre
    async getRouteByName(nombreRuta) {//funcion para obtener el nombre de la ruta
        try {
            const query = 'SELECT * FROM rutas WHERE nombre_ruta = $1';//query para obtener el nombre y flitro 
            const result = await database.query(query, [nombreRuta]);// se espera el query y ase agrega parametros
            return result.rows[0] || null;// retorna ese valor o null 
        } catch (error) {
            console.error('Error al buscar ruta:', error);// manejo de erroes
            throw error;
        }
    }


}

module.exports = new UserRepository();