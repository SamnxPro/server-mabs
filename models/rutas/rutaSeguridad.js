import mongoose from "mongoose";
import moment from "moment-timezone";

const Schema = mongoose.Schema;


const RutasSchema = new Schema({

  name: {
    type: String,
    required: true,
    trim: true,
  },
  path: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  component: {
    type: String,
    required: true,
    trim: true,
  },
  layout: {
    type: String,
    default: 'MainLayout',
  },
  icon: {
    type: String, // opcional, para menús del frontend
    default: null,
  },
  Usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RegisUsu', // Nombre de tu modelo de usuarios
    required: true
  },
  allowedRoles: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'roles', // Nombre de tu modelo de usuarios
    required: true
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  fechaCreacionUsu: {
    type: Date,
    default: () => moment().tz('America/Bogota').toDate() // Usa la hora local de Bogotá (UTC-5)
  },
  creadoPorRol: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'roles', // Nombre de tu modelo de usuarios
    required: true
  },
},
);
export default mongoose.model('rutasSeguridad', RutasSchema);