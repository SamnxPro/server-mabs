import nodemailer  from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.MAIL_USER, // generated ethereal user 
      pass: process.env.MAIL_PASSWORD, // generated ethereal password
    },
  });

  // Exportar el transporter como el valor predeterminado (default)
export default transporter;