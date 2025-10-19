// backend/middleware/role.middleware.js
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Normalizamos para evitar anidamiento accidental ([[...]])
      const roles = allowedRoles.flat().map(r => String(r).toLowerCase().trim());
      const userRole = req.user?.role?.toLowerCase().trim();


      if (!req.user || !roles.includes(userRole)) {
        return res.status(403).json({ error: "Acceso denegado: rol no autorizado" });
      }

      next();
    } catch (err) {
      console.error("Error en authorizeRoles:", err);
      res.status(500).json({ error: "Error al verificar permisos" });
    }
  };
};
