import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import foodRoutes from "./routes/food.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import dailyMenuRoutes from "./routes/daily-menu.routes.js";
import orderRoutes from "./routes/order.routes.js";
import posRoutes from "./routes/pos.routes.js";
import reportRoutes from "./routes/report.routes.js";
import inventoryRoutes from "./routes/inventory.routtes.js";
import paymentRoutes from "./routes/payment.routes.js";
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/daily-menu", dailyMenuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/pos", posRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/payments", paymentRoutes);
app.get("/api/test", (req, res) => {
    res.json({ message: "Canteen API is working!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});