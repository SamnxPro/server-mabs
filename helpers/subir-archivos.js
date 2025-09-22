import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import Img from '../models/RegistroClientes/regisClientesImg.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const subirArchivoMabs = (files, extensionesValidas = [ 'png', 'jpeg', 'jpg'], usuarioId) => {
 return new Promise(async (resolve, reject) => {
        
        const { img } = files;

        // 1️⃣ Validar la extensión
        const nombreCortado = img.name.split('.');
        const extension = nombreCortado[nombreCortado.length - 1];

        if (!extensionesValidas.includes(extension)) {
            return reject(`La extensión ${extension} no es permitida. Extensiones permitidas: ${extensionesValidas.join(', ')}`);
        }

        try {
            // 2️⃣ Leer la imagen y convertirla en buffer
            const imageData = img.data; // Esto depende de la librería usada para manejar el archivo (por ejemplo, express-fileupload)

            // 3️⃣ Crear el nombre único del archivo
            const nombreUnico = `${uuidv4()}.${extension}`;

            // 4️⃣ Guardar la imagen en la base de datos
            const nuevaImagen = new Img({
                nombre: nombreUnico,
                data: imageData, // Almacena el buffer
                mimetype: img.mimetype,
                size: img.size,
                usuario: usuarioId
            });

            // 5️⃣ Guardar en la base de datos
            await nuevaImagen.save();

            // 6️⃣ Responder con el nombre único o la referencia de la imagen
            resolve(nuevaImagen);

        } catch (error) {
            reject('Error al guardar la imagen en la base de datos: ' + error.message);
        }
    });
};
export default subirArchivoMabs;
