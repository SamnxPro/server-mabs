import mongoose from "mongoose";

const Schema = mongoose.Schema;

const NvlRefSchema = new Schema({
    NombreLevel: { type: String },
    GeneracionLevel: { type: Number, default: 0 }, 
    porcentaje: { type: Number, required: true },
});

NvlRefSchema.methods.toJSON = function () {
    const { __v, password, _id, ...data } = this.toObject();
    data.iud = _id;
    return data;
};

// ✅ Índice único
NvlRefSchema.index({ GeneracionLevel: 1 }, { unique: true });

export default mongoose.model('NvlRefe', NvlRefSchema);
