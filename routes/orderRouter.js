import express from "express";
import {
  createOrder,
  getOrders,
  getQuote,
  getTotalOrders,
  getTotalRevenue,
  updateOrder,
} from "../controllers/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/", createOrder);
orderRouter.get("/", getOrders);
orderRouter.post("/quote", getQuote);
orderRouter.get("/total", getTotalOrders);
orderRouter.get("/total-revenue", getTotalRevenue);
orderRouter.put("/:orderId", updateOrder);

export default orderRouter;
