const express = require('express');
const router = express.Router();
const ventasCtrl = require('../controladores/ventasCtrl');

// Definimos el endpoint POST que consumirá Ionic
router.post('/procesar', ventasCtrl.procesarNuevaVenta);

module.exports = router;