import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// backend/middleware/role.middleware.js
/*export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token requerido" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token inválido" });
    req.user = user;
    next();
  });
};*/
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

if (!token) return res.status(401).json({ error: "Token no proporcionado" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // 👈 Aquí debe venir { id, role, ... }
  

    
    next();
  } catch (err) {
    console.error("Error al verificar token:", err);
    return res.status(403).json({ error: "Token inválido o expirado" });
  }
};