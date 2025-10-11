import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ContadorSchema = new Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RegisUsu",
    required: true,
  },
  referidoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "refeClient",
    required: true,
  },
  montoFactu: { type: Number, default: 0 },
  commissionLevel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NvlRefe",
  },
  montoGanado: { type: Number, default: 0, min: 0 },
  motivo: {
    type: String,
    enum: ["registro", "referido", "compra", "upgrade"],
    default: "referido",
  },
  estado: { type: Boolean, default: false },
  modoRed: {
    type: String,
    enum: ["multinivel", "directo"],
    default: "multinivel",
  },
  ciclo: { type: Number, default: 1, min: 1 },
  fecha: { type: Date, default: Date.now },
});

// 🔍 Índices válidos
ContadorSchema.index({ usuarioId: 1 });
ContadorSchema.index({ referidoId: 1 });
ContadorSchema.index({ commissionLevel: 1 });
ContadorSchema.index({ motivo: 1 });
ContadorSchema.index({ fecha: -1 });

ContadorSchema.methods.toJSON = function () {
  const { __v, password, _id, ...data } = this.toObject();
  data.iud = _id;
  return data;
};

export default mongoose.model("ContadorComisi", ContadorSchema);
