import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../context/AuthContext";

type Payment = {
  id: number;
  orderId: number;
  amount: string;
  method: "CASH" | "GCASH";
  status: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
  reference?: string;
};

function GCashPayment() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [payment, setPayment] =
    useState<Payment | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayment();
  }, []);

  const loadPayment = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/payments/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPayment(response.data);
    } catch (error) {
      console.error("PAYMENT ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading payment...</p>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Payment not found
          </h1>

          <button
            onClick={() => navigate("/menu/today")}
            className="mt-5 rounded-lg bg-blue-600 px-5 py-3 text-white"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
        <div className="mb-6 text-5xl">
          📱
        </div>

        <h1 className="text-3xl font-bold">
          GCash Payment
        </h1>

        <p className="mt-2 text-gray-500">
          Order #{payment.orderId}
        </p>

        <div className="my-8 rounded-xl bg-gray-100 p-6">
          <p className="text-sm text-gray-500">
            Amount to Pay
          </p>

          <p className="mt-2 text-4xl font-bold">
            ₱{Number(payment.amount).toFixed(2)}
          </p>
        </div>

        <div className="rounded-xl border-2 border-dashed border-gray-300 p-6">
          <p className="font-semibold">
            GCash Payment
          </p>

          <p className="mt-2 text-sm text-gray-500">
            This screen will contain the actual payment
            checkout once a payment gateway is connected.
          </p>
        </div>

        <div className="mt-6 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-700">
          Payment status:{" "}
          <strong>{payment.status}</strong>
        </div>

        <button
          onClick={() =>
            navigate(
              `/order-success/${payment.orderId}`
            )
          }
          className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          View Order
        </button>
      </div>
    </div>
  );
}

export default GCashPayment;