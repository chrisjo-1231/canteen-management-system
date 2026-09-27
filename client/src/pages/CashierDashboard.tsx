import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

type Order = {
  id: number;
  total: string;
  status: string;
  createdAt: string;
};

type Sale = {
  id: number;
  total: string;
  createdAt: string;
};

function CashierDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [todayOrders, setTodayOrders] = useState(0);
  const [todaySales, setTodaySales] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    if (!token) {
      return;
    }

    try {
      setLoading(true);

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [ordersResponse, salesResponse] =
        await Promise.all([
          axios.get(
            "http://localhost:5000/api/orders",
            {
              headers,
            }
          ),

          axios.get(
            "http://localhost:5000/api/pos/sales",
            {
              headers,
            }
          ),
        ]);

      const orders: Order[] =
        ordersResponse.data;

      const sales: Sale[] =
        salesResponse.data;

      // Get today's date
      const today = new Date();

      const todayYear = today.getFullYear();
      const todayMonth = today.getMonth();
      const todayDate = today.getDate();

      // Check if date is today
      const isToday = (dateString: string) => {
        const date = new Date(dateString);

        return (
          date.getFullYear() === todayYear &&
          date.getMonth() === todayMonth &&
          date.getDate() === todayDate
        );
      };

      // Today's Orders
      const ordersToday = orders.filter(
        (order) => isToday(order.createdAt)
      );

      setTodayOrders(ordersToday.length);

      // Pending Orders
      const pending = ordersToday.filter(
        (order) => order.status === "PENDING"
      );

      setPendingOrders(pending.length);

      // Today's POS Sales
      const salesToday = sales.filter(
        (sale) => isToday(sale.createdAt)
      );

      const salesTotal = salesToday.reduce(
        (total, sale) =>
          total + Number(sale.total),
        0
      );

      setTodaySales(salesTotal);
    } catch (error) {
      console.error(
        "CASHIER DASHBOARD ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Cashier Dashboard
            </h1>

            <p className="mt-2 text-gray-500">
              Welcome, {user?.name}
            </p>
          </div>

          <button
            onClick={loadDashboard}
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          >
            🔄 Refresh
          </button>
        </div>

        {/* STATS */}
        <div className="grid gap-6 md:grid-cols-3">

          {/* TODAY'S ORDERS */}
          <div className="rounded-2xl bg-white p-6 shadow">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-4xl">
                🧾
              </div>

              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-600">
                Orders
              </span>
            </div>

            <h2 className="text-3xl font-bold">
              {loading ? "..." : todayOrders}
            </h2>

            <p className="mt-2 text-gray-500">
              Today's Orders
            </p>
          </div>

          {/* SALES */}
          <div className="rounded-2xl bg-white p-6 shadow">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-4xl">
                💰
              </div>

              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-600">
                Sales
              </span>
            </div>

            <h2 className="text-3xl font-bold">
              {loading
                ? "..."
                : `₱${todaySales.toFixed(2)}`}
            </h2>

            <p className="mt-2 text-gray-500">
              Today's Sales
            </p>
          </div>

          {/* PENDING */}
          <div className="rounded-2xl bg-white p-6 shadow">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-4xl">
                ⏳
              </div>

              <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-600">
                Pending
              </span>
            </div>

            <h2 className="text-3xl font-bold">
              {loading ? "..." : pendingOrders}
            </h2>

            <p className="mt-2 text-gray-500">
              Pending Orders
            </p>
          </div>

        </div>

        {/* CASHIER ACTIONS */}
        <div className="mt-8">

          <h2 className="mb-4 text-2xl font-bold text-gray-800">
            Cashier Actions
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {/* CUSTOMER ORDERS */}
            <button
              onClick={() =>
                navigate("/cashier/orders")
              }
              className="rounded-2xl bg-white p-6 text-left shadow transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-4 text-4xl">
                🧾
              </div>

              <h3 className="text-xl font-bold">
                Customer Orders
              </h3>

              <p className="mt-2 text-gray-500">
                View and process incoming customer
                orders.
              </p>
            </button>

            {/* POS */}
            <button
              onClick={() =>
                navigate("/cashier/pos")
              }
              className="rounded-2xl bg-white p-6 text-left shadow transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-4 text-4xl">
                🛒
              </div>

              <h3 className="text-xl font-bold">
                POS
              </h3>

              <p className="mt-2 text-gray-500">
                Process walk-in customers and
                payments.
              </p>
            </button>

            {/* TRANSACTIONS */}
            <button
              onClick={() =>
                navigate("/cashier/transactions")
              }
              className="rounded-2xl bg-white p-6 text-left shadow transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-4 text-4xl">
                🧾
              </div>

              <h3 className="text-xl font-bold">
                Transactions
              </h3>

              <p className="mt-2 text-gray-500">
                View completed sales and
                transaction history.
              </p>
            </button>

          </div>
        </div>

        {/* ACCOUNT INFORMATION */}
        <div className="mt-8 rounded-2xl bg-white p-6 shadow">

          <h2 className="text-xl font-bold">
            Cashier Account
          </h2>

          <div className="mt-4 space-y-2 text-gray-600">

            <p>
              <span className="font-semibold">
                Name:
              </span>{" "}
              {user?.name}
            </p>

            <p>
              <span className="font-semibold">
                Email:
              </span>{" "}
              {user?.email}
            </p>

            <p>
              <span className="font-semibold">
                Role:
              </span>{" "}
              {user?.role}
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}

export default CashierDashboard;