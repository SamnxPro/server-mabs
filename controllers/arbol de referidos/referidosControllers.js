import mongoose from 'mongoose';
import Regis from '../../models/RegistroClientes/regisClientes.js';
import RefeUsu from '../../models/Referidos/referidosClients.js';
import crypto from 'crypto';
import NvlReferidos from '../../models/Referidos/nivelReferido.js';

import { generarJWTrRef } from '../../helpers/generar-jwt-referidos/generar-jwt-ref.js';


var ArbolReferidos = {

  ListarReferidos: async (req, res) => {
    try {
      const { userId } = req.params;
      const profundidad = parseInt(req.query.profundidad) || 4;

      if (!userId) {
        return res.status(400).json({ msg: "Se requiere el ID del usuario base" });
      }

      // ✅ Obtenemos el registro base (padre)
      const usuarioBase = await Regis.findById(userId);
      if (!usuarioBase) {
        return res.status(404).json({ msg: "Usuario base no encontrado" });
      }

      // 🔍 Obtenemos su relación principal Gen0
      const baseRelacion = await RefeUsu
        .findOne({ usuarioId: userId })
        .populate("commissionLevel", "NombreLevel GeneracionLevel porcentaje");

      if (!baseRelacion) {
        return res.status(404).json({ msg: "El usuario no tiene red activa" });
      }

      // 🧮 Función recursiva para recorrer subniveles
      const obtenerReferidos = async (usuarioId, nivelActual = 1, maxNivel = 4) => {
        if (nivelActual > maxNivel) return [];

        const relaciones = await RefeUsu
          .find({ "usuarioId": usuarioId, estado: true })
          .populate("referidoId", "nombre_cliente correo telefono verificado")
          .populate("commissionLevel", "NombreLevel GeneracionLevel porcentaje");

        let resultado = [];

        for (const rel of relaciones) {
          const referido = rel.referidoId;
          if (!referido) continue;

          resultado.push({
            id: referido._id,
            nombre: `${referido.nombre_cliente} ${referido.apellido || ""}`.trim(),
            correo: referido.correo,
            telefono: referido.telefono,
            nivel: rel.commissionLevel?.NombreLevel || `Gen${nivelActual}`,
            porcentaje: rel.commissionLevel?.porcentaje || 0,
            verificado: referido.verificado,
            cicloActivo: rel.cicloActivo,
            fecha: rel.referralDate,
          });

          // Recursivamente buscamos los referidos de este hijo
          const subReferidos = await obtenerReferidos(referido._id, nivelActual + 1, maxNivel);
          resultado = resultado.concat(subReferidos);
        }

        return resultado;
      };

      const arbolReferidos = await obtenerReferidos(userId, 1, profundidad);

      return res.status(200).json({
        msg: "Listado de referidos obtenido exitosamente ✅",
        base: {
          id: usuarioBase._id,
          nombre: `${usuarioBase.nombre_cliente} ${usuarioBase.apellido || ""}`.trim(),
          correo: usuarioBase.correo,
          nivelBase: baseRelacion?.commissionLevel?.NombreLevel || "Gen0",
        },
        totalReferidos: arbolReferidos.length,
        referidos: arbolReferidos,
      });
    } catch (error) {
      console.error("❌ Error en listarReferidos:", error);
      return res.status(500).json({
        msg: "Error al listar los referidos",
        error: error.message,
      });
    }
  },

  generarEnlaceReferido: async (req, res) => {
    try {
      const padreId = req.usuario._id;
      

      const nivelDoc = await NvlReferidos.findOne({ GeneracionLevel: 0 });
      if (!nivelDoc) {
        return res.status(500).json({
          msg: "No se encontró el nivel Gen0 en la colección nivelReferido.",
        });
      }

      const tokenVerificacionReferido = crypto.randomBytes(18).toString("base64url");
      let jwtRef = null;

      try {
        jwtRef = generarJWTrRef(padreId, tokenVerificacionReferido);
      } catch (err) {
        console.warn("⚠️ No se pudo generar JWTRef, se usará solo código:", err.message);
      }

      const codigoReferido = `MABS-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

      const relacion = await RefeUsu.create({
        usuarioId: padreId,
        commissionLevel: nivelDoc._id,
        estado: false,
        tokenVerificacionReferido,
        jwtRef,
        codigoReferido,
      });

      const respuesta = {
        msg: "Código o enlace de referido generado correctamente",
        codigoReferido,
        relacion,
        usuario: { id: padreId },
        nivel: { generacion: nivelDoc.GeneracionLevel, porcentaje: nivelDoc.porcentaje },
      };

      if (jwtRef) {
        respuesta.enlace = `${process.env.PUBLIC_BASE_URL}/api/referido/enlaceVer/${jwtRef}`;
      } else {
        respuesta.advertencia = "⚠️ No se generó enlace seguro. Usa el código manualmente.";
      }

      return res.status(200).json(respuesta);
    } catch (error) {
      console.error("Error en generarEnlaceReferido:", error);
      return res.status(500).json({ error: "No se pudo generar el enlace o código de referido" });
    }
  },

  RegistrarRelacionReferido: async (usuarioId) => {

    if (!usuarioId || !mongoose.Types.ObjectId.isValid(usuarioId)) {
      return null; // No crea relación si no hay referidor válido
    }

    const relacion = await RefeUsu.create({
      usuarioId,
      commissionLevel: 1,
      estado: false
    });

    return await refeClient.findByIdAndUpdate(relacion._id, { estado: true }, { new: true });
  },




}
export default ArbolReferidos;
