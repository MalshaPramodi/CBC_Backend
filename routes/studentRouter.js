import express from "express";
import { getStudent, createStudent, deleteStudent } from "../controllers/studentController.js";

const studentRouter = express.Router();

studentRouter.get("/", getStudent)
studentRouter.post("/", createStudent)
studentRouter.delete("/", deleteStudent)

export default studentRouter;