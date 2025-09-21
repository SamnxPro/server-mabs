import express from 'express';
import { check } from'express-validator';
import validarCampos from '../../middlewares/validar.campos.js';
import validarJWT from '../../middlewares/jwt-registros/validar-jwt-seguridad.js';
import loginController from '../../controllers/login/loginMabs.js'

var router = express.Router()



router.get('/login/listar', loginController.listar )

router.post('/cliente',[
    check('correo','el correo es obligatorio').isEmail(),
    check('password','La contraseña es obligatoria').not().isEmpty(),
    validarCampos
], loginController.guardarCliente) 

router.post('inicio/cliente',[
    check('correo','el correo es obligatorio').isEmail(),
    check('password','La contraseña es obligatoria').not().isEmpty(),
    validarCampos
], loginController.guardarAdmin)


router.post('/google',[
    check('id_token','id_token es obligatorio').not().isEmpty(),
    validarCampos
], loginController.googleSingIn)

router.put('/modificar/:id',[
    validarJWT,
    //esTenerRoles('USUARIO','ADMINISTRADOR_ROLE'),

    //esta pendiente el id que me arroje la modificacion 
    check('id', 'No es un ID valido').isMongoId(),

    validarCampos
], loginController.modificar);

router.delete('/login/eliminar/:id',[  
    validarJWT,
    //esTenerRoles('USUARIO','ADMINISTRADOR_ROLE'),
    check('id', 'No es un ID valido').isMongoId(),
    validarCampos
],loginController.eliminar)


export default router