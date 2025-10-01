import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import refered from '../../models/Referidos/referidosClients.js';

const validarJwtReferidos = async (req, res, next) => {
  const token = req.header('plot'); 

  if (!token) {
    return res.status(401).json({ msg: 'No hay token en la petición' });
  }

  try {
    // Claves para desencriptar
    const secretKey = process.env.SECRETKEYREF.padEnd(32, '0').substring(0, 32);
    const iv = secretKey.substring(0, 16);

    // 1. Desencriptar
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(secretKey, 'utf8'),
      Buffer.from(iv, 'utf8')
    );
    let decryptedToken = decipher.update(token, 'hex', 'utf8');
    decryptedToken += decipher.final('utf8');

    // 2. Verificar JWT (firmado con SECRETKEY normal, no con SECRETKEYREF)
    const payload = jwt.verify(decryptedToken, process.env.SECRETKEY);

    // 3. Buscar la relación en la BD
    const relacion = await refered.findOne({
      tokenVerificacionReferido: payload.refTok,
      estado: false
    }).populate("usuarioId", "nombre_cliente correo estado");

    if (!relacion) {
      return res.status(401).json({ msg: 'Token no válido o relación no encontrada' });
    }

    // 4. Validar si el usuario que invita está activo
    if (!relacion.usuarioId.estado) {
      return res.status(401).json({ msg: 'El usuario que generó el enlace está inactivo' });
    }

    // 5. Exponer en req la relación de referido
    req.referidoRelacion = relacion;
    next();

  } catch (error) {
    console.error("Error en la validación del token de referido:", error.message);
    res.status(401).json({ msg: 'Token de invitación no válido' });
  }
};

export default validarJwtReferidos;
