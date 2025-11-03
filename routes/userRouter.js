import express from "express";
import {
  createUser,
  getAllUsers,
  getUser,
  googleLogin,
  loginUser,
} from "../controllers/userController.js";

const userRouter = express.Router();
userRouter.get("/", getUser);
userRouter.get("/all", getAllUsers);
userRouter.post("/", createUser);
userRouter.post("/login", loginUser);
userRouter.post("/google", googleLogin);

export default userRouter;
