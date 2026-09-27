import { Router } from "express";
import prisma from "../lib/prisma.js";
import {
  authenticateToken,
  type AuthRequest,
} from "../middleware/auth.middleware.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| CREATE WALK-IN SALE
|--------------------------------------------------------------------------
| POST /api/pos/sales
|--------------------------------------------------------------------------
*/

router.post(
  "/sales",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      if (
        req.user.role !== "CASHIER" &&
        req.user.role !== "ADMIN"
      ) {
        return res.status(403).json({
          message:
            "Only cashier or admin can process POS sales",
        });
      }

      const {
        items,
        cashReceived,
      } = req.body;

      if (
        !Array.isArray(items) ||
        items.length === 0
      ) {
        return res.status(400).json({
          message:
            "At least one item is required",
        });
      }

      const cash = Number(cashReceived);

      if (!Number.isFinite(cash) || cash < 0) {
        return res.status(400).json({
          message:
            "Invalid cash received",
        });
      }

      const foodIds = items.map(
        (item: {
          foodId: number;
        }) => Number(item.foodId)
      );

      const foods =
        await prisma.food.findMany({
          where: {
            id: {
              in: foodIds,
            },
            isAvailable: true,
          },
        });

      if (
        foods.length !==
        new Set(foodIds).size
      ) {
        return res.status(400).json({
          message:
            "One or more foods are unavailable",
        });
      }

      let total = 0;

      const saleItems = items.map(
        (item: {
          foodId: number;
          quantity: number;
        }) => {
          const food = foods.find(
            (food) =>
              food.id ===
              Number(item.foodId)
          );

          if (!food) {
            throw new Error(
              "Food not found"
            );
          }

          const quantity =
            Number(item.quantity);

          if (
            !Number.isInteger(
              quantity
            ) ||
            quantity <= 0
          ) {
            throw new Error(
              "Invalid quantity"
            );
          }

          if (
            quantity > food.stock
          ) {
            throw new Error(
              `${food.name} does not have enough stock`
            );
          }

          const price =
            Number(food.price);

          total +=
            price * quantity;

          return {
            foodId: food.id,
            quantity,
            price: food.price,
          };
        }
      );

      if (cash < total) {
        return res.status(400).json({
          message:
            "Cash received is not enough",
        });
      }

      const change = cash - total;

      /*
      |--------------------------------------------------------------------------
      | TRANSACTION
      |--------------------------------------------------------------------------
      | Create Sale
      | Create SaleItems
      | Decrease stock
      |--------------------------------------------------------------------------
      */

      const sale =
        await prisma.$transaction(
          async (tx) => {

            const createdSale =
              await tx.sale.create({
                data: {
                  total,
                  cashReceived: cash,
                  change,
                  cashierId:
                    req.user!.id,

                  items: {
                    create:
                      saleItems,
                  },
                },

                include: {
                  items: {
                    include: {
                      food: true,
                    },
                  },
                },
              });

            // Decrease stock
            for (const item of saleItems) {
              await tx.food.update({
                where: {
                  id: item.foodId,
                },

                data: {
                  stock: {
                    decrement:
                      item.quantity,
                  },
                },
              });
            }

            return createdSale;
          }
        );

      return res.status(201).json({
        message:
          "Sale completed successfully",
        sale,
      });

    } catch (error) {
      console.error(
        "POS SALE ERROR:",
        error
      );

      return res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : "Failed to process sale",
      });
    }
  }
);

router.get(
  "/sales",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (
        req.user?.role !== "CASHIER" &&
        req.user?.role !== "ADMIN"
      ) {
        return res.status(403).json({
          message: "Cashier or admin access required",
        });
      }

      const sales = await prisma.sale.findMany({
        include: {
          cashier: {
            select: {
              id: true,
              name: true,
              email: true,
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

      return res.json(sales);
    } catch (error) {
      console.error("GET SALES ERROR:", error);

      return res.status(500).json({
        message: "Failed to fetch transactions",
      });
    }
  }
);
router.get(
  "/sales/:id",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (
        req.user?.role !== "CASHIER" &&
        req.user?.role !== "ADMIN"
      ) {
        return res.status(403).json({
          message: "Cashier or admin access required",
        });
      }

      const id = Number(req.params.id);

      if (!Number.isInteger(id)) {
        return res.status(400).json({
          message: "Invalid sale ID",
        });
      }

      const sale = await prisma.sale.findUnique({
        where: {
          id,
        },
        include: {
          cashier: {
            select: {
              id: true,
              name: true,
              email: true,
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
      });

      if (!sale) {
        return res.status(404).json({
          message: "Sale not found",
        });
      }

      return res.json(sale);
    } catch (error) {
      console.error("GET SALE ERROR:", error);

      return res.status(500).json({
        message: "Failed to fetch sale",
      });
    }
  }
);
export default router;