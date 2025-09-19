import mongoose from 'mongoose';
import RefeUsu from '../../models/Referidos/referidosClients.js';
import crypto from 'crypto';

var NvlReferidos = {



generarEnlaceReferido: async (req, res) => {
try {
    let nivel = 0;
    let usuarioActual = await refere.findById(usuarioId).populate("usuarioId");

    // Recorremos hacia arriba
    while (usuarioActual && nivel <= 3) {
      const porcentaje = porcentajes[nivel] || 0;
      const comision = (montoBase * porcentaje) / 100;

      if (usuarioActual.usuarioId) {
        // Sumar comisión al usuario dueño
        await refere.findByIdAndUpdate(
          usuarioActual.usuarioId._id,
          { $inc: { comisionesAcumuladas: comision } },
          { new: true }
        );
      }

      // Subir al padre (el que lo refirió)
      usuarioActual = await refere.findOne({ usuarioId: usuarioActual.usuarioId });
      nivel++;
    }

  } catch (error) {
    console.error("Error asignando comisiones:", error);
  }
},
  





}
export default ContadorReferidos;
