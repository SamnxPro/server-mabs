import { response } from 'express';

const validarArchivosSubir = async (req, res = response, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ msg: 'No hay archivos en la petición.' });
    }

    // Valida que exista al menos un archivo (cualquiera)
    const archivo = Object.values(req.files)[0]; // Toma el primer archivo enviado
    if (!archivo) {
        return res.status(400).json({ msg: 'No se encontró ningún archivo válido.' });
    }

    next();
};

export default validarArchivosSubir;
