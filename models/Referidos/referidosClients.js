import mongoose from "mongoose";
import moment from "moment-timezone";


const Schema = mongoose.Schema;

const RefeUsuSchema = new Schema({

    usuarioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'RegisUsu'
    },
    referralDate: { 
        type: Date,
        default: () => moment().tz('America/Bogota').toDate()
    },

    commissionLevel: { 
        type: mongoose.Schema.Types.ObjectId,
        ref:'NvlRefe'
    },  // Nivel de la comisión (Gen0, Gen1, etc.)
    
    estado: {
        type: Boolean,
         default: false
    },

    tokenVerificacionReferido: String,

});

RefeUsuSchema.methods.toJSON = function () {
    const { __v, password, _id, ...refeClient } = this.toObject();
    refeClient.iud = _id;
    return refeClient;
  };
  
export default mongoose.model('refeClient', RefeUsuSchema);


