import express from 'express';
import { getClients, createClient, editClient, removeClient } from '../controllers/clients.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", verifyToken, authorizeRoles("admin", "supervisor"), getClients);
router.post("/", verifyToken, authorizeRoles("admin", "supervisor"), createClient);
router.put("/:id", verifyToken, authorizeRoles("admin", "supervisor"), editClient);
router.delete("/:id", verifyToken, authorizeRoles("admin"), removeClient);

export default router;
