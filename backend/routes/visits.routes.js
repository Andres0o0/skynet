import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { 
  getVisits,       // ✅ en plural
  createVisitController, 
  editVisit, 
  removeVisit,
  registerVisitProgress
} from "../controllers/visits.controller.js";


const router = express.Router();

router.get("/", verifyToken, getVisits);
router.post("/", verifyToken, authorizeRoles("admin", "supervisor"), createVisitController);
router.put("/:id", verifyToken, authorizeRoles("admin", "supervisor", "tecnico"), editVisit);
router.put("/:id/register", verifyToken, authorizeRoles("tecnico"), registerVisitProgress);
router.delete("/:id", verifyToken, authorizeRoles("admin", "supervisor"), removeVisit);

export default router;
