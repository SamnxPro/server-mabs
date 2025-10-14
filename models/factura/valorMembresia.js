import mongoose from "mongoose";
import moment from "moment-timezone";


const Schema = mongoose.Schema;

const MembresiaSchema = new Schema({


    valorMembresia: {
        type: Number,
        unique: true

    },

    estadoMembresia: {
        type: Boolean,
        default: true
    },





});

MembresiaSchema.methods.toJSON = function () {
    const { __v, password, _id, ...refeClient } = this.toObject();
    refeClient.iud = _id;
    return refeClient;
};

export default mongoose.model('MembresiaArbol', MembresiaSchema);
