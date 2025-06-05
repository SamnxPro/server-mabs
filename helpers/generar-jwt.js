import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Generar un JWT firmado y encriptado
export async function generarJWT(uid = '') {
  return new Promise((resolve, reject) => {
    const payload = { uid };

    // Asegúrate de que SECRETKEY tenga al menos 32 caracteres
    const secretKey = process.env.SECRETKEY.padEnd(32, '0').substring(0, 32); // Asegurar que tenga 32 caracteres
    const iv = secretKey.substring(0, 16); // Los primeros 16 caracteres de la SECRETKEY se usarán como IV

    // Generar el JWT firmado
    jwt.sign(payload, process.env.SECRETKEY, { expiresIn: '1h' }, (err, token) => {
      if (err) {
        console.error("Error al firmar el token:", err.message);
        reject('No se pudo generar el token');
      } else {
        console.log("JWT firmado (sin encriptar):", token); // Verificar si se genera el token

        try {
          // Encriptar el token
          const cipher = crypto.createCipheriv(
            'aes-256-cbc',
            Buffer.from(secretKey, 'utf8'), // Clave de cifrado derivada de SECRETKEY
            Buffer.from(iv, 'utf8') // IV derivado de la misma SECRETKEY
          );

          let encryptedToken = cipher.update(token, 'utf8', 'hex');
          encryptedToken += cipher.final('hex');

          console.log("JWT encriptado:", encryptedToken); // Verificar el token encriptado
          resolve(encryptedToken); // Retornar el token encriptado
        } catch (error) {
          console.error("Error al encriptar el token:", error.message);
          reject('No se pudo encriptar el token');
        }
      }
    });
  });
}