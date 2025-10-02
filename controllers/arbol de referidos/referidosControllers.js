import mongoose from 'mongoose';
import Regis from '../../models/RegistroClientes/regisClientes.js';
import RefeUsu from '../../models/Referidos/referidosClients.js';
import crypto from 'crypto';
import NvlReferidos from '../../models/Referidos/nivelReferido.js';

import { generarJWTrRef } from '../../helpers/generar-jwt-referidos/generar-jwt-ref.js';


var ArbolReferidos = {

  ListarReferidos: async (req, res) => {
    try {
      const { usuarioId } = req.params; // ID del usuario que quieres consultar

      const referidos = await RegisUsu.find({ referido: { $ne: null } }) // que tengan relación
        .populate({
          path: "referido",  // el campo de relación en RegisUsu
          match: {
            usuarioId: usuarioId, // el usuario que lo refirió
            estado: true // solo si está en true
          },
          populate: {
            path: "usuarioId", // desde refeClient → usuarioId
            select: "nombre_cliente apellido correo telefono"
          }
        })
        .exec();

      res.status(200).json({
        ok: true,
        msg: "Lista de referidos activos",
        referidos
      });
    } catch (error) {
      console.error("Error al listar referidos:", error);
      res.status(500).json({ error: "Error en el servidor" });
    }
  },

  generarEnlaceReferido: async (req, res) => {
    try {
      const padreId = req.usuario._id; // viene del JWT padre
      const { commissionLevel } = req.params;

      const nivelDoc = await NvlReferidos.findOne({ GeneracionLevel: Number(commissionLevel)-1 });
      if (!nivelDoc) {
        return res.status(404).json({ msg: 'Nivel de comisión no encontrado' });
      }

      // token de verificación único
      const tokenVerificacionReferido = crypto.randomBytes(18).toString("base64url");

      // guardar relación
      const relacion = await RefeUsu.create({
        usuarioId: padreId,
        commissionLevel: nivelDoc._id,
        estado: false,
        tokenVerificacionReferido
      });

      const jwtRef = await generarJWTrRef(padreId, tokenVerificacionReferido);

      // enlace final
      const enlace = `${process.env.PUBLIC_BASE_URL}/api/referido/enlaceVer/${jwtRef}`;

      return res.status(200).json({
        msg: 'Enlace de invitación generado correctamente',
        usuario: { id: padreId },
        nivel: { generacion: nivelDoc.GeneracionLevel, porcentaje: nivelDoc.porcentaje },
        enlace,
        relacion, 
        jwtRef
      });

    } catch (error) {
      console.error("Error en generarEnlaceReferido:", error);
      return res.status(500).json({ error: 'No se pudo generar el enlace de referido' });
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
