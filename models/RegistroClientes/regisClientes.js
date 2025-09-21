import mongoose from "mongoose";
import moment from "moment-timezone";


const Schema = mongoose.Schema;

const RegisUsuSchema = new Schema({

    nombre_cliente: {
        type: String,
        required: [true, 'El nombre_cliente es obligatorio']
    },
    
    apellido: {
        type: String,
        required: [true, 'El apellido es obligatorio']
    },

    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    correo: {
        type: String,
        required: [true, 'El correo es obligatorio'],
        unique: true
    },
    imagenes: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'imgPerfil'
    },
    telefono: {
        type: Number,
        required: [true, 'El telefono es obligatoria']
    },
    fecha_nacimiento: {
        type: Date,
        required: true,
    },
    rol: {
        type: String,
        required: true,
        default: 'USUARIO',
        emun: ['VENDEDOR', 'CLIENTE']
    },
    
    estado: {
        type: Boolean,
        default: true
    },
    tiempoSesion: {
        type: Date,
        default: () => moment().tz('America/Bogota').toDate() // Usa la hora local de Bogotá (UTC-5)
    },
    google: {
        type: Boolean,
        default: false
    },
    pais:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Pais',
    },
    departamento:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Depar',
    },
    ciudad:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Pais',
    },
    verificado: {
        type: Boolean,
        default: false
    },
    recuperacion: {
        type: Boolean,
        default: false
    },
    generation: { 
        type: Number,
        default: 0 },
    tokenVerificacion: String,
    tokenRecuperacion: String,

    referido: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'refeClient',
    }


});

RegisUsuSchema.methods.toJSON = function () {
    const { __v, password, _id, ...RegisUsu } = this.toObject();
    RegisUsu.iud = _id;
    return RegisUsu;
  };
  
export default mongoose.model('RegisUsu', RegisUsuSchema);