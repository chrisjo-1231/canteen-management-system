import { Router } from "express";
import prisma from "../lib/prisma.js";

const router = Router();


// GET TODAY'S MENU
router.get("/today", async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const menu = await prisma.dailyMenu.findMany({
      where: {
        date: {
          gte: start,
          lt: end,
        },
        food: {
          isAvailable: true,
        },
      },
      include: {
        food: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        food: {
          name: "asc",
        },
      },
    });

    res.json(menu);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch today's menu",
    });
  }
});


// GET MENU BY DATE
router.get("/date/:date", async (req, res) => {
  try {
    const { date } = req.params;

    const start = new Date(`${date}T00:00:00`);
    const end = new Date(`${date}T00:00:00`);

    end.setDate(end.getDate() + 1);

    const menu = await prisma.dailyMenu.findMany({
      where: {
        date: {
          gte: start,
          lt: end,
        },
        food: {
          isAvailable: true,
        },
      },
      include: {
        food: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        food: {
          name: "asc",
        },
      },
    });

    res.json(menu);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch menu",
    });
  }
});


// ADD FOOD TO DAILY MENU
router.post("/", async (req, res) => {
  try {
    const { date, foodId } = req.body;

    if (!date || !foodId) {
      return res.status(400).json({
        message: "Date and foodId are required",
      });
    }

    const menu = await prisma.dailyMenu.create({
      data: {
        date: new Date(`${date}T00:00:00`),
        foodId: Number(foodId),
      },
      include: {
        food: true,
      },
    });

    res.status(201).json(menu);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to add food to daily menu",
    });
  }
});


// DELETE FOOD FROM DAILY MENU
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.dailyMenu.delete({
      where: {
        id,
      },
    });

    res.json({
      message: "Food removed from daily menu",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to remove food from daily menu",
    });
  }
});


export default router;