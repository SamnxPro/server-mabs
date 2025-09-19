import mongoose from 'mongoose';
import Regis from '../../models/RegistroClientes/regisClientes.js';
import RefeUsu from '../../models/Referidos/referidosClients.js';
import crypto from 'crypto';
import generarjwtRef from '../../helpers/generar-jwt-referidos/generar-jwt-ref.js';


var ComissionesRef = {


  
guardarNvlComision: async (usuarioId) => {

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
export default ComissionesRef;
