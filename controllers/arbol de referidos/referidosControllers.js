import mongoose from 'mongoose';
import Regis from '../../models/RegistroClientes/regisClientes.js';
import RefeUsu from '../../models/Referidos/referidosClients.js';
import crypto from 'crypto';
import { generarJWT } from '../../helpers/generar-jwt-registros/generar-jwt.js';

const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL ;

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
    const { id } = req.headers;
    const { commissionLevel } = req.params;

    const usuario = await Regis.findById(id);
    if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });

    const nivelDoc = await NvlRefe.findOne({ GeneracionLevel: Number(commissionLevel) });
    if (!nivelDoc) return res.status(404).json({ msg: 'Nivel de comisión no encontrado' });

    const tokenVerificacionReferido = crypto.randomBytes(18).toString("base64url");

    const relacion = await RefeUsu.create({
      usuarioId: usuario._id,
      commissionLevel: nivelDoc._id,
      estado: false,
      tokenVerificacionReferido
    });

    const payload = { refTok: tokenVerificacionReferido, level: nivelDoc.GeneracionLevel };
    const jwtEncriptado = await generarJWT(payload);

    const enlace = `${PUBLIC_BASE_URL}/api/referido/enlaceVer/${jwtEncriptado}`;

    res.status(200).json({
      msg: 'Enlace de invitación generado correctamente',
      usuario: { nombre: usuario.nombre_cliente, correo: usuario.correo },
      nivel: { generacion: nivelDoc.GeneracionLevel, porcentaje: nivelDoc.porcentaje },
      enlace,
      relacion
    });
  } catch (error) {
    console.error('Error al generar enlace de referido:', error);
    res.status(500).json({ error: 'No se pudo generar el enlace de referido' });
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
