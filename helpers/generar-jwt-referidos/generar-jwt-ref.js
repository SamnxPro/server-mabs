// utils/generarJwtRef.js
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const generarJWTrRef = (parentId, refTok) => {
  const payload = {
    parentId,   // el _id del usuario padre
    refTok      // tokenVerificacionReferido único de la relación
  };

  const token = jwt.sign(payload, process.env.SECRETKEYREF, { expiresIn: "2h" });

  // Encriptar antes de devolver
  const secretKey = process.env.SECRETKEYREF.padEnd(32, "0").substring(0, 32);
  const iv = secretKey.substring(0, 16);

  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(secretKey, "utf8"),
    Buffer.from(iv, "utf8")
  );

  let encrypted = cipher.update(token, "utf8", "hex");
  encrypted += cipher.final("hex");

  return encrypted;
};
