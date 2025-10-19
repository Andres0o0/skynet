// backend/models/visits.model.js
import { pool } from "../config/db.js";

// Obtener visitas por rol (incluye scheduled_date)
export async function getVisitsByRole(role, userId) {
  let q;
  let values = [];

  if (role === "admin" || role === "supervisor") {
    q = `
      SELECT v.id, v.client_id, c.name AS client_name,
             v.technician_id, u.name AS technician_name,
             v.check_in, v.check_out, v.status, v.scheduled_date, v.notes,
             c.latitude, c.longitude
      FROM visits v
      JOIN clients c ON v.client_id = c.id
      JOIN users u ON v.technician_id = u.id
      ORDER BY v.scheduled_date DESC NULLS LAST, v.id DESC;
    `;
  } else if (role === "tecnico") {
    q = `
      SELECT v.id, v.client_id, c.name AS client_name,
             v.technician_id, u.name AS technician_name,
             v.check_in, v.check_out, v.status, v.scheduled_date, v.notes,
             c.latitude, c.longitude
      FROM visits v
      JOIN clients c ON v.client_id = c.id
      JOIN users u ON v.technician_id = u.id
      WHERE v.technician_id = $1
      ORDER BY v.scheduled_date DESC NULLS LAST, v.id DESC;
    `;
    values = [userId];
  } else {
    return [];
  }

  const r = await pool.query(q, values);
  return r.rows;
}


export async function createVisit(client_id, technician_id, check_in, check_out, status, scheduled_date) {
  const q = `
    INSERT INTO visits (client_id, technician_id, check_in, check_out, status, scheduled_date)
    VALUES ($1,$2,$3,$4,$5,$6) RETURNING *;
  `;
  const values = [client_id, technician_id, check_in, check_out, status, scheduled_date];
  const r = await pool.query(q, values);
  return r.rows[0];
}

// versión genérica de edición (usa COALESCE para evitar nulificar datos)
export async function editVisitModel(id, client_id, technician_id, check_in, check_out, status, scheduled_date) {
  const q = `
    UPDATE visits SET
      client_id = COALESCE($2, client_id),
      technician_id = COALESCE($3, technician_id),
      check_in = COALESCE($4, check_in),
      check_out = COALESCE($5, check_out),
      status = COALESCE($6, status),
      scheduled_date = COALESCE($7, scheduled_date)
    WHERE id = $1 RETURNING *;
  `;
  const values = [id, client_id, technician_id, check_in, check_out, status, scheduled_date];
  const r = await pool.query(q, values);
  return r.rows[0];
}

export async function deleteVisitModel(id) {
  await pool.query("DELETE FROM visits WHERE id = $1", [id]);
}


