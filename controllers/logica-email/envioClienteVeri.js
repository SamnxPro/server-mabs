import { Resend } from 'resend';


const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail() {
  try {
    const data = await resend.emails.send({
      from: 'Pixeliado <onboarding@resend.dev>',
      to: 'samnxpixel@gmail.com',
      subject: 'Hello World',
      html: '<p>Congrats on sending your <strong>first email</strong>!</p>',
    });

    console.log('✅ Correo enviado con éxito:', data);
  } catch (error) {
    console.error('❌ Error al enviar correo:', error);
  }
}

sendEmail();