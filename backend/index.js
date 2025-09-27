import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import authMiddleware from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// mount routes
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => res.send("Work Sphere API is running 🚀"));

// Protected route
app.get("/api/auth/me", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
