import { response } from 'express';
import Regis from '../../models/RegistroClientes/regisClientes.js';
import { comissiones } from '../../helpers/asignas-comissiones/comissiones.js';
import crypto from 'crypto';
import envio from '../logica-email/envioClienteVeri.js';

var registrousu = {
  verificarCorreo: async (req, res) => {
    try {
      const { token } = req.params;
      let usuario = await Regis.findOne({ tokenVerificacion: token }).populate("referido");

      if (!usuario) {
        // 🚨 Token inválido o expirado → buscamos si hay alguien con reintentos pendientes
        usuario = await Regis.findOne({ tokenVerificacion: null, verificado: false });
        if (!usuario) {
          return res.status(400).json({ msg: "Token inválido o usuario no encontrado." });
        }

        // Si ya alcanzó los 2 reintentos, bloquear
        if (usuario.reintentosVerificacion >= 2) {
          return res.status(400).json({ msg: "Límite de reintentos alcanzado. Contacte soporte." });
        }

        // Generar nuevo token
        const nuevoToken = crypto.randomBytes(32).toString("hex");
        usuario.tokenVerificacion = nuevoToken;
        usuario.reintentosVerificacion += 1;
        await usuario.save();

        // Reenviar correo
        const url = `http://localhost:8080/api/verificar/${nuevoToken}`;
        await envio.sendMail({
          from: "noreply@tuapp.com",
          to: usuario.correo,
          subject: "Reenvío de verificación de correo",
          text: `Hola ${usuario.nombre_cliente}, tu enlace anterior expiró. Verifica tu correo en: ${url}`
        });

        return res.status(400).json({ msg: "Token expirado, se envió un nuevo correo de verificación." });
      }

      if (usuario.verificado) {
        return res.status(400).json({ msg: "El usuario ya ha sido verificado anteriormente." });
      }

      // ✅ Verificación exitosa
      usuario.tokenVerificacion = null;
      usuario.verificado = true;
      await usuario.save();

      let mensajeExtra = "";
      if (usuario.referido) {
        const ok = await comissiones(usuario, usuario.referido);
        if (ok) mensajeExtra = " ✅ Comisiones asignadas";
      }

      return res.status(200).json({
        msg: `Correo verificado con éxito${mensajeExtra}`,
        usuario
      });

    } catch (error) {
      console.error("Error en verificarCorreo:", error);
      res.status(500).json({ error: "Hubo un error en la verificación del correo." });
    }
  }
}

export default registrousu;
