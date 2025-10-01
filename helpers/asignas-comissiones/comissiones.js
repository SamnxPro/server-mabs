import refere from '../../models/Referidos/referidosClients.js';
import regis from '../../models/RegistroClientes/regisClientes.js';
import nivelReferido from '../../models/Referidos/nivelReferido.js';

export async function comissiones(nuevoUsuario, referidoDoc, { session } = {}) {
  try {
    const niveles = await nivelReferido.find({}).session(session);
    const commByGen = niveles.reduce((acc, n) => {
      acc[n.GeneracionLevel] = n.porcentaje;
      return acc;
    }, {});
    const MAX_GEN = Math.max(0, ...Object.keys(commByGen).map(Number));

    // gen0 (self bonus)
    if (commByGen[0] > 0) {
      await regis.findByIdAndUpdate(
        nuevoUsuario._id,
        {
          $push: {
            comisiones: {
              usuarioOrigen: nuevoUsuario._id,
              porcentaje: commByGen[0],
              generacion: 0,
              motivo: 'registro'
            }
          }
        },
        { session }
      );
    }

    // gen >= 1
    let currentRefDoc = await refere.findById(nuevoUsuario.referido)
      .populate("usuarioId", "referido")
      .session(session);

    let gen = 1;
    while (currentRefDoc && commByGen[gen] > 0 && gen <= MAX_GEN) {
      await regis.findByIdAndUpdate(
        currentRefDoc.usuarioId._id,
        {
          $push: {
            comisiones: {
              usuarioOrigen: nuevoUsuario._id,
              porcentaje: commByGen[gen],
              generacion: gen,
              motivo: 'referido'
            }
          }
        },
        { session }
      );

      currentRefDoc = await refere.findOne({ usuarioId: currentRefDoc.usuarioId.referido })
        .populate("usuarioId", "referido")
        .session(session);

      gen++;
    }

    return true;
  } catch (err) {
    console.error("Error en comissiones:", err);
    return false;
  }
}
