import express from 'express';
import { check } from 'express-validator';
import validarCampos from '../middlewares/validar.campos.js';
import { esRoleValido } from '../helpers/db-validator.js'
import registroClientes from '../controllers/registro-cliente/registroController.js' 
import verficacionTokens from '../controllers/verificarToken/verificacionTokenRgis.js'
import { esCorreoValido } from '../helpers/db-validator.js';
import ArbolReferidos from '../controllers/arbol de referidos/referidosControllers.js';
import verficacionRef from '../controllers/verificarToken/verificacionTokenRefer.js';




var router = express.Router()

router.get('/enlace/:id/:token',[
], ArbolReferidos.generarEnlaceReferido )

router.get('/enlaceVer/:id/:token',[
], verficacionRef.verificarReferido )


export default router;