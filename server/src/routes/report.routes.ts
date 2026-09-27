import { Router } from "express";
import prisma from "../lib/prisma.js";
import {
  authenticateToken,
  type AuthRequest,
} from "../middleware/auth.middleware.js";

const router = Router();

router.get(
  "/sales",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (req.user?.role !== "ADMIN") {
        return res.status(403).json({
          message: "Admin access required",
        });
      }

      const today = new Date();

      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      const sales = await prisma.sale.findMany({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: {
          cashier: {
            select: {
              id: true,
              name: true,
            },
          },
          items: {
            include: {
              food: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const totalRevenue = sales.reduce(
        (total, sale) =>
          total + Number(sale.total),
        0
      );

      const totalTransactions = sales.length;

      const averageSale =
        totalTransactions > 0
          ? totalRevenue / totalTransactions
          : 0;

      const foodMap = new Map<
        number,
        {
          foodId: number;
          name: string;
          quantity: number;
          revenue: number;
        }
      >();

      for (const sale of sales) {
        for (const item of sale.items) {
          const existing = foodMap.get(
            item.foodId
          );

          const quantity = item.quantity;
          const revenue =
            Number(item.price) * quantity;

          if (existing) {
            existing.quantity += quantity;
            existing.revenue += revenue;
          } else {
            foodMap.set(item.foodId, {
              foodId: item.foodId,
              name: item.food.name,
              quantity,
              revenue,
            });
          }
        }
      }

      const bestSellingFoods = Array.from(
        foodMap.values()
      ).sort(
        (a, b) => b.quantity - a.quantity
      );

      return res.json({
        date: startOfDay,
        totalRevenue,
        totalTransactions,
        averageSale,
        bestSellingFoods,
        sales,
      });
    } catch (error) {
      console.error(
        "GET SALES REPORT ERROR:",
        error
      );

      return res.status(500).json({
        message: "Failed to generate sales report",
      });
    }
  }
);

export default router;