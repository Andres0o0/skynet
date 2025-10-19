import bcrypt from "bcryptjs";
import {
  getAllUsers,
  insertUser,
  updateUser,
  deleteUser,
} from "../models/users.model.js";

// ✅ Obtener todos los usuarios (solo admin)
export async function getUsers(req, res) {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
}

// ✅ Crear un nuevo usuario (solo admin)
export async function createUser(req, res) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await insertUser(name, email, hashedPassword, role);
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ error: "Error al crear usuario" });
  }
}

// ✅ Actualizar usuario existente (solo admin)
export async function editUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const updatedUser = await updateUser(id, name, email, role);
    if (!updatedUser)
      return res.status(404).json({ error: "Usuario no encontrado" });

    res.json(updatedUser);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
}

// ✅ Eliminar usuario (solo admin)
export async function removeUser(req, res) {
  try {
    const { id } = req.params;
    await deleteUser(id);
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
}
