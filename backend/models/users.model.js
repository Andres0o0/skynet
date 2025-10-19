import { pool } from "../config/db.js";

// ✅ Obtener todos los usuarios
export async function getAllUsers() {
  const result = await pool.query(
    `SELECT id, name, email, role FROM users ORDER BY id ASC`
  );
  return result.rows;
}

// ✅ Crear nuevo usuario
export async function insertUser(name, email, password, role) {
  const result = await pool.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role`,
    [name, email, password, role]
  );
  return result.rows[0];
}

// ✅ Actualizar usuario existente
export async function updateUser(id, name, email, role) {
  const result = await pool.query(
    `UPDATE users
     SET name = COALESCE($2, name),
         email = COALESCE($3, email),
         role = COALESCE($4, role)
     WHERE id = $1
     RETURNING id, name, email, role`,
    [id, name, email, role]
  );
  return result.rows[0];
}

// ✅ Eliminar usuario
export async function deleteUser(id) {
  await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
}

export const findUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};
