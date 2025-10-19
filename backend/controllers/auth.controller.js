import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { getAllUsers, insertUser, findUserByEmail } from '../models/users.model.js';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET; // ✅ usa el .env

// ✅ Obtener todos los usuarios
export const getUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// ✅ Registrar usuario con contraseña encriptada
export const addUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await insertUser(name, email, hashedPassword, role);

    res.status(201).json({ message: 'Usuario creado', user: newUser });
  }catch (error) {
  console.error("❌ Error detallado al crear usuario:", error);
  res.status(500).json({ error: error.message });
}

};

// ✅ Login con generación de token
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: { id: user.id, name: user.name, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};
