// envioClienteVeri.js
import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const envio = async ({ from, to, subject, text, html }) => {
  try {
    if (!to || typeof to !== 'string') {
      throw new Error(`El campo "to" debe ser un string. Valor recibido: ${to}`);
    }

    const data = await resend.emails.send({
      from: "Pixeliado <onboarding@resend.dev>",
      to: "samnxpixel@gmail.com", // tu correo
      subject,
      text,
      html,
    });

    if (data.error) {
      console.error('❌ Error al enviar correo:', data.error);
    } else {
      console.log('✅ Correo enviado con éxito:', data);
    }
  } catch (error) {
    console.error('🚨 Error general en envioClienteVeri:', error.message);
  }
};

export default envio;
