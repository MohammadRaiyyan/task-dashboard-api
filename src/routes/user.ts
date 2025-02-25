import express from "express";
import { user } from "../controllers/userController";

const router = express.Router();

router.post("/", user);

export default router;
