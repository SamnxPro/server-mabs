import mongoose from "mongoose";
import moment from "moment-timezone";


const Schema = mongoose.Schema;

const NvlRefSchema = new Schema({
    
    NombreLevel: {
        type: String,
    },

    commissionLevel: {
        type: Number,
        default: 0
    },  // Nivel de la comisión (Gen0, Gen1, etc.)

    porcentaje: { type: Number, required: true } 



});

NvlRefSchema.methods.toJSON = function () {
    const { __v, password, _id, ...data } = this.toObject();
    data.iud = _id;
    return data;
};

export default mongoose.model('NvlRefe', NvlRefSchema);
