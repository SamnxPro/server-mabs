import express from 'express';
import { check } from 'express-validator';
import validarCampos from '../../middlewares/validar.campos.js';
import { esRoleValido } from '../../helpers/db-validator.js'
import registroClientes from '../../controllers/registro-cliente/registroController.js' 
import verficacionTokens from '../../controllers/verificarToken/verificacionTokenRgis.js'
import { esCorreoValido } from '../../helpers/db-validator.js';
import ArbolReferidos from '../../controllers/arbol de referidos/referidosControllers.js';
import verficacionRef from '../../controllers/verificarToken/verificacionTokenRefer.js';
import validarJWT from '../../middlewares/jwt-registros/validar-jwt-seguridad.js';
import NvlController from '../../controllers/comisiones/nivelController.js'
import validarJwtReferidos from '../../middlewares/jwt-referidos/validar-jwt-referidos.js';


var router = express.Router()


router.get('/listarRefere/:userId',[
    validarJWT
    
], ArbolReferidos.ListarReferidos )

router.get('/enlace/:commissionLevel',[
    validarJWT
    
], ArbolReferidos.generarEnlaceReferido )

router.post('/enlaceVer/:token',[ 
    check('nombre_cliente', 'El nombre cliente es obligatoria').not().isEmpty(),
    check('apellido', 'El apellido es obligatorio').not().isEmpty(),
    check('correo', 'correo no es valido').isEmail(),
    check('correo', ).custom(esCorreoValido),
    check('password', 'contraseña no es valido').isLength({ min: 6}),
    check('telefono', ' El telefono es obligatorio').not().isEmpty(),
    validarJwtReferidos
], verficacionRef.verificarReferido )


router.post('/comisiones',[
    check('NombreLevel', 'El nombre de la generacion es obligatoria').not().isEmpty(),
    validarJWT
], NvlController.guardarNivelesyGeneracion )

export default router;