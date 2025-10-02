import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import refered from '../../models/Referidos/referidosClients.js';

const validarJwtReferidos = async (req, res, next) => {
  const token = req.params.token;

  if (!token) {
    return res.status(401).json({ msg: 'No hay token en la petición' });
  }

  try {
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

    // 2. Verificar JWT
    const payload = jwt.verify(decryptedToken, process.env.SECRETKEYREF);
    console.log("✅ Payload desencriptado:", payload);

    // 3. Buscar la relación en BD
    console.log("🔍 Buscando relación con:", {
      refTok: payload.refTok,
      parentId: payload.parentId
    });

    const relacion = await refered.findOne({
      tokenVerificacionReferido: payload.refTok,
      usuarioId: payload.parentId,
      estado: false
    }).populate("usuarioId", "nombre_cliente correo estado");

    console.log("📌 Relación encontrada:", relacion);

    if (!relacion) {
      return res.status(401).json({ msg: 'Token no válido o relación no encontrada' });
    }

    if (!relacion.usuarioId.estado) {
      return res.status(401).json({ msg: 'El usuario que generó el enlace está inactivo' });
    }

    req.referidoRelacion = relacion;
    req.payloadRef = payload;

    next();

  } catch (error) {
    console.error("❌ Error en la validación del token de referido:", error.message);
    res.status(401).json({ msg: 'Token de invitación no válido' });
  }
};

export default validarJwtReferidos;
