import express from "express";
import slugify from "slugify";
import { PrismaClient } from "@prisma/client";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
const prisma = new PrismaClient();

// -------------------- CREATE WORKSPACE --------------------
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    // Generate initial slug
    let slug = slugify(name, { lower: true, strict: true });

    // Ensure uniqueness
    let finalSlug = slug;
    let count = 1;
    while (await prisma.workspace.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${count}`;
      count++;
    }

    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug: finalSlug,
        ownerId: req.user.id,
      },
    });

    res.status(201).json(workspace);
  } catch (error) {
    console.error("Error creating workspace:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// -------------------- GET ALL WORKSPACES --------------------
router.get("/", authMiddleware, async (req, res) => {
  try {
    const workspaces = await prisma.workspace.findMany({
      where: { ownerId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(workspaces);
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// -------------------- GET SINGLE WORKSPACE BY SLUG --------------------
router.get("/:slug", authMiddleware, async (req, res) => {
  try {
    const { slug } = req.params;
    const workspace = await prisma.workspace.findUnique({ where: { slug } });

    if (!workspace || workspace.ownerId !== req.user.id) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    res.json(workspace);
  } catch (error) {
    console.error("Error fetching workspace:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// -------------------- UPDATE WORKSPACE --------------------
router.put("/:slug", authMiddleware, async (req, res) => {
  try {
    const { slug } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    // Find workspace
    const workspace = await prisma.workspace.findUnique({ where: { slug } });
    if (!workspace || workspace.ownerId !== req.user.id) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    // Generate new slug if name changed
    let newSlug = slugify(name, { lower: true, strict: true });
    let finalSlug = newSlug;
    let count = 1;
    while (
      await prisma.workspace.findFirst({
        where: { slug: finalSlug, NOT: { id: workspace.id } },
      })
    ) {
      finalSlug = `${newSlug}-${count}`;
      count++;
    }

    const updatedWorkspace = await prisma.workspace.update({
      where: { id: workspace.id },
      data: { name, slug: finalSlug },
    });

    res.json(updatedWorkspace);
  } catch (error) {
    console.error("Error updating workspace:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// -------------------- DELETE WORKSPACE --------------------
router.delete("/:slug", authMiddleware, async (req, res) => {
  try {
    const { slug } = req.params;
    const workspace = await prisma.workspace.findUnique({ where: { slug } });

    if (!workspace || workspace.ownerId !== req.user.id) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    await prisma.workspace.delete({ where: { id: workspace.id } });
    res.json({ message: "Workspace deleted" });
  } catch (error) {
    console.error("Error deleting workspace:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
