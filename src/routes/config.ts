import express from "express";
import {
  createPriority,
  createStatus,
  createTag,
  deletePriority,
  deleteStatus,
  deleteTag,
  getPriorities,
  getStatuses,
  getTags,
  updatePriority,
  updateStatus,
  updateTag,
} from "../controllers/configController";

const router = express.Router();
// Status
router.post("/status/:id", createStatus);
router.put("/status/:id", updateStatus);
router.delete("/status/:id", deleteStatus);
router.get("/status", getStatuses);
// Priority
router.post("/priority/:id", createPriority);
router.put("/priority/:id", updatePriority);
router.delete("/priority/:id", deletePriority);
router.get("/priority", getPriorities);
// Tag
router.post("/tag/:id", createTag);
router.put("/tag/:id", updateTag);
router.delete("/tag/:id", deleteTag);
router.get("/tag", getTags);

export default router;
