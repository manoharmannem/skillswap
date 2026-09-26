import express from "express";
import { getUsers, getUserById } from "../controllers/userController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
const router = express.Router();
router.get("/", requireAuth, getUsers);
router.get("/:id", requireAuth, getUserById);
export default router;
