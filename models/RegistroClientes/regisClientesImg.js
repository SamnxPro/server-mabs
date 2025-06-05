import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ImgPerfilSchema = new Schema({

    nombre: {
        type: String,
        
      },
      data: {
        type: Buffer, // Aquí se almacenará la imagen como buffer
        required: true,
    },
      mimetype: {
        type: String,
        required: true,
      },
      size: {
        type: Number,
        required: true,
      },
});

ImgPerfilSchema.methods.toJSON = function () {
    const { __v, estado, ...data } = this.toObject();
    return data;
};


export default mongoose.model('imgPerfil', ImgPerfilSchema);
