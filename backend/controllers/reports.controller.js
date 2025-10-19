import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { fileURLToPath } from "url";
import { createReport } from "../models/reports.model.js";
import { pool } from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateReport(req, res) {
  try {
    const { visit_id } = req.params;

    // 1) Obtener datos de la visita (cliente + tecnico)
    const query = `
      SELECT v.id, c.name AS client_name, u.name AS technician_name,
             v.check_in, v.check_out, v.status
      FROM visits v
      JOIN clients c ON v.client_id = c.id
      JOIN users u ON v.technician_id = u.id
      WHERE v.id = $1
    `;
    const result = await pool.query(query, [visit_id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Visita no encontrada" });
    const visit = result.rows[0];

    // 2) Preparar paths y streams
    const reportsDir = path.join(__dirname, "../reports");
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

    const filename = `reporte_visita_${visit_id}.pdf`;
    const pdfPath = path.join(reportsDir, filename);

    // 3) Setear headers para visualizar el PDF en el navegador
res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
res.setHeader("Content-Type", "application/pdf");


    // 4) Crear documento PDF
    const doc = new PDFDocument({ autoFirstPage: true });

    // Pipe: escribimos simultáneamente al disco (copia) y al cliente (respuesta)
    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);
    doc.pipe(res); // esto enviará el PDF al navegador directamente

    // 5) Contenido del PDF
    doc.fontSize(20).text("Reporte de Visita SkyNet", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`ID de visita: ${visit.id}`);
    doc.text(`Cliente: ${visit.client_name}`);
    doc.text(`Técnico: ${visit.technician_name}`);
    doc.text(`Estado: ${visit.status}`);
    doc.text(`Check-In: ${visit.check_in || "Pendiente"}`);
    doc.text(`Check-Out: ${visit.check_out || "Pendiente"}`);
    doc.moveDown();
    doc.text("Gracias por utilizar el sistema SkyNet.", { align: "center" });

    // Finalizamos documento (esto desencadena el finish en los streams)
    doc.end();

    // 6) Cuando la copia en disco termine, registramos en BD (no bloquea la respuesta)
    writeStream.on("finish", async () => {
      try {
        // Validación básica: tamaño mínimo razonable
        const stats = fs.statSync(pdfPath);
        if (stats.size < 200) { // 200 bytes es muy pequeño para un PDF normal
          console.error("⚠️ PDF generado demasiado pequeño / posiblemente corrupto:", pdfPath, "bytes:", stats.size);
          // No respondemos aquí porque ya enviamos el PDF al cliente vía res.pipe
          // pero registramos el fallo en consola y no insertamos en la tabla reports
          return;
        }

        // Guardar referencia en la tabla reports (url relativa)
        const pdfUrl = `/reports/${filename}`;
        await createReport(visit_id, pdfUrl);
        console.log("✅ Reporte guardado en BD y disco:", pdfPath);
      } catch (err) {
        console.error("❌ Error al guardar/registrar el PDF:", err);
      }
    });

    writeStream.on("error", (err) => {
      console.error("❌ Error escribiendo el PDF en disco:", err);
      // Nota: no podemos enviar otra respuesta aquí (res ya fue usada), pero lo logueamos
    });

    // También escuchamos errores del doc (PDFKit)
    doc.on("error", (err) => {
      console.error("❌ Error en PDFKit:", err);
    });

    // IMPORTANTE: No hagas res.json aquí — ya estamos enviando el PDF con doc.pipe(res)
  } catch (error) {
    console.error("Error generando reporte:", error);
    // Si aquí falla antes de haber escrito headers, respondemos con error
    if (!res.headersSent) {
      res.status(500).json({ error: "Error al generar el reporte" });
    } else {
      // headers ya enviados, solo log
      console.error("Headers ya enviados, no se puede devolver JSON de error");
    }
  }
}
