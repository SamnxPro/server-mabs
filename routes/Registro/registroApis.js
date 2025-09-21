import express from 'express';
import { check } from 'express-validator';
import validarCampos from '../../middlewares/validar.campos.js';
import { esRoleValido, rolAdmin } from '../../helpers/db-validator.js'
import registroClientes from '../../controllers/registro-cliente/registroController.js' 
import verficacionTokens from '../../controllers/verificarToken/verificacionTokenRgis.js'
import { esCorreoValido } from '../../helpers/db-validator.js';
import validarJWT from '../../middlewares/jwt-registros/validar-jwt-seguridad.js';




var router = express.Router()

//listar los registro



router.get('/verificar/:token',[
], verficacionTokens.verificarCorreo)


router.get('/registro/listarRegistro', [

   
], registroClientes.listar)

router.post('/registro',[
    //validacion de campos

    check('nombre_cliente', 'El nombre cliente es obligatoria').not().isEmpty(),
    check('apellido', 'El apellido es obligatorio').not().isEmpty(),
    check('correo', 'correo no es valido').isEmail(),
    check('correo', ).custom(esCorreoValido),
    check('password', 'contraseña no es valido').isLength({ min: 6}),
    check('telefono', ' El telefono es obligatorio').not().isEmpty(),
    //check('rol', 'No es un rol valido').isIn(['ADMIN_ROLE', 'USER_ROLE']),
    check('rol', ).custom( esRoleValido),
    validarCampos,
], registroClientes.guardarRegistro)

router.put('/inactivousuario/:id',[
    //validacion de campos

    check('nombre_cliente', 'El nombre cliente es obligatoria').not().isEmpty(),
    check('apellido', 'El apellido es obligatorio').not().isEmpty(),
    check('correo', 'correo no es valido').isEmail(),
    check('correo', ).custom(esCorreoValido),
    check('password', 'contraseña no es valido').isLength({ min: 6}),
    check('telefono', ' El telefono es obligatorio').not().isEmpty(),
    //check('rol', 'No es un rol valido').isIn(['ADMIN_ROLE', 'USER_ROLE']),
    check('rol', ).custom( rolAdmin),
    validarCampos,
    validarJWT
], registroClientes.guardarRegistro)



export default router;