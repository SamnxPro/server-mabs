import { response } from 'express';
import RegisModels from '../../models/RegistroClientes/regisClientes.js';
import bcryptjs from 'bcryptjs'
import { generarJWT } from '../../helpers/generar-jwt-registros/generar-jwt.js';
import googleVerify from '../../helpers/google-verifity.js'

var loginUsu = {


    listar: async (req,res) => {

        res.json({
            msg: 'Inicio Sesion'
        })

        
},


    guardarCliente: async (req, res = response) => {

        const {correo , password} = req.body

        try {
            
            //verificar si el email existe
            const usuario = await RegisModels.findOne({correo});
        
            if(usuario != null){

                //SI el usuario esta activo
    
                if ( !usuario.estado ){
                    return res.status(400).json({
                        msg: 'estado inactivo'
                    })
                }
                  // Verificar que sea un cliente
                if (usuario.rol !== 'CLIENTE' && 'ADMIN') {
                    return res.status(400).json({
                        msg: 'Solo se permiten clientes'
                    });
                } 
                if (!usuario.verificado) {
                    return res.status(400).json({
                        msg: 'El correo no está verificado'
                    });
                }
                         
                
                //verficar la contraseña
            
                const validarcontra = bcryptjs.compareSync(password, usuario.password);
                if (!validarcontra) {
    
                    return res.status(400).json({
                        msg:'Escribio mal la password'
                    }) 
                }
            } else return res.status(400).json({
                msg: 'no se encontro un registro'
            })

            // Actualizar el campo tiemposesion con la fecha actual
                usuario.tiempoSesion = new Date();
                await usuario.save();

            //generar el JWT
            const token = await generarJWT(usuario.id)

            res.status(200).json({
                usuario,
                token,
   

            })
            
        } catch (error) {
            console.log(error)
             res.status(500).json({
                msg: 'hable con el administrador'
            })
            
        }       
}, 
        guardarAdmin: async (req, res = response) => {

            const {correo , password} = req.body

            try {
                
                //verificar si el email existe
                const auten = await registros.findOne({correo});
            
                if(auten != null){

                    //SI el usuario esta activo

                    if ( !auten.estado ){
                        return res.status(400).json({
                            msg: 'estado inactivo'
                        })
                    }
                    
                    //verficar la contraseña
                
                    const validarcontra = bcryptjs.compareSync(password, auten.password);
                    if (!validarcontra) {

                        return res.status(400).json({
                            msg:'Escribio mal la password'
                        }) 
                    }
                } else return res.status(400).json({
                    msg: 'no se encontro un registro'
                })

                if (auten.rol !== 'ADMINISTRADOR_ROLE') {
                    return res.status(400).json({
                        msg: 'No tienes permisos de administrador'
                    });
                }



                auten.tiempoSesion = new Date();
                await auten.save();

                /*const tiempoActual = new Date();
                const tiempoSesion = tiempoActual - auten.tiempoSesion;

                if (tiempoSesion < tiempoMinimoSesion) {
                    // Si la sesión ha estado abierta durante menos tiempo del mínimo requerido, puedes responder en consecuencia.
                    return res.status(401).json({
                    msg: `La sesión debe mantenerse abierta al menos ${tiempoMinimoSesion / 60000} minutos.`
                    });
                }*/
                

                //generar el JWT
                const token = await generarEcommerceJWT(auten.id)

                res.status(200).json({
                    auten,
                    token
                    

                })
                
                
            } catch (error) {

                
                console.log(error)
                res.status(500).json({
                    msg: 'Error en el servidor'
                })
                
            }
        },

    googleSingIn: async (req, res = response) => {

        const { id_token } = req.body;

        try {
            // Verificar el token de Google y obtener la información del usuario
            const {nickname, correo, img} = await googleVerify(id_token);
         
            // Comprobar si el usuario ya existe en la base de datos
            let usuarioExistente = await registros.findOne({ correo });
    
            if (!usuarioExistente) {
                
                // Si el usuario no existe, crear un nuevo registro en la base de datos
                const guardarApi = new registros({
                    nickname,
                    correo,
                    img,
                    password: '242',
                    google: true,
                    rol: 'USUARIO'
                    
                    // Otras propiedades que desees guardar en el usuario
                });
            
    
                // Guardar el nuevo usuario en la base de datos
                await guardarApi.save();

                if (!guardarApi.estado) {
                    return res.status(401).json({
                        msg: 'Hable con el administrador, usuario bloqueado'
                    })
                    
                }
    
                // Generar un JWT para el nuevo usuario
                const token = await generarJWT(guardarApi.id);
                
                res.json({
                    msg: 'Inicio de sesión exitoso',
                    nickname: guardarApi,
                    token,
                });
            } 
        } catch (error) {
            console.error(error);
            res.status(400).json({
                ok: false,
                msg: 'No se pudo iniciar sesión',
            });
        }
    },

    eliminar: async (req,res) => {
        
        const {id} = req.params;
        

        //fisicamnente lo borramos del modelo
         /*const eliminarUsuario = await Regis.findByIdAndDelete(id);*/

         const estadoss = await registros.findByIdAndUpdate( id, {estado:false});         
         console.log(estadoss)
        res.status(200).json({
            msg: 'se ha desactivo el usuario',
        
            
        })
    },
    modificar: async (req,res) => {

        try {
            const { id} = req.params;
            const { _id, password, google, ...resto } = req.body;
    
            // Valida si la contraseña se proporciona y encripta
            if (password) {
                const salt = bcryptjs.genSaltSync(10);
                resto.password = bcryptjs.hashSync(password.toString(), salt);
            }
    
            // Verifica si el registro con el ID proporcionado existe antes de actualizar
            const registroExistente = await registros.findById(id);


            if (!registroExistente) {
                return res.status(404).json({ msg: 'Registro no encontrado' });
            }
    
            // Realiza la actualización del registro
            const modi = await registros.findByIdAndUpdate(id, resto, { new: true }); // Usa { new: true } para obtener el registro actualizado
    
            res.json({
                msg: 'Registro actualizado',
                modi
            });
            
        } catch (error) {
            console.error('Error al modificar registro:', error);
            res.status(500).json({ msg: 'Error interno del servidor' });
        }
}, 

};



export default loginUsu;
