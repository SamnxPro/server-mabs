import Regis from '../models/RegistroClientes/regisClientes.js'
import Role from '../models/Roles/rolesMabs.js'


export  async function esRoleValido(rol = '') {
    const existeRole = await Role.findOne({ rol });
    if (!existeRole) {
        throw new Error(`El rol  no está registrado en la base de datos`);
    }
}
export  async function rolAdmin(rol = 'ADMINISTADOR') {
    const existeRole = await Role.findOne({ rol });
    if (!existeRole) {
        throw new Error(`El rol  no está registrado en la base de datos`);
    }
}
export async function esCorreoValido(correo = '') {
    // Verificar si el correo ya existe en la base de datos
    const existeCorreo = await Regis.findOne({ correo });

    // Si el correo ya existe, lanzamos un error o mostramos un mensaje de alerta
    if (existeCorreo) {
        throw new Error(`El correo electrónico ${correo} ya está registrado en nuestra base de datos. Por favor, use otro correo.`);
    }
}