import { response } from 'express';
import Regis from '../../models/RegistroClientes/regisClientes.js';
import { comissiones } from '../../helpers/asignas-comissiones/comissiones.js';
import crypto from 'crypto';
import envio from '../logica-email/envioClienteVeri.js';

var registrousu = {

  verificarCorreo: async (req, res) => {
    try {
      const { token } = req.params;
      const params = req.body;

      // 1. Buscar usuario por token
      let usuario = await Regis.findOne({ tokenVerificacion: token }).populate("referido");

      if (!usuario) {
        // 🚨 Caso: Token inválido o expirado → buscar usuario pendiente
        usuario = await Regis.findOne({ verificado: false }).sort({ updatedAt: -1 }); // el último no verificado
        if (!usuario) {
          return res.status(400).json({ msg: "Token inválido o usuario no encontrado." });
        }

        // 2. Validar reintentos
        if (usuario.reintentosVerificacion >= 3) {
          // 🔥 Eliminar documento definitivamente
          await Regis.findByIdAndDelete(usuario._id);
          return res.status(400).json({ msg: "Se superó el límite de reintentos. El registro fue eliminado, vuelve a intentarlo desde cero." });
        }

        // 3. Generar nuevo token
        const nuevoToken = crypto.randomBytes(32).toString("hex");
        usuario.tokenVerificacion = nuevoToken;
        usuario.reintentosVerificacion += 1;
        usuario.expireAt = Date.now() + 1000 * 60 * 60 * 24; // renueva 24h
        await usuario.save();

        // 4. Reenviar correo
        const url = `http://localhost:8080/api/verificar/${nuevoToken}`;
        await envio.sendMail({
          from: params.user,
          to: params.correo,
          subject: "Reenvío de verificación de correo",
          text: `Hola ${usuario.nombre_cliente}, tu enlace anterior expiró. Verifica tu correo en: ${url}`
        });

        return res.status(400).json({ msg: "Token expirado, se envió un nuevo correo de verificación." });
      }

      // 5. Usuario ya verificado → no permitir doble verificación
      if (usuario.verificado) {
        return res.status(400).json({ msg: "El usuario ya ha sido verificado anteriormente." });
      }

      // ✅ 6. Verificación exitosa
      usuario.tokenVerificacion = null;
      usuario.verificado = true;
      usuario.reintentosVerificacion = 0; // reset por si acaso
      await usuario.save();

      // 7. Si hay un referido, asignar comisiones
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
