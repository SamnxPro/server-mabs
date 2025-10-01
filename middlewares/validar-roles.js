import { response } from "express";
import regiUsu from "../models/RegistroClientes/regisClientes.js";

const esAdminRole = async (req, res = response, next) => {
    if (!req.registrosUsu ) {
        return res.status(500).json({
            msg:'Se requiere verificar el role sin validar el token primero'
        });
    }

    const {rol, nickname} = req.registrosUsu 
    
    if (rol !== 'ADMINISTRADOR') {
        return res.status(401).json({
            msg:`${nickname} no es administrador - no puede hacer modificaciones`
        })
    }

    next();
}

const esTenant = async (req, res = response, next) => {
    if (!req.registrosUsu ) {
        return res.status(500).json({
            msg:'Se requiere verificar el role sin validar el token primero'
        });
    }

    const {rol, nickname} = req.registrosUsu 
    
    if (rol !== 'ADMINISTRADOR') {
        return res.status(401).json({
            msg:`${nickname} no es administrador global - no puede hacer modificaciones`
        })
    }

    next();
}

async function esTenerRoles(nickname = '') {
    const existeEmail = await regiUsu.findOne({ nickname });
    if (existeEmail) {
        throw new Error(`El correo ya existe`);
    }
}