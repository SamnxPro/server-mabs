import mongoose from "mongoose";
import moment from "moment-timezone";


const Schema = mongoose.Schema;

const ContadorSchema = new Schema({

    usuarioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RegisUsu",
        required: true,
        unique: true
    },

    totalComissiones: {
        type: Number,
        default: 0
    },

    commissionLevel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NvlRefe'
    },  // Nivel de la comisión (Gen0, Gen1, etc.)



});

ContadorSchema.methods.toJSON = function () {
    const { __v, password, _id, ...refeClient } = this.toObject();
    refeClient.iud = _id;
    return refeClient;
};

export default mongoose.model('ContadorRefe', ContadorSchema);
