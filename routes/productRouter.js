import express from "express";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  getTotalStock,
  searchProducts,
  updateProduct,
} from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.post("/", createProduct);
productRouter.get("/", getProducts);
productRouter.get("/total-stock", getTotalStock);
productRouter.get("/search/:query", searchProducts);
productRouter.get("/:productId", getProductById);
productRouter.delete("/:productId", deleteProduct);
productRouter.put("/:productId", updateProduct);
export default productRouter;
