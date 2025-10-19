import express from "express";
import { generateReport } from "../controllers/reports.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/generate/:visit_id", verifyToken, generateReport);

export default router;
