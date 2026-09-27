import { Router } from "express";
import prisma from "../lib/prisma.js";
import {
  authenticateToken,
  type AuthRequest,
} from "../middleware/auth.middleware.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| PLACE ORDER
|--------------------------------------------------------------------------
| POST /api/orders
|
| Customer sends:
| {
|   items: [
|     {
|       foodId: 1,
|       quantity: 2
|     }
|   ]
| }
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      // Make sure user is logged in
      if (!req.user) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      // Only CUSTOMER can place an order
      if (req.user.role !== "CUSTOMER") {
        return res.status(403).json({
          message: "Only customers can place orders",
        });
      }

      const { items } = req.body;

      // Validate items
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          message: "Your cart is empty",
        });
      }

      // Validate each item
      for (const item of items) {
        const foodId = Number(item.foodId);
        const quantity = Number(item.quantity);

        if (!Number.isInteger(foodId) || foodId <= 0) {
          return res.status(400).json({
            message: "Invalid food ID",
          });
        }

        if (!Number.isInteger(quantity) || quantity <= 0) {
          return res.status(400).json({
            message: "Quantity must be greater than zero",
          });
        }
      }

      // Get food IDs
      const foodIds = items.map(
        (item: { foodId: number }) => Number(item.foodId)
      );

      // Find available foods
      const foods = await prisma.food.findMany({
        where: {
          id: {
            in: foodIds,
          },
          isAvailable: true,
        },
      });

      // Make sure all foods exist
      if (foods.length !== foodIds.length) {
        return res.status(400).json({
          message:
            "One or more foods are unavailable.",
        });
      }

      // Calculate total using DATABASE prices
      // Never trust prices coming from the frontend
      let total = 0;

      const orderItems = items.map(
        (item: {
          foodId: number;
          quantity: number;
        }) => {
          const food = foods.find(
            (food) =>
              food.id === Number(item.foodId)
          );

          if (!food) {
            throw new Error("Food not found");
          }

          const quantity = Number(item.quantity);

          const price = Number(food.price);

          total += price * quantity;

          return {
            foodId: food.id,
            quantity,
            price: food.price,
          };
        }
      );

      // Create order
      const order = await prisma.order.create({
        data: {
          userId: req.user.id,
          total,
          status: "PENDING",

          items: {
            create: orderItems,
          },
        },

        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

          items: {
            include: {
              food: true,
            },
          },
        },
      });

      return res.status(201).json({
        message: "Order placed successfully",
        order,
      });
    } catch (error) {
      console.error(
        "PLACE ORDER ERROR:",
        error
      );

      return res.status(500).json({
        message: "Failed to place order",
      });
    }
  }
);


/*
|--------------------------------------------------------------------------
| GET ALL ORDERS
|--------------------------------------------------------------------------
| Used by CASHIER / ADMIN
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (
        req.user?.role !== "CASHIER" &&
        req.user?.role !== "ADMIN"
      ) {
        return res.status(403).json({
          message:
            "Cashier or admin access required",
        });
      }

      const orders = await prisma.order.findMany({
        include: {
          user: {
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

      return res.json(orders);
    } catch (error) {
      console.error(
        "GET ORDERS ERROR:",
        error
      );

      return res.status(500).json({
        message: "Failed to fetch orders",
      });
    }
  }
);


/*
|--------------------------------------------------------------------------
| GET SINGLE ORDER
|--------------------------------------------------------------------------
| GET /api/orders/:id
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id)) {
        return res.status(400).json({
          message: "Invalid order ID",
        });
      }

      const order =
        await prisma.order.findUnique({
          where: {
            id,
          },

          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },

            items: {
              include: {
                food: true,
              },
            },
          },
        });

      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      // CUSTOMER can only view own order
      if (
        req.user?.role === "CUSTOMER" &&
        order.userId !== req.user.id
      ) {
        return res.status(403).json({
          message:
            "You cannot access this order",
        });
      }

      return res.json(order);
    } catch (error) {
      console.error(
        "GET ORDER ERROR:",
        error
      );

      return res.status(500).json({
        message: "Failed to fetch order",
      });
    }
  }
);
/*
|--------------------------------------------------------------------------
| UPDATE ORDER STATUS
|--------------------------------------------------------------------------
| PATCH /api/orders/:id/status
|
| CASHIER / ADMIN only
|--------------------------------------------------------------------------
*/

router.patch(
  "/:id/status",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      // Only cashier/admin
      if (
        req.user?.role !== "CASHIER" &&
        req.user?.role !== "ADMIN"
      ) {
        return res.status(403).json({
          message:
            "Cashier or admin access required",
        });
      }

      const id = Number(req.params.id);

      if (!Number.isInteger(id)) {
        return res.status(400).json({
          message: "Invalid order ID",
        });
      }

      const { status } = req.body;

      const allowedStatuses = [
        "PENDING",
        "CONFIRMED",
        "PREPARING",
        "READY",
        "COMPLETED",
        "CANCELLED",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid order status",
        });
      }

      const existingOrder =
        await prisma.order.findUnique({
          where: {
            id,
          },
        });

      if (!existingOrder) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      // Don't allow changing completed/cancelled orders
      if (
        existingOrder.status === "COMPLETED" ||
        existingOrder.status === "CANCELLED"
      ) {
        return res.status(400).json({
          message:
            "Completed or cancelled orders cannot be changed",
        });
      }

      const order =
        await prisma.order.update({
          where: {
            id,
          },

          data: {
            status,
          },

          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },

            items: {
              include: {
                food: true,
              },
            },
          },
        });

      return res.json({
        message: "Order status updated successfully",
        order,
      });
    } catch (error) {
      console.error(
        "UPDATE ORDER STATUS ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to update order status",
      });
    }
  }
);
export default router;