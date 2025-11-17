import express from "express";
import {
  createProduct,
  deleteProduct,
  getNewArrivals,
  getProductById,
  getProducts,
  getTotalStock,
  getTrendingProducts,
  searchProducts,
  updateProduct,
} from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.post("/", createProduct);
productRouter.get("/", getProducts);
// This route now correctly points to the new arrivals logic
productRouter.get("/new-arrivals", getNewArrivals);

// This new route uses the powerful sales-velocity logic
productRouter.get("/trending", getTrendingProducts);
productRouter.get("/total-stock", getTotalStock);
productRouter.get("/search/:query", searchProducts);
productRouter.get("/:productId", getProductById);
productRouter.delete("/:productId", deleteProduct);
productRouter.put("/:productId", updateProduct);
export default productRouter;
