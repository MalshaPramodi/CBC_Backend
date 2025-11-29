import { Router } from "express";
const router = Router();
import { getAnalyticsSummary } from "../controllers/analyticsController.js";

router.get("/summary", getAnalyticsSummary);

export default router;
