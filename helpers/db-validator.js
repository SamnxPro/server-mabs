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
  // Busca el usuario por correo
  const usuario = await Regis.findOne({ correo });

  // Si no existe, todo bien
  if (!usuario) return true;

  // Si existe y está verificado, bloqueamos
  if (usuario.verificado) {
    throw new Error(`El correo electrónico ${correo} ya está registrado y verificado. Por favor, use otro correo.`);
  }

  // Si existe pero NO está verificado, lo dejamos pasar
  // Esto permite que el flujo de reintentos se active después
  return true;
}