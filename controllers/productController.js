import Product from "../models/product.js";
import { isAdmin } from "./userController.js";
import Order from "../models/order.js";

import mongoose from "mongoose";

// --- FUNCTION for Newest Products ---
export async function getNewArrivals(req, res) {
  try {
    const newProducts = await Product.find({}).sort({ createdAt: -1 }).limit(4);
    res.json(newProducts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching new arrivals", error });
  }
}

// --- Trending Products Logic ---
export async function getTrendingProducts(req, res) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // This pipeline  matches the Order schema
    const trendingProductInfo = await Order.aggregate([
      // 1. Filter orders by the 'date' field
      { $match: { date: { $gte: thirtyDaysAgo } } },

      // 2. Deconstruct the 'orderedItems' array
      { $unwind: "$orderedItems" },

      // 3. Group by product 'name' and sum the quantity
      {
        $group: {
          _id: "$orderedItems.name", // Group by the product name
          totalQuantitySold: { $sum: "$orderedItems.quantity" },
        },
      },

      // 4. Sort by the total quantity sold
      { $sort: { totalQuantitySold: -1 } },

      // 5. Limit to the top 4
      { $limit: 4 },
    ]);

    // Get the product names from the aggregation result
    const productNames = trendingProductInfo.map((p) => p._id);

    // Fetch the full product details for those names
    const trendingProducts = await Product.find({
      productName: { $in: productNames },
    });

    // Sort the final list to match the trending rank
    const sortedTrendingProducts = productNames
      .map((name) =>
        trendingProducts.find(
          (p) => p.productName.toLowerCase() === name.toLowerCase()
        )
      )
      .filter((p) => p); // Filter out any nulls
    // --- DEBUG LINE ADDED ---
    // This will print the exact data being sent to the frontend in the terminal.
    console.log(
      "DEBUG: Final Trending Products Sent to Frontend:",
      JSON.stringify(sortedTrendingProducts, null, 2)
    );

    res.json(sortedTrendingProducts);
  } catch (error) {
    console.error("Error fetching trending products:", error);
    res
      .status(500)
      .json({ message: "Error fetching trending products", error });
  }
}

export function createProduct(req, res) {
  if (!isAdmin(req)) {
    res.json({
      message: "Please login as administrator to add products",
    });
    return;
  }

  const newProductData = req.body;
  const product = new Product(newProductData);

  product
    .save()
    .then(() => {
      res.json({
        message: "Product created",
      });
    })
    .catch((error) => {
      res.status(403).json({
        message: error,
      });
    });
}

export function getProducts(req, res) {
  Product.find().then((products) => {
    res.json(products);
  });
}

export async function getTotalStock(req, res) {
  try {
    if (isAdmin(req)) {
      const totalStock = await Product.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: "$stock" },
          },
        },
      ]);
      res.json({ totalStock: totalStock[0]?.total || 0 });
    } else {
      res.status(403).json({ message: "Unauthorized" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export function deleteProduct(req, res) {
  if (!isAdmin(req)) {
    res.status(403).json({
      message: "Please login as asministrator to delete products",
    });
    return;
  }

  const productId = req.params.productId;

  Product.deleteOne({ productId: productId })
    .then(() => {
      res.json({
        message: "Product Deleted",
      });
    })
    .catch((error) => {
      res.status(403).json({
        message: error,
      });
    });
}

export function updateProduct(req, res) {
  if (!isAdmin(req)) {
    res.status(403).json({
      message: "Please login as administrator to update products",
    });
    return;
  }
  const productId = req.params.productId;
  const newProductData = req.body;

  Product.updateOne({ productId: productId }, newProductData)
    .then(() => {
      res.json({
        message: "Product Updated",
      });
    })
    .catch((error) => {
      res.status(403).json({
        message: error,
      });
    });
}

export async function getProductById(req, res) {
  try {
    const productId = req.params.productId;
    const product = await Product.findOne({ productId: productId });
    res.json(product);
  } catch (e) {
    res.status(500).json({
      e,
    });
  }
}

export async function searchProducts(req, res) {
  const query = req.params.query;
  try {
    const products = await Product.find({
      $or: [
        { productName: { $regex: query, $options: "i" } },
        { altNames: { $elemMatch: { $regex: query, $options: "i" } } },
      ],
    });

    res.json(products);
  } catch (e) {
    res.status(500).json({
      e,
    });
  }
}
