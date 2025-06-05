import mongoose from "mongoose";

const Schema = mongoose.Schema;


const RoleSchema = new Schema({
    rol:{
        type: String,
        required: [true, 'El rol es obligatorio']
    }
});

export default mongoose.model('roles', RoleSchema);