import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import userRouter from "./routes/userRouter.js";
import jwt from "jsonwebtoken";
import productRouter from "./routes/productRouter.js";
import orderRouter from "./routes/orderRouter.js";
import paymentRouter from "./routes/paymentRouter.js";
import analyticsRouter from "./routes/analyticsRouter.js";
import cors from "cors";
import recRouter from "./routes/recommendationRouter.js";

const app = express();

const mongodburl = process.env.MONGO_DB_URI;

app.use(cors());

mongoose.connect(mongodburl, {});

const connection = mongoose.connection;

connection.once("open", () => {
  console.log("MongoDB database connection established");
});

app.use(bodyParser.json());

app.use((req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  // console.log(token)

  if (token != null) {
    jwt.verify(token, process.env.SECRET, (error, decoded) => {
      if (!error) {
        req.user = decoded;
      }
    });
  }
  next();
});

app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/recommendations", recRouter);
app.use("/api/analytics", analyticsRouter);
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
