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
        unique: true,
        validate: {
            validator: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
            message: props => `${props.value} no es un correo válido`
        }
    },
    img: {
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'roles', // Nombre de tu modelo de usuarios
        required: true
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
    pais: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pais',
    },
    departamento: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Depar',
    },
    ciudad: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pais',
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NvlRefe',
    },
    reintentosVerificacion: {
        type: Number,
        default: 0,
        //max: 2 // opcional, pero puedes usar lógica en controlador
    },
    tokenVerificacion: String,
    tokenRecuperacion: String,

    referido: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'refeClient',
    },

    cicloActivo: {
        type: Boolean,
        default: true, // Por defecto todos comienzan activos
    },

    expireAt: {
        type: Date,
        default: () => moment().add(24, "hours").toDate(), // 24 horas
        index: { expires: 0 } // TTL: cuando llegue la fecha se elimina automático
    },
    fechaCierreCiclo: {
        type: Date,
        default: null, // Solo se llena cuando llega a Gen4
    },


});

RegisUsuSchema.pre("save", function (next) {
    if (this.verificado === true) {
        this.expireAt = undefined; // ✅ simplemente anulas el campo
    }
    next();
});

RegisUsuSchema.methods.toJSON = function () {
    const { __v, password, _id, ...RegisUsu } = this.toObject();
    RegisUsu.iud = _id;
    return RegisUsu;
};

export default mongoose.model('RegisUsu', RegisUsuSchema);