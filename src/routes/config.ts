import express from "express";
import { createPriority, createStatus } from "../controllers/configController";

const router = express.Router();

router.post("/status", createStatus);
router.post("/priority", createPriority);

export default router;
