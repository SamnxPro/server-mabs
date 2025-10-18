import { response } from 'express';
import { generarJWT } from '../../helpers/generar-jwt-registros/generar-jwt.js';
import rutaSeguridad from '../../models/rutas/rutaSeguridad.js';
import Roles from '../../models/Roles/rolesMabs.js';
import Regis from '../../models/RegistroClientes/regisClientes.js';






var rutasFront = {
    listarRutas: async (req, res) => {

        try {
            const { allowedRoles } = req.body;

            // Validar que el rol exista si se envía (opcional)
            if (allowedRoles) {
                const rolExistente = await Roles.findById(allowedRoles);
                if (!rolExistente) {
                    return res.status(404).json({
                        success: false,
                        message: "El rol especificado no existe en la base de datos.",
                    });
                }
                // ✅ Ya no se restringe por tipo de rol: todos los roles válidos pueden listar rutas
            }

            // SELECT de todas las rutas
            const rutas = await rutaSeguridad.find({}, "name path component layout icon isActive order allowedRoles")
                .populate("allowedRoles", "rol")
                .sort({ order: 1 });

            if (!rutas.length) {
                return res.status(404).json({
                    success: false,
                    message: "No se encontraron rutas registradas en el sistema.",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Listado de rutas obtenido correctamente.",
                total: rutas.length,
                data: rutas,
            });
        } catch (error) {
            console.error("Error al listar rutas:", error);
            return res.status(500).json({
                success: false,
                message: "Error interno del servidor al listar las rutas.",
                error: error.message,
            });
        }

    },

    crearRutaAdmin: async (req, res) => {
        try {
            const {
                name,
                path,
                component,
                layout,
                icon,
                allowedRoles,
                isActive,
                order,
                creadoPorUsuario,
                creadoPorRol,
            } = req.body;

            // Validar campos obligatorios
            if (!name || !path || !component || !allowedRoles || !creadoPorUsuario || !creadoPorRol) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Faltan campos obligatorios: name, path, component, allowedRoles, creadoPorUsuario o creadoPorRol.",
                });
            }

            // Verificar que el usuario creador exista
            const usuarioCreador = await Regis.findById(creadoPorUsuario);
            if (!usuarioCreador) {
                return res.status(404).json({
                    success: false,
                    message: "El usuario que intenta crear la ruta no existe en la base de datos.",
                });
            }

            // Verificar que el rol del usuario creador exista
            const rolCreador = await Roles.findById(creadoPorRol);
            if (!rolCreador) {
                return res.status(404).json({
                    success: false,
                    message: "El rol del usuario creador no existe en la base de datos.",
                });
            }

            // Validar que solo DIOS o superAdmin puedan crear rutas
            const rolesPermitidos = ["DIOS", "superAdmin"];
            if (!rolesPermitidos.includes(rolCreador.rol)) {
                return res.status(403).json({
                    success: false,
                    message: `El rol '${rolCreador.rol}' no tiene permisos para crear rutas. Solo DIOS o superAdmin pueden hacerlo.`,
                });
            }

            // Verificar que el rol asignado a la ruta exista
            const rolRuta = await Roles.findById(allowedRoles);
            if (!rolRuta) {
                return res.status(404).json({
                    success: false,
                    message: "El rol asociado a la ruta no existe en la base de datos.",
                });
            }

            // Validar duplicado de path
            const existeRuta = await Rutas.findOne({ path });
            if (existeRuta) {
                return res.status(409).json({
                    success: false,
                    message: `Ya existe una ruta con el path '${path}'.`,
                });
            }

            // Crear la nueva ruta
            const nuevaRuta = new rutaSeguridad({
                name,
                path,
                component,
                layout,
                icon,
                allowedRoles,
                isActive,
                order,
                creadoPorUsuario,
                creadoPorRol,
                fechaCreacionUsu
            });

            const rutaGuardada = await nuevaRuta.save();

            // Respuesta exitosa
            return res.status(201).json({
                success: true,
                message: `Ruta '${name}' creada exitosamente por el usuario '${usuarioCreador.nombreUsuario}' con rol '${rolCreador.rol}'.`,
                data: rutaGuardada,
            });

        } catch (error) {
            console.error("Error al crear la ruta:", error);
            return res.status(500).json({
                success: false,
                message: "Error interno del servidor al crear la ruta.",
                error: error.message,
            });
        }
    }

};
export default rutasFront;
