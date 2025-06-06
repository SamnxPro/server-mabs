import { response } from 'express';
import Regis from '../../models/RegistroClientes/regisClientes.js';

var registrousu = {

            verificarCorreo: async (req,res) => {
    
                try {
                    const { token } = req.params; // Recoge el token de la URL
            
                    // Buscar el registro que tenga el token de verificación
                    const usuario = await Regis.findOne({ tokenVerificacion: token });
            
                    // Si no se encuentra un usuario con ese token o ya está verificado
                    if (!usuario) {
                        return res.status(400).json({
                            msg: 'El usuario ya ha sido verificado.'
                        });
                    }
            
                    // Si el usuario ya está verificado
                    if (usuario.verificado) {
                        return res.status(400).json({
                            msg: 'El usuario ya ha sido verificado anteriormente.'
                        });
                    }
            
                    // Si se encuentra, actualizar el estado del usuario para marcarlo como verificado
                    usuario.tokenVerificacion = null; // Eliminar el token, ya no es necesario
                    usuario.verificado = true; // Marcar el correo como verificado
            
                    await usuario.save(); // Guardar los cambios en la base de datos
            
                    res.status(200).json({
                        msg: 'Correo verificado con éxito.',
                        usuario
                    });
            
                } catch (error) {
                    console.error('Error en la verificación del correo:', error);
                    res.status(500).json({
                        error: 'Hubo un error en la verificación del correo.'
                    });
                }
            },
}

export default registrousu;
