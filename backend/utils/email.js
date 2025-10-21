// backend/utils/email.js
import { Resend } from "resend";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const apiKey = process.env.RESEND_API_KEY;

// --- logs para verificar que la variable llegó a producción ---
if (!apiKey) {
  console.error("❌ RESEND_API_KEY NO DEFINIDA en process.env");
} else {
  console.log(`🔑 RESEND_API_KEY cargada (longitud): ${String(apiKey).length}`);
}

const resend = new Resend(apiKey);

/**
 * Envía correo usando Resend.
 * @param {string} to destinatario
 * @param {string} subject asunto
 * @param {string} text cuerpo en texto
 * @param {Array<{ filename: string, path: string }>} attachments
 */
export async function sendEmail(to, subject, text, attachments = []) {
  try {
    // Cargar adjuntos (si los hay)
    const resendAttachments =
      attachments?.length > 0
        ? attachments.map((a) => ({
            filename: a.filename,
            content: fs.readFileSync(a.path), // Buffer
          }))
        : undefined;

    const { data, error } = await resend.emails.send({
      from: "Skynet <onboarding@resend.dev>",  // remitente de pruebas
      to: [to],
      subject,
      text,
      attachments: resendAttachments,
    });

    if (error) {
      console.error("❌ Resend devolvió error:", error);
      return { ok: false, error };
    }

    console.log("✅ Resend envió correo, id:", data?.id);
    return { ok: true, id: data?.id };
  } catch (err) {
    console.error("❌ Error enviando correo con Resend:", err);
    return { ok: false, error: err?.message || String(err) };
  }
}
