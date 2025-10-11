import { response } from "express";
import Regis from "../../models/RegistroClientes/regisClientes.js";
import { comissiones } from "../../helpers/asignas-comissiones/comissiones.js";
import crypto from "crypto";
import envio from "../logica-email/envioClienteVeri.js";

const registrousu = {

  verificarCorreo: async (req, res = response) => {
    try {
      const { token } = req.params;
      const params = req.body;

      // 1️⃣ Buscar usuario por token
      let usuario = await Regis.findOne({ tokenVerificacion: token }).populate("referido");
      if (!usuario) {
        return res.status(400).json({ msg: "Token inválido o usuario no encontrado." });
      }

      // 2️⃣ Evitar doble verificación
      if (usuario.verificado) {
        return res.status(400).json({ msg: "El usuario ya fue verificado anteriormente." });
      }

      // 3️⃣ Marcar como verificado
      usuario.verificado = true;
      usuario.tokenVerificacion = null;
      usuario.reintentosVerificacion = 0;
      await usuario.save();

      // 4️⃣ Asignar comisiones si tiene referido
      let comisionesResultado = null;
      if (usuario.referido) {
        comisionesResultado = await comissiones(usuario, { modoRed: "multinivel" })
      }

      return res.status(200).json({
        msg: "Correo verificado exitosamente ✅",
        usuario,
        comisiones: comisionesResultado,
      });
    } catch (error) {
      console.error("Error en verificarCorreo:", error);
      res.status(500).json({ error: "Hubo un error en la verificación del correo." });
    }
  },
};

export default registrousu;
