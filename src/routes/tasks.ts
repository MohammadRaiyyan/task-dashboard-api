import express from "express";
import {
  createTask,
  deleteTask,
  getSubTasks,
  getTaskById,
  getTasks,
  updateTask,
} from "../controllers/taskController";

const router = express.Router();

router.get("/", getTasks);
router.get("/:parentId/subtasks", getSubTasks);
router.get("/:id", getTaskById);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
