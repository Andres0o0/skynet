import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Envía un correo usando Resend
 * @param {string} to - Email del destinatario
 * @param {string} subject - Asunto del correo
 * @param {string} text - Cuerpo en texto plano
 */
export async function sendEmail(to, subject, text) {
  try {
    const response = await resend.emails.send({
      from: "Skynet <onboarding@resend.dev>", // o tu dominio verificado
      to,
      subject,
      text,
    });
    console.log("✅ Correo enviado correctamente con Resend:", response.id);
  } catch (error) {
    console.error("❌ Error enviando correo con Resend:", error);
  }
}
