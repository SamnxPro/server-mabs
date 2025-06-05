import { response } from 'express';
import Regis from '../../models/RegistroClientes/regisClientes.js';
import { generarJWT } from '../../helpers/generar-jwt.js';
import nodemailer  from 'nodemailer'
import bcryptjs from "bcryptjs"
import crypto from 'crypto'
import envio from './envioClienteVeri.js'
const dominiosPermitidos = ['hotmail.com', 'gmail.com', 'yahoo.com'];

const validarDominio = (correo) => {
    const dominio = correo.split('@')[1];
    return dominiosPermitidos.includes(dominio);
};


  
var registrousu = {
    
     listar: async (req, res) => {
    
    
            try {
                // Define el filtro para incluir solo USUARIO y ADMINISTRADOR
                const query = { rol: { $in: ['USUARIO', 'ADMINISTRADOR'] } };
    
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
        
                if (!validarDominio(params.correo)) {
                    return res.status(400).json({
                        msg: 'Correo electrónico inválido. Debe ser de uno de los siguientes dominios: @hotmail.com, @gmail.com, @yahoo.com'
                    });
                }
        
                const tokenVerificacion = crypto.randomBytes(32).toString('hex');

                const registro = new Regis({
                
                    nombre_cliente: params.nombre_cliente,
                    apellido: params.apellido,
                    correo: params.correo,
                    password: params.password,
                    telefono: params.telefono,
                    fecha_nacimiento: new Date(params.fecha_nacimiento),
                    rol: 'CLIENTE',
                    tokenVerificacion: tokenVerificacion 
                });
        
                const salt = bcryptjs.genSaltSync(10);
                registro.password = bcryptjs.hashSync(params.password.toString(), salt);
        
                const guardarApi = await registro.save();
        
                const token = await generarJWT(guardarApi.id);
        
                const url = `http://localhost:8080/api/verificar/${tokenVerificacion}`;
        
                const mailOptions = {
                    from: params.user,
                    to: params.correo,
                    subject: 'Verificación de correo electrónico',
                    text: `Por favor, verifica tu correo electrónico haciendo clic en el siguiente enlace: ${url}`
                };
        
                await envio.sendMail(mailOptions);
        
                res.status(200).json({
                    msg: 'Registro Exitoso. Se ha enviado un correo electrónico de verificación.',
                    guardarApi,
                    token
                });
        
            } catch (error) {
                console.error("Error en la operación:", error);
        
                res.status(500).json({
                    error: "Verificar el flujo - token "
                });
            }
        }
};

export default registrousu;
