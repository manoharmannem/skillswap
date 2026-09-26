import express from "express";
import { getProfiles, getMyProfile, getProfileById, updateMyProfile } from "../controllers/profileController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
const router = express.Router();
router.get("/", requireAuth, getProfiles);
router.get("/me", requireAuth, getMyProfile);
router.get("/:id", requireAuth, getProfileById);
router.put("/me", requireAuth, updateMyProfile);
export default router;
