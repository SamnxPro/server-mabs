import mongoose from "mongoose";
import moment from "moment-timezone";


const Schema = mongoose.Schema;

const RegisUsuSchema = new Schema({

    usuarioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'RegisUsu'
    },
        refererId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'RegisUsu'
    },
    referralDate: { 
        type: Date,
        default: Date.now 
    },

    commissionLevel: { 
        type: Number ,
         default: 0
    }  // Nivel de la comisión (Gen0, Gen1, etc.)
    

});

RegisUsuSchema.methods.toJSON = function () {
    const { __v, password, _id, ...RegisUsu } = this.toObject();
    RegisUsu.iud = _id;
    return RegisUsu;
  };
  
export default mongoose.model('refeClient', RegisUsuSchema);


