import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

type SaleItem = {
  id: number;
  quantity: number;
  price: string;
  food: {
    id: number;
    name: string;
  };
};

type Sale = {
  id: number;
  total: string;
  cashReceived: string;
  change: string;
  createdAt: string;
  cashier: {
    name: string;
    email: string;
  };
  items: SaleItem[];
};

function Receipt() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSale = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/pos/sales/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSale(response.data);
      } catch (error: any) {
        console.error(error);

        alert(
          error.response?.data?.message ||
            "Failed to load receipt."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSale();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading receipt...
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="rounded-xl bg-white p-8 text-center shadow">
          <h1 className="text-xl font-bold">
            Receipt not found
          </h1>

          <button
            onClick={() =>
              navigate("/cashier/transactions")
            }
            className="mt-5 rounded-lg bg-blue-600 px-5 py-3 text-white"
          >
            Back to Transactions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="mx-auto max-w-md">

        {/* PRINT BUTTON */}

        <div className="mb-5 flex justify-between print:hidden">

          <button
            onClick={() =>
              navigate("/cashier/transactions")
            }
            className="rounded-lg border bg-white px-4 py-2 font-medium"
          >
            ← Transactions
          </button>

          <button
            onClick={() => window.print()}
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
          >
            🖨️ Print
          </button>

        </div>

        {/* RECEIPT */}

        <div className="receipt rounded-2xl bg-white p-8 shadow">

          <div className="text-center">

            <div className="text-4xl">
              🍽️
            </div>

            <h1 className="mt-2 text-2xl font-bold">
              CANTEEN
            </h1>

            <p className="text-sm text-gray-500">
              Canteen Management System
            </p>

            <div className="my-5 border-t border-dashed" />

            <p className="font-bold">
              RECEIPT #{sale.id}
            </p>

            <p className="text-sm text-gray-500">
              {new Date(
                sale.createdAt
              ).toLocaleString()}
            </p>

          </div>

          {/* CASHIER */}

          <div className="my-5 border-t border-dashed pt-4">

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                Cashier
              </span>

              <span className="font-semibold">
                {sale.cashier.name}
              </span>
            </div>

          </div>

          {/* ITEMS */}

          <div className="border-t border-dashed pt-4">

            {sale.items.map((item) => {

              const itemTotal =
                Number(item.price) *
                item.quantity;

              return (
                <div
                  key={item.id}
                  className="mb-4"
                >

                  <div className="flex justify-between">

                    <span className="font-medium">
                      {item.food.name}
                    </span>

                    <span className="font-semibold">
                      ₱{itemTotal.toFixed(2)}
                    </span>

                  </div>

                  <p className="text-sm text-gray-500">
                    {item.quantity} × ₱
                    {Number(
                      item.price
                    ).toFixed(2)}
                  </p>

                </div>
              );
            })}

          </div>

          {/* TOTAL */}

          <div className="border-t border-dashed pt-5">

            <div className="flex justify-between">
              <span>
                Total
              </span>

              <span className="font-bold">
                ₱{Number(
                  sale.total
                ).toFixed(2)}
              </span>
            </div>

            <div className="mt-2 flex justify-between">
              <span>
                Cash
              </span>

              <span>
                ₱{Number(
                  sale.cashReceived
                ).toFixed(2)}
              </span>
            </div>

            <div className="mt-2 flex justify-between">
              <span>
                Change
              </span>

              <span className="font-bold">
                ₱{Number(
                  sale.change
                ).toFixed(2)}
              </span>
            </div>

          </div>

          {/* FOOTER */}

          <div className="mt-8 border-t border-dashed pt-5 text-center">

            <p className="font-semibold">
              Thank you!
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Please keep your receipt.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Receipt;