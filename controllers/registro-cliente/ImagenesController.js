import { response } from 'express';
import Regis from '../../models/RegistroClientes/regisClientes.js';
import { generarJWT } from '../../helpers/generar-jwt-registros/generar-jwt.js';
import nodemailer from 'nodemailer'
import bcryptjs from "bcryptjs";
import crypto from 'crypto';
import envio from '../logica-email/envioClienteVeri.js'
import RegistrarRelacionReferido from '../../controllers/arbol de referidos/referidosControllers.js'

import ArbolReferidos from '../arbol de referidos/referidosControllers.js'
import subirArchivoMabs from '../../helpers/subir-archivos.js';




var imgPerfil = {

    listar: async (req, res) => {


        try {
            // Define el filtro para incluir solo USUARIO y ADMINISTRADOR
            const query = { rol: { $in: ['CLIENTE', 'ADMINISTRADOR'] } };

            // Obtiene todos los registros que cumplen con el filtro
            const registr = await Regis.find(query);
            const total = await Regis.countDocuments(query);

            // Envía los registros como respuesta en formato JSON
            res.status(200).json({
                msg: 'Listado registros',
                total,
                registr,
            });
        } catch (error) {
            console.error('Error en la operación:', error);
            res.status(500).json({
                error: 'Hubo un error en la operación',
            });
        }
    },
    guardarImgPerfil: async (req, res = response) => {
        

        try {
            // Aquí tomamos el usuario autenticado desde tu middleware
            const usuarioId = req.registrosUsu._id;

            if (!usuarioId) {
                return res.status(401).json({ msg: 'Usuario no autenticado' });
            }

            const imagen = await subirArchivoMabs(req.files, undefined, usuarioId);
            await req.registrosUsu.updateOne({ img: imagen._id });

            res.json({
                msg: 'Imagen subida correctamente',
                id: imagen._id,
                nombre: imagen.nombre,
                mimetype: imagen.mimetype
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: 'Error al subir la imagen', error: error.message });
        }

    }




};

export default imgPerfil;
