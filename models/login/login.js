import mongoose from "mongoose";
import moment from "moment-timezone";


const Schema = mongoose.Schema;

const LoginSchema = new Schema({
    
    NombreLevel: {
        type: String,
    },

    commissionLevel: {
        type: Number,
        default: 0
    },  // Nivel de la comisión (Gen0, Gen1, etc.)

    porcentaje: { type: Number, required: true } 



});

LoginSchema.methods.toJSON = function () {
    const { __v, password, _id, ...LoginSchema } = this.toObject();
    LoginSchema.iud = _id;
    return LoginSchema;
};

export default mongoose.model('loginRegis', LoginSchema);
