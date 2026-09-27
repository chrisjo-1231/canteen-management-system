import { Router } from "express";
import prisma from "../lib/prisma.js";
import {
  authenticateToken,
  type AuthRequest,
} from "../middleware/auth.middleware.js";

const router = Router();

//
// CREATE PAYMENT
//
router.post(
  "/",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      const { orderId, method } = req.body;

      const id = Number(orderId);

      if (!Number.isInteger(id)) {
        return res.status(400).json({
          message: "Invalid order ID",
        });
      }

      if (method !== "CASH" && method !== "GCASH") {
        return res.status(400).json({
          message: "Invalid payment method",
        });
      }

      const order = await prisma.order.findUnique({
        where: {
          id,
        },
        include: {
          payment: true,
        },
      });

      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      // Customer can only pay for their own order
      if (
        req.user.role === "CUSTOMER" &&
        order.userId !== req.user.id
      ) {
        return res.status(403).json({
          message: "You cannot pay for this order",
        });
      }

      if (order.payment) {
        return res.status(400).json({
          message: "Payment already exists for this order",
        });
      }

      const payment = await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: order.total,
          method,
          status:
            method === "CASH"
              ? "PENDING"
              : "PENDING",
        },
      });

      return res.status(201).json({
        message: "Payment created successfully",
        payment,
      });
    } catch (error) {
      console.error("CREATE PAYMENT ERROR:", error);

      return res.status(500).json({
        message: "Failed to create payment",
      });
    }
  }
);

//
// GET PAYMENT BY ORDER
//
router.get(
  "/order/:orderId",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      const orderId = Number(req.params.orderId);

      if (!Number.isInteger(orderId)) {
        return res.status(400).json({
          message: "Invalid order ID",
        });
      }

      const order = await prisma.order.findUnique({
        where: {
          id: orderId,
        },
        include: {
          payment: true,
        },
      });

      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      if (
        req.user.role === "CUSTOMER" &&
        order.userId !== req.user.id
      ) {
        return res.status(403).json({
          message: "Access denied",
        });
      }

      return res.json(order.payment);
    } catch (error) {
      console.error("GET PAYMENT ERROR:", error);

      return res.status(500).json({
        message: "Failed to fetch payment",
      });
    }
  }
);

//
// PAYMENT STATUS
//
router.get(
  "/:id",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      const paymentId = Number(req.params.id);

      if (!Number.isInteger(paymentId)) {
        return res.status(400).json({
          message: "Invalid payment ID",
        });
      }

      const payment = await prisma.payment.findUnique({
        where: {
          id: paymentId,
        },
        include: {
          order: {
            select: {
              id: true,
              userId: true,
              total: true,
              status: true,
            },
          },
        },
      });

      if (!payment) {
        return res.status(404).json({
          message: "Payment not found",
        });
      }

      if (
        req.user.role === "CUSTOMER" &&
        payment.order.userId !== req.user.id
      ) {
        return res.status(403).json({
          message: "Access denied",
        });
      }

      return res.json(payment);
    } catch (error) {
      console.error("GET PAYMENT STATUS ERROR:", error);

      return res.status(500).json({
        message: "Failed to fetch payment status",
      });
    }
  }
);

//
// CONFIRM CASH PAYMENT
//
router.patch(
  "/:id/confirm-cash",
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
            "Only cashier or admin can confirm payment",
        });
      }

      const paymentId = Number(req.params.id);

      if (!Number.isInteger(paymentId)) {
        return res.status(400).json({
          message: "Invalid payment ID",
        });
      }

      const payment = await prisma.payment.findUnique({
        where: {
          id: paymentId,
        },
        include: {
          order: true,
        },
      });

      if (!payment) {
        return res.status(404).json({
          message: "Payment not found",
        });
      }

      if (payment.method !== "CASH") {
        return res.status(400).json({
          message:
            "Only CASH payments can be manually confirmed",
        });
      }

      if (payment.status === "PAID") {
        return res.status(400).json({
          message: "Payment is already paid",
        });
      }

      const result = await prisma.$transaction(
        async (tx) => {
          const updatedPayment =
            await tx.payment.update({
              where: {
                id: payment.id,
              },
              data: {
                status: "PAID",
              },
            });

          const updatedOrder =
            await tx.order.update({
              where: {
                id: payment.orderId,
              },
              data: {
                status: "CONFIRMED",
              },
            });

          return {
            payment: updatedPayment,
            order: updatedOrder,
          };
        }
      );

      return res.json({
        message: "Cash payment confirmed",
        ...result,
      });
    } catch (error) {
      console.error(
        "CONFIRM CASH PAYMENT ERROR:",
        error
      );

      return res.status(500).json({
        message: "Failed to confirm cash payment",
      });
    }
  }
);
export default router;