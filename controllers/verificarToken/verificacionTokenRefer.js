import mongoose from 'mongoose';
import refere from '../../models/Referidos/referidosClients.js';
import regis from '../../models/RegistroClientes/regisClientes.js';
import envio from '../logica-email/envioClienteVeri.js';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';

const referidoToken = {
    
  verificarReferido: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { id, token } = req.params; // id = usuarioId del que invitó
      const usuarioHijoData = req.body;

      // 1) Buscar referido válido y pendiente
      const referido = await refere.findOne({
        usuarioId: id,
        tokenVerificacionReferido: token,
        estado: false
      })
        .populate({ path: "usuarioId", select: "nombre_cliente correo referido" })
        .session(session);

      if (!referido) {
        await session.abortTransaction(); session.endSession();
        return res.status(400).json({ msg: "Token inválido o expirado" });
      }

      // 2) Validar password
      if (!usuarioHijoData.password) {
        await session.abortTransaction(); session.endSession();
        return res.status(400).json({ msg: "La contraseña es obligatoria" });
      }

      const salt = bcryptjs.genSaltSync(10);
      const hashedPassword = bcryptjs.hashSync(usuarioHijoData.password, salt);

      // 3) Token de verificación de email del nuevo usuario
      const tokenVerificacion = crypto.randomBytes(24).toString("hex");

      // 4) Idempotencia por correo (opcional)
      const exists = await regis.findOne({ correo: usuarioHijoData.correo }).session(session);
      if (exists) {
        await session.abortTransaction(); session.endSession();
        return res.status(400).json({ msg: "El correo ya está registrado." });
      }

      // 5) Crear usuario hijo (gen0)
      const [nuevoUsuario] = await regis.create([{
        nombre_cliente: usuarioHijoData.nombre_cliente,
        apellido: usuarioHijoData.apellido,
        correo: usuarioHijoData.correo,
        password: hashedPassword,
        telefono: usuarioHijoData.telefono,
        fecha_nacimiento: usuarioHijoData.fecha_nacimiento,
        rol: usuarioHijoData.rol || "CLIENTE",
        referido: referido._id, // vínculo al doc de referencia usado
        estado: true,
        verificado: false,
        tokenVerificacion,
        generation: 0
      }], { session });

      // 6) Cerrar referido (quita expiración)
      await refere.findByIdAndUpdate(
        referido._id,
        { estado: true, $unset: { expireAt: "" } },
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      // 7) Enviar email (fuera de la transacción)
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
        nuevoUsuario
      });

    } catch (error) {
      try { await session.abortTransaction(); } catch {}
      session.endSession();
      console.error("Error en verificarReferido:", error);
      return res.status(500).json({ error: "Error en la verificación del referido" });
    }
  }
};

export default referidoToken;
