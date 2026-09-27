import { Router } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const foods = await prisma.food.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(foods);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch foods",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      categoryId,
    } = req.body;

    const food = await prisma.food.create({
      data: {
        name,
        description,
        price,
        stock,
        categoryId,
      },
    });

    res.status(201).json(food);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create food",
    });
  }
});
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const {
      name,
      description,
      price,
      stock,
      categoryId,
      image,
      isAvailable,
    } = req.body;

    const food = await prisma.food.update({
      where: {
        id,
      },
      data: {
        name,
        description,
        price,
        stock,
        categoryId,
        image,
        isAvailable,
      },
      include: {
        category: true,
      },
    });

    res.json(food);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update food",
    });
  }
});
// DELETE FOOD
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const food = await prisma.food.findUnique({
      where: {
        id,
      },
    });

    if (!food) {
      return res.status(404).json({
        message: "Food not found",
      });
    }

    await prisma.food.delete({
      where: {
        id,
      },
    });

    res.json({
      message: "Food deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete food",
    });
  }
});

export default router;