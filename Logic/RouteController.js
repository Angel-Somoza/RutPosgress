const routeTrafficService = require('../Logic/TrafficService');

class RouteController {
    
    // Obtener todas las rutas CON información de tráfico
    async getAllRoutesWithTraffic(req, res) {
        try {
            console.log('📍 Obteniendo todas las rutas con información de tráfico...');
            
            const routes = await routeTrafficService.getAllRoutesWithTraffic();
            
            res.status(200).json({
                success: true,
                mensaje: "Rutas con información de tráfico obtenidas exitosamente",
                cantidad: routes.length,
                rutas: routes
            });

        } catch (error) {
            console.error("Error al obtener rutas con tráfico:", error);
            res.status(500).json({
                success: false,
                error: "Error al obtener rutas con información de tráfico",
                detalles: error.message
            });
        }
    }

    // Obtener una ruta específica CON tráfico
    async getRouteWithTraffic(req, res) {
        try {
            const { nombre } = req.params;
            
            const route = await routeTrafficService.getRouteWithTraffic(nombre);
            
            res.status(200).json({
                success: true,
                mensaje: "Ruta con información de tráfico obtenida exitosamente",
                ruta: route
            });

        } catch (error) {
            console.error("Error al obtener ruta con tráfico:", error);
            
            let statusCode = 500;
            if (error.message.includes('no encontrada')) {
                statusCode = 404;
            }
            
            res.status(statusCode).json({
                success: false,
                error: "Error al obtener ruta con tráfico",
                detalles: error.message
            });
        }
    }

    // Obtener todas las rutas (sin tráfico)
    async getAllRoutes(req, res) {
        try {
            const routes = await routeTrafficService.getAllRoutes();
            
            res.status(200).json({
                success: true,
                mensaje: "Rutas obtenidas exitosamente",
                cantidad: routes.length,
                rutas: routes
            });

        } catch (error) {
            console.error("Error al obtener rutas:", error);
            res.status(500).json({
                success: false,
                error: "Error al obtener las rutas"
            });
        }
    }

    // Crear nueva ruta
    async createRoute(req, res) {
        try {
            const { nombre_ruta, origin, destination } = req.body;
            
            if (!nombre_ruta || !origin || !destination) {
                return res.status(400).json({
                    success: false,
                    error: "Nombre de ruta, origen y destino son requeridos"
                });
            }

            const route = await routeTrafficService.createRoute(nombre_ruta, origin, destination);
            
            res.status(201).json({
                success: true,
                mensaje: "Ruta creada exitosamente",
                ruta: route
            });

        } catch (error) {
            console.error("Error al crear ruta:", error);
            res.status(400).json({
                success: false,
                error: "Error al crear la ruta",
                detalles: error.message
            });
        }
    }

    // Actualizar ruta
    async updateRoute(req, res) {
        try {
            const { id  } = req.params;
            const { origin, destination } = req.body;
            
            if (!origin || !destination) {
                return res.status(400).json({
                    success: false,
                    error: "Origen y destino son requeridos"
                });
            }
            
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: "ID debe ser un número válido"
                });
            }
            const route = await routeTrafficService.updateRoute(id , origin, destination);
            
            if (!route) {
                return res.status(404).json({
                    success: false,
                    error: "Ruta no encontrada"
                });
            }
            
            res.status(200).json({
                success: true,
                mensaje: "Ruta actualizada exitosamente",
                ruta: route
            });

        } catch (error) {
            console.error("Error al actualizar ruta:", error);
            res.status(500).json({
                success: false,
                error: "Error al actualizar la ruta",
                detalles: error.message
            });
        }
    }

    // Eliminar ruta
   async deleteRoute(req, res) {
        try {
            const { id } = req.params;  
            
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: "ID debe ser un número válido"
                });
            }
            
            const deleted = await routeTrafficService.deleteRoute(parseInt(id));
            
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    error: "Ruta no encontrada"
                });
            }
            
            res.status(200).json({
                success: true,
                mensaje: "Ruta eliminada exitosamente",
                ruta_eliminada: deleted
            });

        } catch (error) {
            console.error("Error al eliminar ruta:", error);
            res.status(500).json({
                success: false,
                error: "Error al eliminar la ruta"
            });
        }
    }
}


module.exports = new RouteController();