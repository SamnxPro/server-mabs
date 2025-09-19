import mongoose from 'mongoose';
import Regis from '../../models/RegistroClientes/regisClientes.js';
import RefeUsu from '../../models/Referidos/referidosClients.js';
import crypto from 'crypto';
import generarjwtRef from '../../helpers/generar-jwt-referidos/generar-jwt-ref.js';


var ArbolReferidos = {

ListarReferidos: async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await Regis.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) }
      },
      {
        $graphLookup: {
          from: 'regisusus', // nombre real de la colección en MongoDB
          startWith: '$_id',
          connectFromField: '_id',
          connectToField: 'referrer',
          as: 'referidos',
          depthField: 'nivel'
        }
      },
      {
        $project: {
          nombre_cliente: 1,
          correo: 1,
          referidos: {
            nombre_cliente: 1,
            correo: 1,
            nivel: 1
          }
        }
      }
    ]);

    res.status(200).json({
      msg: 'Árbol de referidos generado',
      resultado
    });
  } catch (error) {
    console.error('Error al generar árbol de referidos:', error);
    res.status(500).json({
      error: 'No se pudo generar el árbol de referidos'
    });
  }
},

generarEnlaceReferido: async (req, res) => {
  try {
    const { id } = req.params;
    const { commissionLevel } = req.params;
    // 1. Verificar usuario que genera el enlace
    const usuario = await Regis.findById(id);
    if (!usuario) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // 2. Generar token único
    const token = crypto.randomBytes(32).toString("hex");

    // 3. Guardar relación pendiente en la colección refeClient
    const relacion = await RefeUsu.create({
      usuarioId: usuario._id,
      commissionLevel: commissionLevel,
      estado: false,
      tokenVerificacionReferido: token
    });

    // 4. Construir enlace
    const enlace = `http://localhost:8080/api/referido/enlaceVer/${usuario._id}/${token}`;

    res.status(200).json({
      msg: 'Enlace de invitación generado correctamente',
      usuario: {
        nombre: usuario.nombre_cliente,
        correo: usuario.correo
      },
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
