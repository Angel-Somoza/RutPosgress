// services/authService.js
const userRepository = require('../Data/Query');

class AuthService {
    
    async validateCredentials(username, password) {
        if (!username || !password) {
            throw new Error('Usuario y contraseña son requeridos');
        }

        if (username.trim().length === 0 || password.trim().length === 0) {
            throw new Error('Usuario y contraseña estan vacios');
        }

        return true;
    }

    // Proceso del login
    async login(username, password) {
        try {
            console.log(`🔐 Procesando login para usuario: ${username}`);

            await this.validateCredentials(username, password);

            const user = await userRepository.findByUsername(username);// llamamos al nombre de usuario
            
            if (!user) {
                console.log(`Usuario no encontrado: ${username}`);
                throw new Error('Credenciales incorrectas');
            }

            if (user.contraseña !== password) {
                console.log(`Contraseña incorrecta para usuario: ${username}`);
                throw new Error('Credenciales incorrectas');
            }

            const userData = {
                id: user.id,
                nombre: user.usuario,
                usuario: user.usuario
            };

            console.log(`login exitoso para usuario: ${username}`);
            return userData;

        } catch (error) {
            console.error('Error', error.message);
            throw error; 
        }
    }
    // manejo de la funcion resgister
      async register(usuario, password) {//con dos parametros
        try {
            //espera la funcion para validar las credenciales si son o no vacias
            await this.validateCredentials(usuario, password);

            // Validacion para que el usuario tenga almenos 8 caracteres 
            if (usuario.length < 8) {
                throw new Error('El usuario debe tener al menos 8 caracteres');
            }
            // Validacion para que el contrasena tenga almenos 8 caracteres 
            if (password.length < 8) {
                throw new Error('La contraseña debe tener al menos 8 caracteres');
            }

            // Verificar si el usuario ya existe
            const userExists = await userRepository.exists(usuario);
            if (userExists) {
                throw new Error('El usuario ya existe');
            }

            // Crear el nuevo usuario
            const userData = {
                usuario: usuario,
                contraseña: password
            };

            const newUser = await userRepository.createUser(userData);//esperamos la fucion que crea el usuario

            const responseData = {
                id: newUser.id,
                usuario: newUser.usuario
            };

            console.log(`Registro exitoso para usuario: ${usuario}`);
            return responseData;

        } catch (error) {
            console.error('Error en registro:', error.message);
            throw error;
        }
    }

    async userExists(username) {
        try {
            return await userRepository.exists(username);
        } catch (error) {
            console.error(' Error:', error.message);
            throw new Error('Error al verificar usuario');
        }
    }


}

module.exports = new AuthService();