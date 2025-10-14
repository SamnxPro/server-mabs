import nodemailer from "nodemailer";
import dotenv from "dotenv";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first"); // fuerza IPv4, evita errores EAI_AGAIN
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});
console.log("MAIL_USER:", process.env.MAIL_USER);
console.log("MAIL_PASSWORD:", process.env.MAIL_PASSWORD ? "OK" : "MISSING");
export default transporter;
