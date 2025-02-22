import express from "express";

import { getManifests } from "../controllers/manifestController";

const router = express.Router();

router.get("/", getManifests);

export default router;
