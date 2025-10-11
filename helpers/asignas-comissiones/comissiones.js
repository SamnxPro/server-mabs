import mongoose from "mongoose";
import ContadorComisi from "../../models/contador/asignacionComission.js";
import NvlRefe from "../../models//Referidos/nivelReferido.js";
import RegisUsu from "../../models/RegistroClientes/regisClientes.js";

/**
 * 💰 Motor multinivel con control de ciclos
 * - Calcula y asigna comisiones ascendentes
 * - Maneja relaciones a través del modelo refeClient
 * - Cierra ciclo de generación en Gen4
 */
export const comissiones = async (nuevoUsuario, { session = null, modoRed = "multinivel" } = {}) => {
  try {
    console.log("🚀 Iniciando cálculo de comisiones...");
    console.log("👤 Usuario registrado:", nuevoUsuario?.correo || nuevoUsuario?._id);

    // ===============================
    // 🔹 DETERMINAR PADRE REAL
    // ===============================
    let idPadre = null;
    if (!nuevoUsuario.referido) {
      console.warn("⚠️ Usuario sin campo 'referido'. No se generarán comisiones.");
      return { ok: true, msg: "Sin padre referidor", nivel: 0, resumen: [] };
    }

    // Caso 1: referido es un ObjectId que apunta a refeClient
    if (mongoose.Types.ObjectId.isValid(nuevoUsuario.referido)) {
      const relacion = await mongoose.model("refeClient").findById(nuevoUsuario.referido);
      if (relacion && relacion.usuarioId) {
        idPadre = relacion.usuarioId; // ✅ el ID real del usuario padre
      }
    }
    // Caso 2: referido viene como objeto (populate)
    else if (typeof nuevoUsuario.referido === "object" && nuevoUsuario.referido.usuarioId) {
      idPadre = nuevoUsuario.referido.usuarioId._id || nuevoUsuario.referido.usuarioId;
    }

    if (!idPadre) {
      console.warn("⚠️ No se pudo determinar el ID del padre real.");
      return { ok: true, msg: "Padre no encontrado", nivel: 0, resumen: [] };
    }

    console.log("👨‍👦 ID del padre detectado:", idPadre.toString());

    // ===============================
    // 🔹 CARGAR NIVELES CONFIGURADOS
    // ===============================
    const niveles = await NvlRefe.find().sort({ GeneracionLevel: 1 });
    const commByGen = {};
    niveles.forEach(n => {
      commByGen[n.GeneracionLevel] = n.porcentaje;
    });

    console.log("📊 Porcentajes cargados:", commByGen);

    // ===============================
    // 🔹 INICIO DE RECORRIDO ASCENDENTE
    // ===============================
    let resumen = [];
    let gen = 1;
    let padreActual = await RegisUsu.findById(idPadre).populate("referido");

    const montoSimulado = 100; // 💵 Valor temporal de base (reemplazar por monto real)

    while (padreActual && gen <= 4 && commByGen[gen] !== undefined) {
      const porcentaje = commByGen[gen] ?? 0;
      const nivelDoc = niveles.find(n => n.GeneracionLevel === gen);

      console.log(`🧩 GEN${gen} → Padre: ${padreActual.correo || padreActual._id} | %: ${porcentaje}`);

      if (porcentaje > 0) {
        const montoGanado = (montoSimulado * porcentaje) / 100;

        // Registrar comisión
        const registro = {
          usuarioId: padreActual._id,
          referidoId: nuevoUsuario._id,
          commissionLevel: nivelDoc?._id || null,
          montoFactu: montoSimulado,
          montoGanado,
          motivo: "referido",
          estado: false,
          modoRed,
          ciclo: 1,
          fecha: new Date(),
        };

        await ContadorComisi.create([registro], { session });

        resumen.push({
          generacion: gen,
          usuarioDestino: padreActual._id,
          porcentaje,
          montoGanado,
          motivo: "referido",
        });

        console.log(`✅ Comisión registrada para ${padreActual.correo || padreActual._id} (${porcentaje}% → ${montoGanado})`);
      }

      // Subir un nivel más
      let siguientePadre = null;
      if (padreActual.referido) {
        // Si el campo referido es un refeClient
        if (mongoose.Types.ObjectId.isValid(padreActual.referido)) {
          const refDoc = await mongoose.model("refeClient").findById(padreActual.referido);
          siguientePadre = refDoc?.usuarioId ? await RegisUsu.findById(refDoc.usuarioId).populate("referido") : null;
        } else if (typeof padreActual.referido === "object" && padreActual.referido.usuarioId) {
          siguientePadre = await RegisUsu.findById(padreActual.referido.usuarioId).populate("referido");
        }
      }

      padreActual = siguientePadre;
      gen++;
    }

    console.log("🎯 Proceso de comisiones finalizado correctamente.");
    return { ok: true, msg: "Comisiones registradas exitosa", nivel: gen - 1, resumen };

  } catch (error) {
    console.error("💥 Error general en comissiones - revisar nvlrefe parametrizado:", error);
    return { ok: false, msg: "Error asignando comisiones", error: error.message };
  }
};
