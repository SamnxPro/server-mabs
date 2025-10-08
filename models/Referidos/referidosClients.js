import mongoose from "mongoose";
import moment from "moment-timezone";

const Schema = mongoose.Schema;

const RefeUsuSchema = new Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "RegisUsu" },
  referralDate: { type: Date, default: () => moment().tz("America/Bogota").toDate() },
  commissionLevel: { type: mongoose.Schema.Types.ObjectId, ref: "NvlRefe" },
  estado: {
    type: Boolean,
    default: false
  },
  tokenVerificacionReferido:
  {
    type: String,
    unique: true
  }, // ✅ Índice único
  
  codigoReferido: {
    type: String,
    unique: true,
    sparse: true,       // permite múltiples documentos sin código
    uppercase: true,
    trim: true,
    default: null,      // deja claro que puede no existir
  },

  expireAt: {
    type: Date,
    default: () => moment().add(4, "minutes").toDate(),
    index: { expireAfterSeconds: 0 }
  }

});

// Elimina expireAt si ya fue usado
RefeUsuSchema.pre("save", function (next) {
  if (this.estado === true) {
    this.set("expireAt", undefined, { strict: false });
    this.$unset("expireAt");
  }
  next();
});

export default mongoose.model("refeClient", RefeUsuSchema);
