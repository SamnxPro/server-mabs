import { response } from 'express';
import Regis from '../../models/RegistroClientes/regisClientes.js';
import { generarJWT } from '../../helpers/generar-jwt-registros/generar-jwt.js';
import nodemailer from 'nodemailer'
import bcryptjs from "bcryptjs";
import crypto from 'crypto';
import envio from '../logica-email/envioClienteVeri.js'
import RegistrarRelacionReferido from '../../controllers/arbol de referidos/referidosControllers.js'


const dominiosPermitidos = ['hotmail.com', 'gmail.com', 'yahoo.com'];



const validarDominio = (correo) => {
    const dominio = correo.split('@')[1];
    return dominiosPermitidos.includes(dominio);
};



var registrousu = {

    listar: async (req, res) => {


        try {
            // Define el filtro para incluir solo USUARIO y ADMINISTRADOR
            const query = { rol: { $in: ['CLIENTE', 'ADMINISTRADOR'] } };

            // Obtiene todos los registros que cumplen con el filtro
            const registr = await Regis.find(query);
            const total = await Regis.countDocuments(query);

            // Envía los registros como respuesta en formato JSON
            res.status(200).json({
                msg: 'Listado registros',
                total,
                registr,
            });
        } catch (error) {
            console.error('Error en la operación:', error);
            res.status(500).json({
                error: 'Hubo un error en la operación',
            });
        }
    },
    guardarRegistro: async (req, res = response) => {
        try {
            const params = req.body;

            // 1. Validar dominio
            if (!validarDominio(params.correo)) {
                return res.status(400).json({
                    msg: 'Correo electrónico inválido. Debe ser de uno de los siguientes dominios: @hotmail.com, @gmail.com, @yahoo.com'
                });
            }

            // 2. Token de verificación
            const tokenVerificacion = crypto.randomBytes(32).toString('hex');

            // 3. Crear instancia del usuario
            const registro = new Regis({
                nombre_cliente: params.nombre_cliente,
                apellido: params.apellido,
                correo: params.correo,
                password: params.password,
                img: null,
                telefono: params.telefono,
                fecha_nacimiento: new Date(params.fecha_nacimiento),
                rol: 'CLIENTE',
                refererId: params.usuarioId,
                tokenVerificacion
            });

            // 4. Encriptar contraseña
            const salt = bcryptjs.genSaltSync(10);
            registro.password = bcryptjs.hashSync(params.password.toString(), salt);

            let guardarApi;

            try {
                // 5. Guardar usuario en BD
                guardarApi = await registro.save();
            } catch (err) {
                if (err.code === 11000) {
                    // ⚠️ Duplicidad (correo único)
                    return res.status(400).json({
                        msg: "El correo ya está registrado. Intenta con otro.",
                        error: err.keyValue
                    });
                }
                throw err; // otro error inesperado
            }

            // 6. URL de verificación
            const url = `http://localhost:8080/api/verificar/${tokenVerificacion}`;

            // 7. Enviar correo
            const mailOptions = {
                from: params.user,
                to: params.correo,
                subject: 'Verificación de correo electrónico',
                text: `Por favor, verifica tu correo electrónico haciendo clic en el siguiente enlace: ${url}`
            };

            await envio.sendMail(mailOptions);

            // 8. Respuesta final
            res.status(200).json({
                msg: 'Registro Exitoso. Se ha enviado un correo electrónico de verificación.',
                guardarApi
            });

        } catch (error) {
            console.error("Error en la operación:", error);
            res.status(500).json({
                error: "Verificar el flujo - token"
            });
        }
    },



};

export default registrousu;
