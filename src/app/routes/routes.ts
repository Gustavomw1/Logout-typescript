import { Router } from "express";
import userRouter from "../controllers/UserController.ts";

const routers = Router();

routers.get("/profile", userRouter);
routers.post("/register", userRouter);

export default routers;
