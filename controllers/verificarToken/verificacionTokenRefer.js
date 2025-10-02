import mongoose from 'mongoose';
import refere from '../../models/Referidos/referidosClients.js';
import regis from '../../models/RegistroClientes/regisClientes.js';
import envio from '../logica-email/envioClienteVeri.js';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';

const referidoToken = {

  verificarReferido: async (req, res) => {
    try {
      const usuarioHijoData = req.body;
      const referido = req.referidoRelacion;
      const payloadRef = req.payloadRef;

      if (!referido) {
        return res.status(400).json({ msg: "Token inválido o expirado" });
      }

      if (!usuarioHijoData.password) {
        return res.status(400).json({ msg: "La contraseña es obligatoria" });
      }

      const salt = bcryptjs.genSaltSync(10);
      const hashedPassword = bcryptjs.hashSync(usuarioHijoData.password, salt);

      const tokenVerificacion = crypto.randomBytes(24).toString("hex");

      // validar correo duplicado
      const exists = await regis.findOne({ correo: usuarioHijoData.correo });
      if (exists) {
        return res.status(400).json({ msg: "El correo ya está registrado." });
      }

      // crear usuario hijo
      const nuevoUsuario = await regis.create({
        nombre_cliente: usuarioHijoData.nombre_cliente,
        apellido: usuarioHijoData.apellido,
        correo: usuarioHijoData.correo,
        password: hashedPassword,
        telefono: usuarioHijoData.telefono,
        fecha_nacimiento: usuarioHijoData.fecha_nacimiento,
        rol: usuarioHijoData.rol || "CLIENTE",
        referido: referido._id,
        estado: true,
        verificado: false,
        tokenVerificacion,
        generation: 0
      });

      // marcar relación usada
      await refere.findByIdAndUpdate(referido._id, {
        estado: true,
        $unset: { expireAt: "" }
      });

      // enviar correo
      const url = `http://localhost:8080/api/verificar/${tokenVerificacion}`;
      await envio.sendMail({
        from: "noreply@tuapp.com",
        to: nuevoUsuario.correo,
        subject: "Verificación de correo electrónico",
        text: `Hola ${nuevoUsuario.nombre_cliente}, por favor verifica tu correo en: ${url}`
      });

      return res.status(200).json({
        msg: "Usuario creado. Se envió correo de verificación.",
        referido,
        nuevoUsuario,
        payloadRef
      });
    } catch (error) {
      console.error("Error en verificarReferido:", error);
      return res.status(500).json({ error: "Error en la verificación del referido" });
    }
  }
};

export default referidoToken;
