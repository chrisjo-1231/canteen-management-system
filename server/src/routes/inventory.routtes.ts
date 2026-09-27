import { Router } from "express";
import prisma from "../lib/prisma.js";
import {
  authenticateToken,
  type AuthRequest,
} from "../middleware/auth.middleware.js";

const router = Router();

/*
GET INVENTORY
*/
router.get(
  "/",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (
        req.user?.role !== "ADMIN" &&
        req.user?.role !== "CASHIER"
      ) {
        return res.status(403).json({
          message: "Admin or cashier access required",
        });
      }

      const foods = await prisma.food.findMany({
        include: {
          category: true,
        },
        orderBy: {
          name: "asc",
        },
      });

      return res.json(foods);
    } catch (error) {
      console.error("GET INVENTORY ERROR:", error);

      return res.status(500).json({
        message: "Failed to load inventory",
      });
    }
  }
);

/*
STOCK IN
*/
router.post(
  "/stock-in",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (req.user?.role !== "ADMIN") {
        return res.status(403).json({
          message: "Admin access required",
        });
      }

      const {
        foodId,
        quantity,
        reason,
      } = req.body;

      const id = Number(foodId);
      const qty = Number(quantity);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          message: "Invalid food ID",
        });
      }

      if (!Number.isInteger(qty) || qty <= 0) {
        return res.status(400).json({
          message: "Quantity must be greater than zero",
        });
      }

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

      const result = await prisma.$transaction(
        async (tx) => {
          const updatedFood =
            await tx.food.update({
              where: {
                id,
              },
              data: {
                stock: {
                  increment: qty,
                },
              },
            });

          await tx.inventoryLog.create({
            data: {
              foodId: id,
              type: "STOCK_IN",
              quantity: qty,
              reason:
                reason?.trim() ||
                "Manual stock-in",
            },
          });

          return updatedFood;
        }
      );

      return res.json({
        message: "Stock added successfully",
        food: result,
      });
    } catch (error) {
      console.error("STOCK IN ERROR:", error);

      return res.status(500).json({
        message: "Failed to add stock",
      });
    }
  }
);

/*
STOCK OUT
*/
router.post(
  "/stock-out",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (req.user?.role !== "ADMIN") {
        return res.status(403).json({
          message: "Admin access required",
        });
      }

      const {
        foodId,
        quantity,
        reason,
      } = req.body;

      const id = Number(foodId);
      const qty = Number(quantity);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          message: "Invalid food ID",
        });
      }

      if (!Number.isInteger(qty) || qty <= 0) {
        return res.status(400).json({
          message: "Quantity must be greater than zero",
        });
      }

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

      if (qty > food.stock) {
        return res.status(400).json({
          message: "Not enough stock",
        });
      }

      const result = await prisma.$transaction(
        async (tx) => {
          const updatedFood =
            await tx.food.update({
              where: {
                id,
              },
              data: {
                stock: {
                  decrement: qty,
                },
              },
            });

          await tx.inventoryLog.create({
            data: {
              foodId: id,
              type: "STOCK_OUT",
              quantity: qty,
              reason:
                reason?.trim() ||
                "Manual stock-out",
            },
          });

          return updatedFood;
        }
      );

      return res.json({
        message: "Stock removed successfully",
        food: result,
      });
    } catch (error) {
      console.error("STOCK OUT ERROR:", error);

      return res.status(500).json({
        message: "Failed to remove stock",
      });
    }
  }
);

/*
INVENTORY HISTORY
*/
router.get(
  "/logs",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (
        req.user?.role !== "ADMIN" &&
        req.user?.role !== "CASHIER"
      ) {
        return res.status(403).json({
          message: "Admin or cashier access required",
        });
      }

      const logs =
        await prisma.inventoryLog.findMany({
          include: {
            food: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

      return res.json(logs);
    } catch (error) {
      console.error(
        "GET INVENTORY LOGS ERROR:",
        error
      );

      return res.status(500).json({
        message: "Failed to load inventory history",
      });
    }
  }
);

export default router;