import { response } from 'express';
import refere from '../../models/Referidos/referidosClients.js';

var referidoToken = {

    verificarReferido: async (req, res) => {

        try {
            const { id, token } = req.params;

            // 1. Buscar la relación con ese usuarioId y token
            const relacion = await refere.findOne({
                usuarioId: id,
                tokenVerificacionReferido: token
            });

            if (!relacion) {
                return res.status(400).json({ msg: 'El enlace no es válido o ya fue usado' });
            }

            // 2. Verificar si ya está activa
            if (relacion.estado) {
                return res.status(400).json({ msg: 'El referido ya fue verificado anteriormente' });
            }

            // 3. Activar la relación
            relacion.estado = true;
            relacion.tokenVerificacionReferido = null;
            await relacion.save();

            res.status(200).json({
                msg: 'Referido verificado con éxito',
                relacion
            });

        } catch (error) {
            console.error('Error en la verificación del referido:', error);
            res.status(500).json({ error: 'Hubo un error en la verificación del referido' });
        }
    },
}

export default referidoToken;
