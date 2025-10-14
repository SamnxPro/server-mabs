import { response } from 'express';
import Regis from '../../models/RegistroClientes/regisClientes.js';
import { generarJWT } from '../../helpers/generar-jwt-registros/generar-jwt.js';
import nodemailer from 'nodemailer'
import bcryptjs from "bcryptjs";
import crypto from 'crypto';
import envio from '../logica-email/envioClienteVeri.js'
import RefeUsu from '../../models/Referidos/referidosClients.js';
import nivelReferido from '../../models/Referidos/nivelReferido.js';

//const dominiosPermitidos = ['hotmail.com', 'gmail.com', 'yahoo.com'];



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

            // 1️⃣ Validar dominio de correo
         /*   if (!validarDominio(params.correo)) {
                return res.status(400).json({
                    msg: "Correo electrónico inválido. Solo se permiten @hotmail.com, @gmail.com, @yahoo.com",
                });
            }*/

            // 2️⃣ Verificar si el correo ya existe
            let usuario = await Regis.findOne({ correo: params.correo });
            if (usuario) {
                // Caso 1: ya verificado
                if (usuario.verificado) {
                    return res.status(400).json({
                        msg: "El correo ya está registrado y verificado.",
                    });
                }

                // Caso 2: no verificado, manejar reintentos
                if (usuario.reintentosVerificacion >= 3) {
                    await Regis.findByIdAndDelete(usuario._id);
                    return res.status(400).json({
                        msg: "Has superado el número máximo de reintentos. Vuelve a registrarte.",
                    });
                }

                const tokenVerificacion = crypto.randomBytes(32).toString("hex");
                usuario.tokenVerificacion = tokenVerificacion;
                usuario.reintentosVerificacion += 1;
                usuario.expireAt = Date.now() + 1000 * 60 * 60 * 24; // +24h
                await usuario.save();

                const url = `${process.env.PUBLIC_BASE_URL}/api/verificar/${tokenVerificacion}`;
                await envio.sendMail({
                    from: params.user,
                    to: params.correo,
                    subject: "Reintento de verificación",
                    text: `Reintenta verificar tu correo: ${url}`,
                });

                return res.status(200).json({
                    msg: "Ya estabas registrado, se reenvió un correo de verificación.",
                    usuario,
                });
            }

            // 3️⃣ Si viene código de referido, validarlo
            let referidoDoc = null;
            if (params.codigoReferido) {
                const codigo = params.codigoReferido.toUpperCase().trim();

                // Buscar en la colección refeClient
                referidoDoc = await RefeUsu.findOne({ codigoReferido: codigo, estado: false }).populate(
                    "usuarioId",
                    "nombre_cliente correo estado"
                );

                if (!referidoDoc) {
                    return res.status(400).json({
                        msg: "Código de referido inválido o ya utilizado.",
                    });
                }

                if (!referidoDoc.usuarioId.estado) {
                    return res.status(403).json({
                        msg: "El usuario que generó este código está inactivo.",
                    });
                }
            }
            const nivelGen0 = await nivelReferido.findOne({ GeneracionLevel: 0 });
            if (!nivelGen0) {
                return res.status(500).json({
                    msg: "No se encontró el nivel Gen0 en la colección nivelReferido.",
                });
            }

            // 4️⃣ Crear nuevo token y hash de password
            const tokenVerificacion = crypto.randomBytes(32).toString("hex");
            const salt = bcryptjs.genSaltSync(10);
            const hashedPassword = bcryptjs.hashSync(params.password.toString(), salt);

            // 5️⃣ Crear el registro del usuario
            const registro = new Regis({
                nombre_cliente: params.nombre_cliente,
                apellido: params.apellido,
                correo: params.correo,
                password: hashedPassword,
                telefono: params.telefono,
                fecha_nacimiento: new Date(params.fecha_nacimiento),
                rol: "CLIENTE",
                generation: nivelGen0._id,
                tokenVerificacion,
                referido: referidoDoc ? referidoDoc._id : null,
                codigoReferido: params.codigoReferido ? params.codigoReferido.toUpperCase() : null,
            });

            const guardarApi = await registro.save();

            // 6️⃣ Si hubo un referido, marcar la relación como usada
            if (referidoDoc) {
                await RefeUsu.findByIdAndUpdate(referidoDoc._id, {
                    estado: true,
                    $unset: { expireAt: "" },
                });
            }

            // 7️⃣ Enviar correo de verificación
            const url = `${process.env.PUBLIC_BASE_URL}/api/verificar/${tokenVerificacion}`;
            await envio.sendMail({
                from: params.user,
                to: params.correo,
                subject: "Verificación de correo electrónico",
                text: `Por favor verifica tu correo en: ${url}`,
            });

            // 8️⃣ Respuesta final
            return res.status(200).json({
                msg: referidoDoc
                    ? "Registro exitoso con código de referido. Se envió correo de verificación."
                    : "Registro exitoso. Se envió correo de verificación.",
                usuario: guardarApi,
                referido: referidoDoc || null,
            });
        } catch (error) {
            console.error("Error en guardarRegistro:", error);
            res.status(500).json({
                error: "Error en el flujo de registro/verificación.",
            });
        }
    },



};

export default registrousu;
