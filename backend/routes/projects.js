import express from "express";
import prisma from "../prismaClient.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Project
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, workspaceId } = req.body;
    if (!name || !workspaceId)
      return res.status(400).json({ error: "Name and workspaceId are required" });

    // check if workspace belongs to user
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace || workspace.ownerId !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const project = await prisma.project.create({
      data: { name, workspaceId },
    });

    res.json(project);
  } catch (err) {
    console.error("CREATE PROJECT ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all projects in a workspace
router.get("/:workspaceId/projects", authMiddleware, async (req, res) => {
  try {
    const workspaceId = parseInt(req.params.workspaceId);

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace || workspace.ownerId !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const projects = await prisma.project.findMany({
      where: { workspaceId },
    });

    res.json(projects);
  } catch (err) {
    console.error("GET PROJECTS ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;