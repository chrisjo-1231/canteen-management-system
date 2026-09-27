import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

type PaymentMethod = "CASH" | "GCASH";

function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("CASH");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    if (!user || !token) {
      navigate("/login");
      return;
    }

    if (items.length === 0) {
      navigate("/cart");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // 1. Create order
      const orderResponse = await axios.post(
        "http://localhost:5000/api/orders",
        {
          items: items.map((item) => ({
            foodId: item.food.id,
            quantity: item.quantity,
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const order = orderResponse.data.order;

      // 2. Create payment
      const paymentResponse = await axios.post(
        "http://localhost:5000/api/payments",
        {
          orderId: order.id,
          method: paymentMethod,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 3. Clear cart
      clearCart();

      const payment = paymentResponse.data.payment;

      // 4. Redirect based on payment method
      if (paymentMethod === "GCASH") {
        navigate(`/payment/gcash/${payment.id}`);
      } else {
        navigate(`/order-success/${order.id}`);
      }
    } catch (error) {
      console.error("CHECKOUT ERROR:", error);

      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Checkout failed"
        );
      } else {
        setError("Checkout failed");
      }
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
        <div className="rounded-2xl bg-white p-10 text-center shadow">
          <h1 className="text-2xl font-bold">
            Your cart is empty
          </h1>

          <button
            onClick={() => navigate("/menu/today")}
            className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold">
          Checkout
        </h1>

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* ORDER SUMMARY */}
          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="mb-5 text-xl font-bold">
              Order Summary
            </h2>

            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.food.id}
                  className="flex items-center justify-between border-b pb-3"
                >
                  <div>
                    <p className="font-semibold">
                      {item.food.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      ₱
                      {Number(
                        item.food.price
                      ).toFixed(2)}
                      {" × "}
                      {item.quantity}
                    </p>
                  </div>

                  <p className="font-semibold">
                    ₱
                    {(
                      Number(item.food.price) *
                      item.quantity
                    ).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between border-t pt-5 text-xl font-bold">
              <span>Total</span>

              <span>
                ₱{totalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* PAYMENT */}
          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="mb-5 text-xl font-bold">
              Payment Method
            </h2>

            <div className="space-y-4">
              {/* CASH */}
              <label
                className={`block cursor-pointer rounded-xl border p-4 ${
                  paymentMethod === "CASH"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="CASH"
                    checked={
                      paymentMethod === "CASH"
                    }
                    onChange={() =>
                      setPaymentMethod("CASH")
                    }
                  />

                  <div>
                    <p className="font-semibold">
                      💵 Cash at Canteen
                    </p>

                    <p className="text-sm text-gray-500">
                      Pay when you claim your
                      order.
                    </p>
                  </div>
                </div>
              </label>

              {/* GCASH */}
              <label
                className={`block cursor-pointer rounded-xl border p-4 ${
                  paymentMethod === "GCASH"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="GCASH"
                    checked={
                      paymentMethod === "GCASH"
                    }
                    onChange={() =>
                      setPaymentMethod("GCASH")
                    }
                  />

                  <div>
                    <p className="font-semibold">
                      📱 GCash
                    </p>

                    <p className="text-sm text-gray-500">
                      Pay online using GCash.
                    </p>
                  </div>
                </div>
              </label>
            </div>

            {/* TOTAL */}
            <div className="mt-6 rounded-xl bg-gray-100 p-4">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Total Amount
                </span>

                <span className="text-xl font-bold">
                  ₱{totalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* CHECKOUT BUTTON */}
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="mt-8 w-full rounded-xl bg-blue-600 px-5 py-4 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Processing..."
                : paymentMethod === "GCASH"
                ? "Proceed to GCash"
                : "Place Order"}
            </button>

            <button
              onClick={() => navigate("/cart")}
              disabled={loading}
              className="mt-3 w-full rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;