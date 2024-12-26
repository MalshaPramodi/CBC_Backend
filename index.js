import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import productRouter from "./routes/productRouter.js";
import userRouter from "./routes/userRouter.js";
import jwt from "jsonwebtoken";


const app = express();

const mongodburl = "mongodb+srv://project1Admin:gCwkZL4zkndgEnQ4@cluster0.1uttd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

mongoose.connect(mongodburl, {})

const connection = mongoose.connection;

connection.once("open", () => {
    console.log("MongoDB database connection established");
})

app.use(bodyParser.json());

app.use(
    (req, res, next) => {
        const token = req.header("Authorization")?.replace("Bearer ", "")
        console.log(token)

        if (token != null) {
            jwt.verify(token, "cbc-secret-key-123", (error, decoded) => {
                if (!error) {
                    req.user = decoded
                }
            }
            )
        }
        next()
    }
)

app.use("/api/products", productRouter);
app.use("/api/users", userRouter);

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});