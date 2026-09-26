import express from "express";
import { listConnections, sendRequest, updateRequest } from "../controllers/connectionController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
const router = express.Router();
router.use(requireAuth);
router.get("/", listConnections);
router.post("/", sendRequest);
router.patch("/:id", updateRequest);
export default router;
