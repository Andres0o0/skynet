import { pool } from "../config/db.js";

export async function createReport(visit_id, pdf_url) {
  const query = `INSERT INTO reports (visit_id, pdf_url) VALUES ($1, $2) RETURNING *`;
  const values = [visit_id, pdf_url];
  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function getReports() {
  const result = await pool.query("SELECT * FROM reports ORDER BY id DESC");
  return result.rows;
}

export async function getReportByVisit(visit_id) {
  const result = await pool.query("SELECT * FROM reports WHERE visit_id = $1", [visit_id]);
  return result.rows[0];
}
