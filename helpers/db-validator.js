import Regis from '../models/RegistroClientes/regisClientes.js'
import Role from '../models/Roles/rolesMabs.js'


export  async function esRoleValido(rol = '') {
    const existeRole = await Role.findOne({ rol });
    if (!existeRole) {
        throw new Error(`El rol  no está registrado en la base de datos`);
    }
}