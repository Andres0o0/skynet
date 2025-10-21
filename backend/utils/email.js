import { Resend } from "resend";
import fs from "fs";
import path from "path";

// ⚙️ Instancia de Resend con tu API key (asegúrate de tenerla en .env)
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Envía un correo con o sin archivo adjunto usando Resend
 * @param {string} to - correo del destinatario
 * @param {string} subject - asunto del correo
 * @param {string} text - contenido del correo
 * @param {Array} attachments - archivos adjuntos [{ filename, path }]
 */
export async function sendEmail(to, subject, text, attachments = []) {
  try {
    console.log("📨 Intentando enviar correo a:", to);

    // 📎 Procesar adjuntos si existen
    const files = attachments.map((file) => ({
      filename: file.filename,
      content: fs.readFileSync(path.resolve(file.path)).toString("base64"),
    }));

    // ✅ Envío con dominio propio
    const response = await resend.emails.send({
      from: "Soporte SkyNet <notificaciones@skynetgt.online>", // 👈 remitente real de tu dominio
      to,
      subject,
      text,
      attachments: files,
    });

    console.log("✅ Correo enviado correctamente:", response.id || response);
    return response;
  } catch (error) {
    console.error("❌ Error enviando correo:", error);
    throw error;
  }
}
