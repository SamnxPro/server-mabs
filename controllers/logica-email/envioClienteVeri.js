import nodemailer  from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: "srjuandi800@gmail.com",
      pass: "rxgp hiyt vwpw dbdl"
    },
  });

  // Exportar el transporter como el valor predeterminado (default)
export default transporter;