import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

type OrderItem = {
  id: number;
  quantity: number;
  price: string;
  food: {
    id: number;
    name: string;
  };
};

type Payment = {
  id: number;
  amount: string;
  method: "CASH" | "GCASH";
  status:
    | "PENDING"
    | "PAID"
    | "FAILED"
    | "CANCELLED";
};

type Order = {
  id: number;
  total: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PREPARING"
    | "READY"
    | "COMPLETED"
    | "CANCELLED";
  createdAt: string;

  user: {
    id: number;
    name: string;
    email: string;
  };

  items: OrderItem[];

  payment: Payment | null;
};

function CashierOrders() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState<number | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    if (!token) {
      return;
    }

    try {
      setLoading(true);

      const response = await axios.get(
        "http://localhost:5000/api/orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders(response.data);
    } catch (error) {
      console.error(
        "LOAD ORDERS ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const confirmCashPayment = async (
    paymentId: number
  ) => {
    if (!token) {
      return;
    }

    try {
      setActionLoading(paymentId);

      await axios.patch(
        `http://localhost:5000/api/payments/${paymentId}/confirm-cash`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await loadOrders();
    } catch (error) {
      console.error(
        "CONFIRM PAYMENT ERROR:",
        error
      );

      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ||
            "Failed to confirm payment"
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const updateOrderStatus = async (
    orderId: number,
    status: Order["status"]
  ) => {
    if (!token) {
      return;
    }

    try {
      setActionLoading(orderId);

      await axios.patch(
        `http://localhost:5000/api/orders/${orderId}/status`,
        {
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await loadOrders();
    } catch (error) {
      console.error(
        "UPDATE ORDER ERROR:",
        error
      );

      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.message ||
            "Failed to update order"
        );
      }
    } finally {
      setActionLoading(null);
    }
  };

  const canConfirmOrder = (order: Order) => {
    if (!order.payment) {
      return false;
    }

    return (
      order.payment.status === "PAID" &&
      order.status === "PENDING"
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Customer Orders
            </h1>

            <p className="mt-2 text-gray-500">
              Manage customer orders and payments.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={loadOrders}
              className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
            >
              🔄 Refresh
            </button>

            <button
              onClick={() =>
                navigate("/cashier/dashboard")
              }
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Dashboard
            </button>
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow">
            <p className="text-gray-500">
              Loading orders...
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow">
            <p className="text-gray-500">
              No customer orders found.
            </p>
          </div>
        ) : (
          <div className="space-y-6">

            {orders.map((order) => {
              const payment = order.payment;

              return (
                <div
                  key={order.id}
                  className="rounded-2xl bg-white p-6 shadow"
                >

                  {/* ORDER HEADER */}
                  <div className="flex flex-col justify-between gap-4 border-b pb-5 md:flex-row">

                    <div>
                      <h2 className="text-2xl font-bold">
                        Order #{order.id}
                      </h2>

                      <p className="mt-1 text-gray-500">
                        {order.user.name}
                      </p>

                      <p className="text-sm text-gray-400">
                        {order.user.email}
                      </p>

                      <p className="mt-2 text-sm text-gray-400">
                        {new Date(
                          order.createdAt
                        ).toLocaleString()}
                      </p>
                    </div>

                    <div className="text-left md:text-right">

                      <p className="text-2xl font-bold">
                        ₱
                        {Number(
                          order.total
                        ).toFixed(2)}
                      </p>

                      <div className="mt-2">
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-semibold ${
                            order.status ===
                            "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : order.status ===
                                "CONFIRMED"
                              ? "bg-blue-100 text-blue-700"
                              : order.status ===
                                "PREPARING"
                              ? "bg-purple-100 text-purple-700"
                              : order.status ===
                                "READY"
                              ? "bg-green-100 text-green-700"
                              : order.status ===
                                "COMPLETED"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                    </div>
                  </div>

                  {/* PAYMENT */}
                  <div className="mt-5 rounded-xl bg-gray-50 p-4">

                    <div className="flex flex-col justify-between gap-3 md:flex-row">

                      <div>
                        <p className="font-semibold">
                          Payment
                        </p>

                        {payment ? (
                          <>
                            <p className="mt-1 text-sm text-gray-600">
                              Method:{" "}
                              <span className="font-semibold">
                                {payment.method ===
                                "GCASH"
                                  ? "📱 GCash"
                                  : "💵 Cash"}
                              </span>
                            </p>

                            <p className="text-sm text-gray-600">
                              Status:{" "}
                              <span
                                className={`font-semibold ${
                                  payment.status ===
                                  "PAID"
                                    ? "text-green-600"
                                    : "text-yellow-600"
                                }`}
                              >
                                {payment.status}
                              </span>
                            </p>

                            <p className="text-sm text-gray-600">
                              Amount: ₱
                              {Number(
                                payment.amount
                              ).toFixed(2)}
                            </p>
                          </>
                        ) : (
                          <p className="mt-1 text-sm text-red-500">
                            No payment record
                          </p>
                        )}
                      </div>

                      {/* CASH PAYMENT */}
                      {payment &&
                        payment.method ===
                          "CASH" &&
                        payment.status ===
                          "PENDING" && (
                          <button
                            onClick={() =>
                              confirmCashPayment(
                                payment.id
                              )
                            }
                            disabled={
                              actionLoading ===
                              payment.id
                            }
                            className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            {actionLoading ===
                            payment.id
                              ? "Confirming..."
                              : "💵 Confirm Cash Payment"}
                          </button>
                        )}

                      {/* GCASH PAID */}
                      {payment &&
                        payment.method ===
                          "GCASH" &&
                        payment.status ===
                          "PAID" && (
                          <div className="rounded-lg bg-green-100 px-5 py-3 font-semibold text-green-700">
                            ✅ GCash Payment Verified
                          </div>
                        )}

                    </div>
                  </div>

                  {/* ITEMS */}
                  <div className="mt-5">

                    <h3 className="mb-3 font-bold">
                      Order Items
                    </h3>

                    <div className="space-y-3">

                      {order.items.map(
                        (item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between border-b pb-3"
                          >
                            <div>
                              <p className="font-semibold">
                                {item.food.name}
                              </p>

                              <p className="text-sm text-gray-500">
                                ₱
                                {Number(
                                  item.price
                                ).toFixed(2)}
                                {" × "}
                                {item.quantity}
                              </p>
                            </div>

                            <p className="font-semibold">
                              ₱
                              {(
                                Number(
                                  item.price
                                ) *
                                item.quantity
                              ).toFixed(2)}
                            </p>
                          </div>
                        )
                      )}

                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="mt-6 flex flex-wrap gap-3">

                    {canConfirmOrder(
                      order
                    ) && (
                      <button
                        onClick={() =>
                          updateOrderStatus(
                            order.id,
                            "CONFIRMED"
                          )
                        }
                        disabled={
                          actionLoading ===
                          order.id
                        }
                        className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {actionLoading ===
                        order.id
                          ? "Updating..."
                          : "✅ Confirm Order"}
                      </button>
                    )}

                    {order.status ===
                      "CONFIRMED" && (
                      <button
                        onClick={() =>
                          updateOrderStatus(
                            order.id,
                            "PREPARING"
                          )
                        }
                        disabled={
                          actionLoading ===
                          order.id
                        }
                        className="rounded-lg bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                      >
                        🍳 Start Preparing
                      </button>
                    )}

                    {order.status ===
                      "PREPARING" && (
                      <button
                        onClick={() =>
                          updateOrderStatus(
                            order.id,
                            "READY"
                          )
                        }
                        disabled={
                          actionLoading ===
                          order.id
                        }
                        className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        🍽️ Mark Ready
                      </button>
                    )}

                    {order.status ===
                      "READY" && (
                      <button
                        onClick={() =>
                          updateOrderStatus(
                            order.id,
                            "COMPLETED"
                          )
                        }
                        disabled={
                          actionLoading ===
                          order.id
                        }
                        className="rounded-lg bg-gray-800 px-5 py-3 font-semibold text-white hover:bg-gray-900 disabled:opacity-50"
                      >
                        ✅ Complete Order
                      </button>
                    )}

                    {(order.status ===
                      "PENDING" ||
                      order.status ===
                        "CONFIRMED") && (
                      <button
                        onClick={() =>
                          updateOrderStatus(
                            order.id,
                            "CANCELLED"
                          )
                        }
                        disabled={
                          actionLoading ===
                          order.id
                        }
                        className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        ❌ Cancel Order
                      </button>
                    )}

                  </div>
                </div>
              );
            })}

          </div>
        )}
      </div>
    </div>
  );
}

export default CashierOrders;