const express = require('express');
const authController = require('../Logic/login_controller');
const routeController = require('../Logic/RouteController');


const router = express.Router();
//endpoint Post para el login
router.post('/login', authController.login.bind(authController));
//endpoint Post para el register
router.post('/register', authController.register);
// crud de rutas
//endpoint para obtener las rutas
router.get('/routes', routeController.getAllRoutes);
//endpoint para insetar rutas
router.post('/routes', routeController.createRoute);
//endpoint para actualizar nombre
router.put('/routes/:nombre', routeController.updateRoute);
//endpoint para borrar nombre
router.delete('/routes/:nombre', routeController.deleteRoute);
//endpoint trafico
router.get('/routes/traffic', routeController.getAllRoutesWithTraffic);
router.get('/routes/traffic/:nombre', routeController.getRouteWithTraffic);


module.exports = router;