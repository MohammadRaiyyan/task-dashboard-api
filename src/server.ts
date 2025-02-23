import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { authenticate } from "./middleware/authMiddleware";
import authRoutes from "./routes/auth";
import configRoutes from "./routes/config";
import insightRoutes from "./routes/insights";
import manifestRoutes from "./routes/manifest";
import taskRoutes from "./routes/tasks";
dotenv.config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

mongoose
	.connect(process.env.MONGO_URI!)
	.then(() => console.log("Connected to MongoDB"))
	.catch((err) => console.error("Could not connect to MongoDb", err));

app.get("/", (_, res) => {
	res.send("API is working!");
});
app.use("/auth", authRoutes);
app.use("/tasks", authenticate, taskRoutes);
app.use("/config", authenticate, configRoutes);
app.use("/insights", authenticate, insightRoutes);
app.use("/manifest", authenticate, manifestRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
