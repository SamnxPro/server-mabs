import mongoose from "mongoose";

const Schema = mongoose.Schema;


const RoleSchema = new Schema({
    
    rol:{
        type: String,
        required: [true, 'El rol es obligatorio']
    }
});

RoleSchema.methods.toJSON = function () {
    const { __v, rol, _id, ...data } = this.toObject();
    data.iud = _id;
    return data;
};
export default mongoose.model('roles', RoleSchema);