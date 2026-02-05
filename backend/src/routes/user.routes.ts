import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { getProfile, updateProteinTarget } from "../controllers/user.controller";

const router = Router();

// Get user profile
router.get("/profile", authMiddleware, getProfile);

// Update daily protein target
router.post("/protein-target", authMiddleware, updateProteinTarget);

export default router;
