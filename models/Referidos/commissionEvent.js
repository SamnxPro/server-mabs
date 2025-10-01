import mongoose from "mongoose";

const { Schema } = mongoose;

const CommissionEventSchema = new Schema({
  // clave idempotente por evento (p.ej. "emailverify:<userId>" o "signup:<refeId>")
  uniqKey: { type: String, required: true, unique: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: "RegisUsu", required: true },
  createdAt: { type: Date, default: Date.now },
});

CommissionEventSchema.methods.toJSON = function () {
  const { __v, _id, ...data } = this.toObject();
  data.iud = _id;
  return data;
};

export default mongoose.model("CommissionEvent", CommissionEventSchema);
