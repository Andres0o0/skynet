import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

import {
  getUsers,
  createUser,
  editUser,
  removeUser,
} from "../controllers/users.controller.js";

const router = express.Router();

// 🧑‍💼 Solo Admin puede gestionar usuarios
router.get("/", verifyToken, authorizeRoles(["admin"]), getUsers);
router.post("/", verifyToken, authorizeRoles(["admin"]), createUser);
router.put("/:id", verifyToken, authorizeRoles(["admin"]), editUser);
router.delete("/:id", verifyToken, authorizeRoles(["admin"]), removeUser);

export default router;
