import mongoose from 'mongoose';
import ContadorRefe from '../../models/Referidos/nivelReferido.js';
import crypto from 'crypto';

var NvlReferidos = {



guardarNivelesyGeneracion: async (req, res) => {
 try {
    // Buscar el último nivel creado (orden descendente)
    const ultimoNivel = await ContadorRefe.findOne().sort({ GeneracionLevel: -1 });

    let nuevoNivel;
    if (!ultimoNivel) {
      // Si no existe ningún nivel → comenzamos con Gen0 (25%)
      nuevoNivel = new ContadorRefe({
        NombreLevel: "Gen0",
        GeneracionLevel: 0,
        porcentaje: 25,

      });
    } else {
      // Si ya hay niveles → incrementamos commissionLevel
      const siguienteNivel = ultimoNivel.GeneracionLevel + 1;

      nuevoNivel = new ContadorRefe({
        NombreLevel: `Gen${siguienteNivel}`,
        GeneracionLevel: siguienteNivel,
        porcentaje: 5, // A partir de Gen1 es siempre 5%
      });
    }

    // Guardamos en BD
    await nuevoNivel.save();

    res.status(201).json({
      ok: true,
      msg: "Nivel creado correctamente",
      data: nuevoNivel,
    });
  } catch (error) {
    console.error("Error al crear nivel:", error);
    res.status(500).json({
      ok: false,
      msg: "Error en el servidor",
    });
  }
}
  





}
export default NvlReferidos;
