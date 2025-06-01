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