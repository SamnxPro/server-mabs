import mongoose from "mongoose";

const Schema = mongoose.Schema;


const RutasSchema = new Schema(  {
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
  },
  {
    timestamps: true,
  }
);
export default mongoose.model('rutasSeguridad', RutasSchema);