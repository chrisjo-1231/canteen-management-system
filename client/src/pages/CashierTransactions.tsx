import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
    id: number;
    name: string;
    email: string;
  };
  items: SaleItem[];
};

function CashierTransactions() {
  const navigate = useNavigate();

  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSales = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/pos/sales",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSales(response.data);
    } catch (error: any) {
      console.error("Failed to load transactions:", error);

      alert(
        error.response?.data?.message ||
          "Failed to load transactions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  const totalSales = sales.reduce(
    (total, sale) => total + Number(sale.total),
    0
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              🧾 Transactions
            </h1>

            <p className="text-sm text-gray-500">
              POS transaction history
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/cashier/dashboard")
            }
            className="rounded-lg border px-4 py-2 font-medium hover:bg-gray-50"
          >
            ← Dashboard
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">

        {/* SUMMARY */}

        <div className="mb-6 grid gap-5 md:grid-cols-3">

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Total Transactions
            </p>

            <p className="mt-2 text-3xl font-bold">
              {sales.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Total Sales
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              ₱{totalSales.toFixed(2)}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Average Sale
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              ₱
              {sales.length > 0
                ? (totalSales / sales.length).toFixed(2)
                : "0.00"}
            </p>
          </div>

        </div>

        {/* TRANSACTIONS */}

        <div className="rounded-2xl bg-white shadow">

          <div className="flex items-center justify-between border-b p-6">
            <div>
              <h2 className="text-xl font-bold">
                Transaction History
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                All completed POS sales
              </p>
            </div>

            <button
              onClick={loadSales}
              className="rounded-lg border px-4 py-2 font-medium hover:bg-gray-50"
            >
              ↻ Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-500">
              Loading transactions...
            </div>
          ) : sales.length === 0 ? (
            <div className="p-10 text-center">

              <div className="text-5xl">
                🧾
              </div>

              <h3 className="mt-4 text-xl font-bold">
                No transactions yet
              </h3>

              <p className="mt-2 text-gray-500">
                Completed POS sales will appear here.
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Receipt #
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Items
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Cashier
                    </th>

                    <th className="px-6 py-4 text-right text-sm font-semibold">
                      Total
                    </th>

                    <th className="px-6 py-4 text-right text-sm font-semibold">
                      Cash
                    </th>

                    <th className="px-6 py-4 text-right text-sm font-semibold">
                      Change
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">

                  {sales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-bold">
                        #{sale.id}
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {sale.items.map((item) => (
                            <div
                              key={item.id}
                              className="text-sm"
                            >
                              <span className="font-medium">
                                {item.quantity}×
                              </span>{" "}
                              {item.food.name}
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">
                            {sale.cashier.name}
                          </p>

                          <p className="text-xs text-gray-500">
                            {sale.cashier.email}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right font-bold text-blue-600">
                        ₱{Number(sale.total).toFixed(2)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        ₱
                        {Number(
                          sale.cashReceived
                        ).toFixed(2)}
                      </td>

                      <td className="px-6 py-4 text-right font-semibold text-green-600">
                        ₱{Number(sale.change).toFixed(2)}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(
                          sale.createdAt
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default CashierTransactions;