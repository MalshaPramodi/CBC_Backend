import express from "express";
import {
  getRecommendations,
  getVectorRecommendations,
} from "../controllers/recommendationController.js";

const router = express.Router();

// This is your pre-existing route for association rule recommendations
router.get("/", getRecommendations);

// This is the new, separate route for AI-powered vector recommendations
router.get("/vector/:productId", getVectorRecommendations);

export default router;
