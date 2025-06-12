const axios = require('axios');
const userRepository = require('../Data/Query');

// Asegúrate de que API_KEY esté definida
const API_KEY = "AIzaSyAW8hX4eFHiokYjCGSHtYZgTyMXXeXreoY";

class RouteTrafficService {
    
    // Obtener información de tráfico para coordenadas específicas (IGUAL AL QUE FUNCIONA)
    async getTrafficInfo(origin, destination) {
        try {
            if (!origin || !destination) {
                return null;
            }
            
            const [latOrigin, lngOrigin] = origin.split(',').map(Number);
            const [latDestination, lngDestination] = destination.split(',').map(Number);
            
            if (isNaN(latOrigin) || isNaN(lngOrigin) || isNaN(latDestination) || isNaN(lngDestination)) {
                return null;
            }
            
            const futureTime = new Date();
            futureTime.setMinutes(futureTime.getMinutes() + 5); 
            const departureTimeStr = futureTime.toISOString();
            
            const url = `https://routes.googleapis.com/directions/v2:computeRoutes?key=${API_KEY}`; 
            
            const response = await axios.post(url, {
                origin: { location: { latLng: { latitude: latOrigin, longitude: lngOrigin } } },
                destination: { location: { latLng: { latitude: latDestination, longitude: lngDestination } } },
                travelMode: "DRIVE",
                routingPreference: "TRAFFIC_AWARE",
                computeAlternativeRoutes: true,
                departureTime: departureTimeStr 
            }, { 
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline,routes.travelAdvisory'
                }
            });
            
            if (!response.data.routes || response.data.routes.length === 0) {
                return null;
            }

            // Procesar TODAS las rutas como en tu código original
            const processRoutes = response.data.routes.map(route => {
                let durationMinutes = 0;
                if (route.duration) {
                    durationMinutes = Math.round(parseInt(route.duration.replace('s', '')) / 60);
                }
                const distanceKm = route.distanceMeters / 1000;
                const averageSpeed = distanceKm / (durationMinutes / 60);
                
                let congestionLevel = "Normal";
                if (averageSpeed < 15) congestionLevel = "Muy congestionado";
                else if (averageSpeed < 30) congestionLevel = "Congestionado";
                else if (averageSpeed < 50) congestionLevel = "Moderado";
                
                let trafficWarnings = [];
                if (route.travelAdvisory) {
                    if (route.travelAdvisory.tollInfo) {
                        trafficWarnings.push("La ruta incluye peajes");
                    }
                    if (route.travelAdvisory.speedReadingIntervals && route.travelAdvisory.speedReadingIntervals.length > 0) {
                        const speeds = route.travelAdvisory.speedReadingIntervals.map(interval => {
                            return {
                                velocidad_kmh: (interval.speed * 3.6).toFixed(1),
                                inicio: interval.startPolylinePointIndex,
                                fin: interval.endPolylinePointIndex
                            };
                        });
                        trafficWarnings.push(`Información de velocidad disponible para ${speeds.length} segmentos`);
                    }
                }
                
                return {
                    distancia_km: distanceKm.toFixed(2),
                    duracion_minutos: durationMinutes,
                    velocidad_promedio_kmh: Math.round(averageSpeed),
                    nivel_congestion: congestionLevel,
                    polilinea: route.polyline ? route.polyline.encodedPolyline : null,
                    advertencias: trafficWarnings
                };
            });

            // Devolver en el mismo formato que tu endpoint original
            return {
                mensaje: "Información de tráfico obtenida exitosamente",
                tiempo_salida: departureTimeStr,
                cantidad_rutas: processRoutes.length,
                rutas: processRoutes
            };

        } catch (error) {
            console.error("Error complete:", error);
            return null;
        }
    }

    // Obtener todas las rutas CON información de tráfico
    async getAllRoutesWithTraffic() {
        try {
            const routes = await userRepository.getAllRoutes();
            
            if (!routes || routes.length === 0) {
                return [];
            }

            const routesWithTraffic = [];

            for (const route of routes) {
                console.log(`🔍 Consultando tráfico para: ${route.nombre_ruta}`);
                
                const trafficInfo = await this.getTrafficInfo(route.origin, route.destination);
                
                const routeData = {
                    id: route.id,
                    nombre_ruta: route.nombre_ruta,
                    origin: route.origin,
                    destination: route.destination,
                    fecha_creacion: route.fecha_creacion,
                    trafico: trafficInfo || {
                        mensaje: "Error al obtener información de tráfico",
                        tiempo_salida: new Date().toISOString(),
                        cantidad_rutas: 0,
                        rutas: []
                    }
                };

                routesWithTraffic.push(routeData);
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            return routesWithTraffic;

        } catch (error) {
            console.error('Error al obtener rutas con tráfico:', error);
            throw error;
        }
    }

    // Obtener una ruta específica CON tráfico
    async getRouteWithTraffic(nombreRuta) {
        try {
            const route = await userRepository.getRouteByName(nombreRuta);
            
            if (!route) {
                throw new Error(`Ruta '${nombreRuta}' no encontrada`);
            }

            const trafficInfo = await this.getTrafficInfo(route.origin, route.destination);

            return {
                id: route.id,
                nombre_ruta: route.nombre_ruta,
                origin: route.origin,
                destination: route.destination,
                fecha_creacion: route.fecha_creacion,
                trafico: trafficInfo || {
                    mensaje: "Error al obtener información de tráfico",
                    tiempo_salida: new Date().toISOString(),
                    cantidad_rutas: 0,
                    rutas: []
                }
            };

        } catch (error) {
            console.error('Error al obtener ruta con tráfico:', error);
            throw error;
        }
    }

    // CRUD de rutas
    async createRoute(nombreRuta, origin, destination) {
        try {
            return await userRepository.createRoute(nombreRuta, origin, destination);
        } catch (error) {
            if (error.message && error.message.includes('duplicate key')) {
                throw new Error('Ya existe una ruta con ese nombre');
            }
            throw error;
        }
    }

    async updateRoute(id, newOrigin, newDestination) {
        return await userRepository.updateRoute(id, newOrigin, newDestination);
    }

    async deleteRoute(id) {
        return await userRepository.deleteRoute(id);
    }

    async getAllRoutes() {
        return await userRepository.getAllRoutes();
    }
}

module.exports = new RouteTrafficService();