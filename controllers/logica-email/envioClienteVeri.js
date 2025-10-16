import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const MAIL_USER = process.env.MAIL_USER;

if (!BREVO_API_KEY) console.error("❌ BREVO_API_KEY no definida en .env");
if (!MAIL_USER) console.error("❌ MAIL_USER no definido en .env");

export async function enviarCorreo({ to, subject, htmlContent, textContent }) {
  try {
    const data = {
      sender: { email: MAIL_USER, name: "Mabs" },
      to: [{ email: to }],
      subject,
      htmlContent: htmlContent || `<p>${textContent}</p>`,
    };

    console.log("📨 Payload final enviado a Brevo:");
    console.log(JSON.stringify(data, null, 2));

    const response = await axios.post("https://api.brevo.com/v3/smtp/email", data, {
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    console.log("✅ Correo enviado correctamente:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error al enviar correo:", error.response?.data || error.message);
    throw error;
  }
}
 export default { enviarCorreo };