import jwt from 'jsonwebtoken'
import crypto from 'crypto';
import refered from '../../models/Referidos/referidosClients'

const validarJwtReferidos= async (req, res, next) => {
  const token = req.header('plot');
  
  if (!token) {
    return res.status(401).json({
      msg: 'No hay token en la petición',
    });
  }

  try {
    // Asegúrate de que SECRETKEY tenga al menos 32 caracteres
    const secretKey = process.env.SECRETKEYREF.padEnd(32, '0').substring(0, 32); // Asegurar que tenga 32 caracteres
    const iv = secretKey.substring(0, 16); // Los primeros 16 caracteres de la SECRETKEY se usarán como IV

    console.log("Token recibido (cifrado):", token);

    // **1. Desencriptar el token**
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(secretKey, 'utf8'), // Clave de cifrado derivada de SECRETKEY
      Buffer.from(iv, 'utf8') // IV derivado de la misma SECRETKEY
    );

    let decryptedToken = decipher.update(token, 'hex', 'utf8');
    decryptedToken += decipher.final('utf8');

    console.log("JWT desencriptado:", decryptedToken);

    // **2. Verificar el JWT**
    const { uid } = jwt.verify(decryptedToken, process.env.SECRETKEYREF);
    console.log("Payload JWT verificado:", uid);

    // **3. Validar si el UID existe en la base de datos**
    const registrosUsu = await refered.findById(uid);

    if (!registrosUsu) {
      return res.status(401).json({
        msg: 'Token no válido - Usuario no existe',
      });
    }

    // **4. Verificar si el usuario está activo**
    if (!registrosUsu.estado) {
      return res.status(401).json({
        msg: 'Token no válido - Usuario inactivo',
      });
    }

    // **5. Agregar los datos del usuario a la solicitud**
    req.registrosUsu = registrosUsu;
    next();

  } catch (error) {
    console.error("Error en la validación del token:", error.message);
    res.status(401).json({
      msg: 'Token no válido',
    });
  }
};

export default validarJwtReferidos