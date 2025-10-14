import mongoose from 'mongoose';
import refere from '../../models/Referidos/referidosClients.js';
import regis from '../../models/RegistroClientes/regisClientes.js';
import envio from '../logica-email/envioClienteVeri.js';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import NvlReferidos from '../../models/Referidos/nivelReferido.js ';

const referidoToken = {

  verificarReferido: async (req, res) => {
    try {
      const usuarioHijoData = req.body;
      const referido = req.referidoRelacion; // el doc de refeClient obtenido del token
      const payloadRef = req.payloadRef;

      if (!referido) {
        return res.status(400).json({ msg: "Token inválido o expirado" });
      }

      if (!usuarioHijoData.password) {
        return res.status(400).json({ msg: "La contraseña es obligatoria" });
      }

      // Validar correo duplicado
      const exists = await regis.findOne({ correo: usuarioHijoData.correo });
      if (exists) {
        return res.status(400).json({ msg: "El correo ya está registrado." });
      }

      // 🔍 Determinar nivel del nuevo referido
      // Traemos el nivel del padre
      const padreRef = await refere
        .findOne({ _id: referido._id })
        .populate("commissionLevel")
        .populate("usuarioId");

      if (!padreRef) {
        return res.status(400).json({ msg: "No se encontró la relación del padre." });
      }

      const padreNivel = padreRef.commissionLevel?.GeneracionLevel ?? 0;
      const nuevoNivel = padreNivel + 1;

      const nivelDoc = await NvlReferidos.findOne({ GeneracionLevel: nuevoNivel });
      if (!nivelDoc) {
        return res.status(500).json({
          msg: `No se encontró nivel de comisión para GeneracionLevel: ${nuevoNivel}`,
        });
      }

      // 🔐 Cifrar contraseña
      const salt = bcryptjs.genSaltSync(10);
      const hashedPassword = bcryptjs.hashSync(usuarioHijoData.password, salt);
      const tokenVerificacion = crypto.randomBytes(24).toString("hex");

      // 👶 Crear usuario hijo
      const nuevoUsuario = await regis.create({
        nombre_cliente: usuarioHijoData.nombre_cliente,
        apellido: usuarioHijoData.apellido,
        correo: usuarioHijoData.correo,
        password: hashedPassword,
        telefono: usuarioHijoData.telefono,
        fecha_nacimiento: usuarioHijoData.fecha_nacimiento,
        rol: usuarioHijoData.rol || "CLIENTE",
        referido: referido._id,
        verificado: false,
        tokenVerificacion,
        estado: true,
      });

      // 🔁 Actualizar relación padre-hijo
      await refere.findByIdAndUpdate(referido._id, {
        estado: true,
        referidoId: nuevoUsuario._id,
        commissionLevel: nivelDoc._id,
        $unset: { expireAt: "" },
      });

      // 📎 Crear su propio registro de Gen0 (base del nuevo subárbol)
      const nivelGen0 = await NvlReferidos.findOne({ GeneracionLevel: 0 });
      await refere.create({
        usuarioId: nuevoUsuario._id,
        commissionLevel: nivelGen0._id,
        estado: false,
        tokenVerificacionReferido: crypto.randomBytes(16).toString("hex"),
        codigoReferido: `MABS-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
      });

      // ✉️ Enviar correo de verificación
      const url = `${process.env.PUBLIC_BASE_URL}/api/verificar/${tokenVerificacion}`;
      await envio.sendMail({
        from: "noreply@tuapp.com",
        to: nuevoUsuario.correo,
        subject: "Verificación de correo electrónico",
        text: `Hola ${nuevoUsuario.nombre_cliente}, verifica tu correo en: ${url}`,
      });

      return res.status(200).json({
        msg: "Usuario creado correctamente y vinculado al referido.",
        padre: padreRef.usuarioId.correo,
        nivelAsignado: nivelDoc.NombreLevel,
        nuevoUsuario,
        payloadRef,
      });
    } catch (error) {
      console.error("❌ Error en verificarReferido:", error);
      return res.status(500).json({
        error: "Error en la verificación del referido",
        detalle: error.message,
      });
    }
  }
};

export default referidoToken;
