// backend/controllers/visits.controller.js
import {
  getVisitsByRole,
  createVisit,
  editVisitModel,
  deleteVisitModel
} from "../models/visits.model.js";

import { sendEmail } from "../utils/email.js";
import { createReport } from "../models/reports.model.js";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { fileURLToPath } from "url";
import { pool } from "../config/db.js";

// Convierte lo que venga del input <datetime-local> a una cadena "YYYY-MM-DD HH:mm:ss"
// y evita cualquier conversión a UTC.
// Si viene nulo o vacío, devuelve null.
function normalizeLocalDateTime(input) {
  if (!input) return null;
  // Si ya viene como "YYYY-MM-DDTHH:mm" o "YYYY-MM-DDTHH:mm:ss"
  // lo convertimos a "YYYY-MM-DD HH:mm:ss" sin Z y sin desfase.
  const d = new Date(input); // se interpreta en zona local del servidor, pero devolveremos sus componentes locales
  const YYYY = d.getFullYear();
  const MM   = String(d.getMonth() + 1).padStart(2, "0");
  const DD   = String(d.getDate()).padStart(2, "0");
  const hh   = String(d.getHours()).padStart(2, "0");
  const mm   = String(d.getMinutes()).padStart(2, "0");
  const ss   = String(d.getSeconds()).padStart(2, "0");
  return `${YYYY}-${MM}-${DD} ${hh}:${mm}:${ss}`;
}


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generatePdfForVisit(visit, visitId) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const reportsDir = path.join(__dirname, "../reports");
      if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

      const pdfPath = path.join(reportsDir, `reporte_visita_${visitId}.pdf`);
      const ws = fs.createWriteStream(pdfPath);
      doc.pipe(ws);

      doc.fontSize(18).text("Reporte de Visita SkyNet", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(`ID Visita: ${visitId}`);
      doc.text(`Cliente: ${visit.client_name || "—"}`);
      doc.text(`Técnico: ${visit.technician_name || "—"}`);
     doc.text(`Fecha programada: ${
  visit.scheduled_date ? new Date(visit.scheduled_date).toLocaleString("es-GT", { timeZone: "America/Guatemala" }) : "—"
}`);
doc.text(`Check-In: ${
  visit.check_in ? new Date(visit.check_in).toLocaleString("es-GT", { timeZone: "America/Guatemala" }) : "Pendiente"
}`);
doc.text(`Check-Out: ${
  visit.check_out ? new Date(visit.check_out).toLocaleString("es-GT", { timeZone: "America/Guatemala" }) : "Pendiente"
}`);

      doc.text(`Estado: ${visit.status || "—"}`);
     

      doc.moveDown();
      doc.text("Gracias por utilizar SkyNet.", { align: "center" });

      doc.end();

      ws.on("finish", () => resolve(pdfPath));
      ws.on("error", (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
}

// GET visitas
export async function getVisits(req, res) {
  try {
    const { role, id } = req.user;
    const visits = await getVisitsByRole(role, id);
    res.json(visits);
  } catch (error) {
    console.error("Error al obtener visitas:", error);
    res.status(500).json({ error: "Error al obtener visitas" });
  }
}

// Crear
export async function createVisitController(req, res) {
  try {
    let { client_id, technician_id, check_in, check_out, status, scheduled_date } = req.body;

    // 👇 Solo normalizamos fecha programada
    const scheduledLocal = normalizeLocalDateTime(scheduled_date);

    const newV = await createVisit(
      client_id,
      technician_id,
      check_in || null,
      check_out || null,
      status || "pending",
      scheduledLocal // 👈 guardar cadena local sin desfase
    );

    res.status(201).json(newV);
  } catch (error) {
    console.error("Error al crear visita:", error);
    res.status(500).json({ error: "Error al crear visita" });
  }
}


// Editar (mantengo generación de PDF+email si status === 'completed')
export async function editVisit(req, res) {
  try {
    const { id } = req.params;
    let { client_id, technician_id, check_in, check_out, status, scheduled_date, notes } = req.body;

    // 👇 Normaliza solo si llega valor
    const scheduledLocal = scheduled_date ? normalizeLocalDateTime(scheduled_date) : null;

    const updated = await editVisitModel(
      id,
      client_id,
      technician_id,
      check_in,
      check_out,
      status,
      scheduledLocal, // 👈 aquí
      notes
    );

    if (!updated) return res.status(404).json({ error: "Visita no encontrada" });

    // si quedó completed -> tarea async para generar PDF y enviar correo
    if (status === "completed") {
      (async () => {
        try {
          const visitQuery = `
            SELECT v.id, c.name AS client_name, c.email AS client_email,
                   u.name AS technician_name, v.check_in, v.check_out, v.status, v.scheduled_date, v.notes
            FROM visits v
            JOIN clients c ON v.client_id = c.id
            JOIN users u ON v.technician_id = u.id
            WHERE v.id = $1
          `;
          const vr = await pool.query(visitQuery, [id]);
          const visit = vr.rows[0];
          if (!visit) return;

          const pdfPath = await generatePdfForVisit(visit, id);
          const pdfUrl = `/reports/reporte_visita_${id}.pdf`;

          try { await createReport(id, pdfUrl); } catch (err) { console.error("createReport err:", err); }

const subject = `📋 Reporte de visita completada - ${visit.client_name}`;
const body = `
Estimado/a ${visit.client_name},

La visita programada con nuestro técnico ${visit.technician_name} ha sido completada correctamente.

Fecha programada: ${visit.scheduled_date ? new Date(visit.scheduled_date).toLocaleString() : "No registrada"}
⏰ Check-In: ${visit.check_in ? new Date(visit.check_in).toLocaleString() : "Pendiente"}
⏰ Check-Out: ${visit.check_out ? new Date(visit.check_out).toLocaleString() : "Pendiente"}

Adjunto encontrará el reporte en formato PDF con todos los detalles.

Gracias por confiar en SkyNet.
Saludos cordiales,
El equipo de SkyNet.
`;


          if (visit.client_email) {
            try {
              await sendEmail(
  visit.client_email,
  subject,
  body,
  [{ filename: `reporte_visita_${id}.pdf`, path: pdfPath }]
);
              console.log(`✅ Reporte enviado a ${visit.client_email}`);
            } catch (mailErr) {
              console.error("Error enviando correo:", mailErr);
            }
          } else {
            console.warn(`Cliente ${visit.client_name} (id ${visit.id}) no tiene email.`);
          }
        } catch (err) {
          console.error("Error async de reporte/mail:", err);
        }
      })();
    }

    res.json(updated);
  } catch (error) {
    console.error("Error al editar visita:", error);
    res.status(500).json({ error: "Error al editar visita" });
  }
}

// Eliminar
export async function removeVisit(req, res) {
  try {
    const { id } = req.params;
    await deleteVisitModel(id);
    res.json({ message: "Visita eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar visita:", error);
    res.status(500).json({ error: "Error al eliminar visita" });
  }
}


// ✅ Registrar avance de visita (check-in o check-out automático)
export async function registerVisitProgress(req, res) {
  try {
    const { id } = req.params;
    const { notes } = req.body;
 console.log("👉 Entrando a registerVisitProgress para visita:", id);
    // Obtiene la visita actual
    const result = await pool.query("SELECT * FROM visits WHERE id = $1", [id]);
    const visit = result.rows[0];
     console.log("📦 Datos de la visita:", visit);
    if (!visit) return res.status(404).json({ error: "Visita no encontrada" });

    let query, values;
    const localNow = new Date().toLocaleString("sv-SE").replace(" ", "T");

    // Si aún no tiene check_in → registrar check_in
    if (!visit.check_in) {
      query = `
        UPDATE visits
        SET check_in = $2, status = 'in_progress',
            notes = COALESCE($3, notes)
        WHERE id = $1 RETURNING *;
      `;
      values = [id, localNow, notes];
    } 
    // Si ya tiene check_in pero no check_out → registrar check_out y completar
    else if (!visit.check_out) {
      query = `
        UPDATE visits
        SET check_out = $2, status = 'completed',
            notes = COALESCE($3, notes)
        WHERE id = $1 RETURNING *;
      `;
      values = [id, localNow, notes];
    } 
    // Si ya tiene ambos → nada que hacer
    else {
      return res.status(400).json({ message: "La visita ya está completada" });
    }

    const updateRes = await pool.query(query, values);
    const updatedVisit = updateRes.rows[0];

    // ✅ Si se completó la visita -> generar PDF y enviar correo
    if (updatedVisit.status === "completed") {
      (async () => {
        try {
          const visitQuery = `
            SELECT v.id, c.name AS client_name, c.email AS client_email,
                   u.name AS technician_name, v.check_in, v.check_out, v.status, v.scheduled_date
            FROM visits v
            JOIN clients c ON v.client_id = c.id
            JOIN users u ON v.technician_id = u.id
            WHERE v.id = $1
          `;
          const vr = await pool.query(visitQuery, [id]);
          const vinfo = vr.rows[0];
          if (!vinfo) return;

          const pdfPath = await generatePdfForVisit(vinfo, id);
          const pdfUrl = `/reports/reporte_visita_${id}.pdf`;
          try { await createReport(id, pdfUrl); } catch (err) { console.error("createReport err:", err); }

          const subject = `📋 Reporte de visita completada - ${vinfo.client_name}`;
const body = `
Estimado/a ${vinfo.client_name},

La visita programada con nuestro técnico ${vinfo.technician_name} ha sido completada correctamente.

Fecha programada: ${vinfo.scheduled_date ? new Date(visit.scheduled_date).toLocaleString("es-GT", { timeZone: "America/Guatemala" })
 : "No registrada"}
⏰ Check-In: ${vinfo.check_in ? new Date(visit.check_in).toLocaleString("es-GT", { timeZone: "America/Guatemala" })
 : "Pendiente"}
⏰ Check-Out: ${vinfo.check_out ? new Date(visit.check_out).toLocaleString("es-GT", { timeZone: "America/Guatemala" })
 : "Pendiente"}

Adjunto encontrará el reporte en formato PDF con todos los detalles.

Gracias por confiar en SkyNet.
Saludos cordiales,
El equipo de SkyNet.
`;

console.log("📨 Intentando enviar correo a:", vinfo.client_email);

const sendRes = await sendEmail(
  vinfo.client_email,
  subject,
  body,
  [{ filename: `reporte_visita_${id}.pdf`, path: pdfPath }]
);

if (!sendRes.ok) {
  console.error("❌ Falló el envío con Resend:", sendRes.error);
} else {
  console.log("✅ Correo enviado con Resend, id:", sendRes.id);
}        } catch (err) {
          console.error("Error enviando correo tras completar visita:", err);
        }
      })();
    }

    res.json(updatedVisit);
  } catch (error) {
    console.error("Error en registerVisitProgress:", error);
    res.status(500).json({ error: "Error al registrar progreso de visita" });
  }
}


