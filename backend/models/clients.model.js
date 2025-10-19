import { pool } from "../config/db.js";

// ✅ Obtener todos los clientes
export async function getAllClients() {
  const result = await pool.query("SELECT * FROM clients ORDER BY id DESC");
  return result.rows;
}

// ✅ Insertar cliente
export async function insertClient(name, address, latitude, longitude, email) {
  await pool.query(
    "INSERT INTO clients (name, address, latitude, longitude, email) VALUES ($1, $2, $3, $4, $5)",
    [name, address, latitude, longitude, email]
  );
}

// ✅ Actualizar cliente
export async function updateClient(id, name, address, latitude, longitude, email) {
  const query = `
    UPDATE clients 
    SET 
      name = COALESCE($2, name),
      address = COALESCE($3, address),
      latitude = COALESCE($4, latitude),
      longitude = COALESCE($5, longitude),
      email = COALESCE($6, email)
    WHERE id = $1
    RETURNING *;
  `;
  const values = [id, name, address, latitude, longitude, email];
  const result = await pool.query(query, values);
  return result.rows[0];
}

// ✅ Eliminar cliente
export async function deleteClient(id) {
  await pool.query("DELETE FROM clients WHERE id = $1", [id]);
}
