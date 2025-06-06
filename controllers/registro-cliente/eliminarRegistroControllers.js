import { response } from 'express';
import Regis from '../../models/RegistroClientes/regisClientes.js';
import { generarJWT } from '../../helpers/generar-jwt.js';
import nodemailer  from 'nodemailer'
import bcryptjs from "bcryptjs"
import crypto from 'crypto'
import envio from '../logica-email/envioClienteVeri.js'

  
var registrousu = {
   
    InactivoUsu: async (req, res = response) => {

            try {
        const { id } = req.params;  // Puedes usar id o correo según tu modelo
        const { estado } = req.body;  // Suponiendo que en el body se pasa el estado (en este caso, 'inactivo')

        // Validación para asegurarse de que el estado sea 'inactivo'
        if (estado !== 'true') {
            return res.status(400).json({
                msg: 'El valor del estado debe ser "inactivo" para desactivar al usuario.'
            });
        }

        // Buscar y actualizar el estado del usuario
        const usuarioInactivado = await Regis.findByIdAndUpdate(
            id,  // Buscar por el id del usuario
            { estado: 'false' },  // Cambiar el estado a 'inactivo'
            { new: true }  // Esto devolverá el documento actualizado
        );

        // Verificar si el usuario no existe
        if (!usuarioInactivado) {
            return res.status(404).json({
                msg: 'Usuario no encontrado'
            });
        }

        // Responder con éxito
        res.status(200).json({
            msg: 'Usuario inactivado correctamente',
            usuarioInactivado
        });

    } catch (error) {
        console.error("Error en la operación:", error);
        res.status(500).json({
            error: "Error al intentar inactivar el usuario"
        });
    }
    }
}

export default registrousu