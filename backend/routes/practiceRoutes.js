import express from "express";
import { getPractice, updatePractice } from "../controllers/practiceController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
const router = express.Router();
router.use(requireAuth);
router.get("/", getPractice);
router.put("/", updatePractice);
export default router;
