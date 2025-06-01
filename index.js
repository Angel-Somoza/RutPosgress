
console.clear();

const express = require('express');
const database = require('./Data/connection');
const authRoutes = require('./CTRL/controllers');
const axios = require('axios');

const app = express();
const PORT = 3000;
const API_KEY = "AIzaSyAW8hX4eFHiokYjCGSHtYZgTyMXXeXreoY";

app.use(express.json());

    app.listen(PORT, (error) =>
    {
        if(!error){
            console.log("server is running")
        }else{
            console.log("server error")
        }
    });

    database.connect();

    app.use('/api/', authRoutes);// app use, para usar los controladores

    app.get('/api/ruta', async (req, res) => {
        try {
            const {origin, destination } = req.query;

            if (!origin || !destination) {
                return res.status(400).json({ error: "Parametros de origen y destino son requeridos" });
            }

            const [latorigin, lngorigin] = origin.split(',').map(Number);//traformamos las coordenadas de la url en string, ademas se le quitan las comas
            const [latdestination, lngdestination] = destination.split(',').map(Number);

            if (isNaN(latorigin) || isNaN(lngorigin) || isNaN(latdestination) || isNaN(lngdestination)) {//se verifica si no es un numero
                return res.status(400).json({ error: "Formato de coordenadas invalidos'." });
            }
            const url = `https://routes.googleapis.com/directions/v2:computeRoutes?key=${API_KEY}`; 
            const response = await axios.post(url, {
                origin: { location: { latLng: { latitude: latorigin, longitude: lngorigin } } },
                destination: { location: { latLng: { latitude: latdestination, longitude: lngdestination } } },
                travelMode: "DRIVE"
            },{ headers: {
                'Content-Type': 'application/json',
                'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline'}});
            res.json(response.data);
        } catch (error) {
            res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
        }
    });


    app.get('/api/traffic', async (req, res) => {
        try {
            const { origin, destination } = req.query;
            if (!origin || !destination) {
                return res.status(400).json({ error: "Parámetros de origen y destino son requeridos" });
            }
            const [latOrigin, lngOrigin] = origin.split(',').map(Number);
            const [latDestination, lngDestination] = destination.split(',').map(Number);
            if (isNaN(latOrigin) || isNaN(lngOrigin) || isNaN(latDestination) || isNaN(lngDestination)) {
                return res.status(400).json({ error: "Formato de coordenadas inválidos" });
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
            res.json({
                mensaje: "Información de tráfico obtenida exitosamente",
                tiempo_salida: departureTimeStr,
                cantidad_rutas: processRoutes.length,
                rutas: processRoutes
            });
            
        } catch (error) {
            console.error("Error complete:", error);
            res.status(error.response?.status || 500).json({ 
                error: "Error al obtener información de tráfico",
                detalles: error.response?.data || error.message
            });
        }
    });

    app.get('/Date', async (req,res) => {
                    res.status(200).json({menssage: "Prueba del get"});
                    console.log("datos mostraddos")
    });

    app.get('/api/geocoding', async (req, res) => {
        try {
            const { address } = req.query;
            
            if (!address) {
                return res.status(400).json({ 
                    error: "Dirección no proporcionada", 
                    mensaje: "Debe proporcionar una dirección para convertir a coordenadas" 
                });
            }
            
            let fullAddress = address;
            if (!address.toLowerCase().includes("guatemala")) {
                fullAddress = `${address}, Guatemala`;
            }
            
            const encodedAddress = encodeURIComponent(fullAddress);
            
            const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&region=gt&components=country:GT&key=${API_KEY}`;
            
            console.log("Enviando solicitud a Geocoding API para Guatemala...");
            
            const response = await axios.get(url);
            
            if (response.data.status !== 'OK') {
                throw new Error(`Error en la API de Google Geocoding: ${response.data.status}`);
            }
            
            const results = response.data.results;
            
            if (results.length === 0) {
                return res.status(404).json({
                    error: "No se encontraron resultados",
                    mensaje: "No se encontraron coordenadas para la dirección proporcionada en Guatemala"
                });
            }
            
            const guatemalaResults = results.filter(result => {
                return result.address_components.some(component => 
                    component.types.includes("country") && 
                    (component.short_name === "GT" || component.long_name.includes("Guatemala"))
                );
            });
            
            if (guatemalaResults.length === 0) {
                return res.status(404).json({
                    error: "No se encontraron resultados en Guatemala",
                    mensaje: "La dirección proporcionada no se encuentra en Guatemala"
                });
            }
            
            const result = guatemalaResults[0];
            const location = result.geometry.location;
            const formattedAddress = result.formatted_address;
            
            const addressComponents = result.address_components;
            
            let departamento = "";
            let municipio = "";
            let colonia = "";
            let calle = "";
            
            addressComponents.forEach(component => {
                if (component.types.includes("administrative_area_level_1")) {
                    departamento = component.long_name;
                }
                if (component.types.includes("administrative_area_level_2") || 
                    component.types.includes("locality")) {
                    municipio = component.long_name;
                }
                if (component.types.includes("sublocality_level_1") || 
                    component.types.includes("sublocality")) {
                    colonia = component.long_name;
                }
                if (component.types.includes("route")) {
                    calle = component.long_name;
                }
            });
            res.json({
                mensaje: "Coordenadas obtenidas exitosamente",
                direccion_original: address,
                direccion_formateada: formattedAddress,
                coordenadas: {
                    latitud: location.lat,
                    longitud: location.lng,
                    formato_para_api: `${location.lat},${location.lng}`
                },
                informacion_guatemala: {
                    departamento: departamento,
                    municipio: municipio,
                    colonia: colonia,
                    calle: calle
                },
                exactitud: result.geometry.location_type,
                precision: result.geometry.viewport ? 
                        Math.max(
                            Math.abs(result.geometry.viewport.northeast.lat - result.geometry.viewport.southwest.lat),
                            Math.abs(result.geometry.viewport.northeast.lng - result.geometry.viewport.southwest.lng)
                        ).toFixed(5) : "No disponible"
            });
            
        } catch (error) {
            console.error("Error completo:", error);
            
            res.status(error.response?.status || 500).json({ 
                error: "Error al obtener coordenadas en Guatemala",
                detalles: error.response?.data || error.message
            });
        }
    });

