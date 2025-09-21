import mongoose from 'mongoose';
import refere from '../../models/Referidos/referidosClients.js';
import regis from '../../models/RegistroClientes//regisClientes.js'
import envio from '../logica-email/envioClienteVeri.js'
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';

var referidoToken = {

verificarReferido: async (req, res) => {
        try {
                const { id, token } = req.params;
                const usuarioHijoData = req.body;

                // 1. Validar token de referido
                const referido = await refere.findOneAndUpdate(
                {
                    usuarioId: id,
                    tokenVerificacionReferido: token,
                    estado: false
                },
                { $set: { estado: true, tokenVerificacionReferido: null } },
                { new: true }
                );

                if (!referido) {
                return res.status(400).json({ msg: "Token inválido o expirado" });
                }

                // 2. Encriptar password
                const salt = bcryptjs.genSaltSync(10);
                const hashedPassword = bcryptjs.hashSync(usuarioHijoData.password, salt);

                // 3. Generar token para verificación de correo
                const tokenVerificacion = crypto.randomBytes(32).toString("hex");

                // 4. Crear usuario hijo
                const nuevoUsuario = await regis.create({
                nombre_cliente: usuarioHijoData.nombre_cliente,
                apellido: usuarioHijoData.apellido,
                correo: usuarioHijoData.correo,
                password: hashedPassword,
                telefono: usuarioHijoData.telefono,
                fecha_nacimiento: usuarioHijoData.fecha_nacimiento,
                rol: usuarioHijoData.rol || "CLIENTE",
                referido: referido._id, // Relación con refeClient
                estado: true,
                verificado: false,
                tokenVerificacion
                });

                // 5. Enviar correo de verificación
                const url = `http://localhost:8080/api/verificar/${tokenVerificacion}`;
                const mailOptions = {
                from: "noreply@tuapp.com", // 👈 cámbialo por tu correo configurado
                to: nuevoUsuario.correo,
                subject: "Verificación de correo electrónico",
                text: `Hola ${nuevoUsuario.nombre_cliente}, 
                
                Gracias por registrarte. Por favor, verifica tu correo haciendo clic en el siguiente enlace: ${url}`
                };

                await envio.sendMail(mailOptions);

                return res.status(200).json({
                msg: "Usuario hijo creado con éxito. Se envió correo de verificación.",
                referido,
                nuevoUsuario
                });

            } catch (error) {
                console.error("Error en verificarReferido:", error);
                return res.status(500).json({ error: "Error en la verificación del referido" });
            }
        },

}

export default referidoToken;
