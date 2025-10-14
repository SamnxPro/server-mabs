import mongoose from "mongoose";
import moment from "moment-timezone";


const Schema = mongoose.Schema;

const ContadorSchema = new Schema({

    usuarioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RegisUsu",
        required: true,
    },
    usuarioRefeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "refeClient",
        required: true,
    },
    valorMembresia: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MembresiaArbol",
        required: true,
    },
    estadoFatura: {
        type: Boolean,
        default: true
    },





});

ContadorSchema.methods.toJSON = function () {
    const { __v, password, _id, ...refeClient } = this.toObject();
    refeClient.iud = _id;
    return refeClient;
};

export default mongoose.model('ContadorRefe', ContadorSchema);
