import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export async function sendEmail(to, subject, text, attachments = []) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text,
      attachments,
    });

    console.log("✉️ Correo enviado:", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Error enviando correo:", err);
    throw err;
  }
}
