import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

type BestSellingFood = {
  foodId: number;
  name: string;
  quantity: number;
  revenue: number;
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
  };
};

type Report = {
  totalRevenue: number;
  totalTransactions: number;
  averageSale: number;
  bestSellingFoods: BestSellingFood[];
  sales: Sale[];
};

function Reports() {
  const navigate = useNavigate();

  const [report, setReport] =
    useState<Report | null>(null);

  const [loading, setLoading] = useState(true);

  const loadReport = async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/reports/sales",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReport(response.data);
    } catch (error: any) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to load report."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        Loading reports...
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">

      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div>
            <h1 className="text-2xl font-bold">
              📊 Sales Reports
            </h1>

            <p className="text-sm text-gray-500">
              Today's canteen sales
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/admin/dashboard")
            }
            className="rounded-lg border px-4 py-2 font-medium hover:bg-gray-50"
          >
            ← Dashboard
          </button>

        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">

        {/* SUMMARY */}

        <div className="grid gap-5 md:grid-cols-4">

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Today's Revenue
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              ₱{report.totalRevenue.toFixed(2)}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Transactions
            </p>

            <p className="mt-2 text-3xl font-bold">
              {report.totalTransactions}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Average Sale
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              ₱{report.averageSale.toFixed(2)}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Items Sold
            </p>

            <p className="mt-2 text-3xl font-bold">
              {report.bestSellingFoods.reduce(
                (total, food) =>
                  total + food.quantity,
                0
              )}
            </p>
          </div>

        </div>

        {/* BEST SELLING */}

        <div className="mt-6 rounded-2xl bg-white p-6 shadow">

          <h2 className="text-xl font-bold">
            🔥 Best Selling Foods
          </h2>

          <div className="mt-5 overflow-x-auto">

            {report.bestSellingFoods.length === 0 ? (
              <p className="py-8 text-center text-gray-500">
                No sales recorded today.
              </p>
            ) : (
              <table className="w-full">

                <thead className="border-b">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      Food
                    </th>

                    <th className="px-4 py-3 text-right">
                      Quantity Sold
                    </th>

                    <th className="px-4 py-3 text-right">
                      Revenue
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {report.bestSellingFoods.map(
                    (food, index) => (
                      <tr
                        key={food.foodId}
                        className="border-b last:border-0"
                      >
                        <td className="px-4 py-4">
                          <span className="mr-3 font-bold">
                            #{index + 1}
                          </span>

                          {food.name}
                        </td>

                        <td className="px-4 py-4 text-right font-semibold">
                          {food.quantity}
                        </td>

                        <td className="px-4 py-4 text-right font-semibold text-green-600">
                          ₱{food.revenue.toFixed(2)}
                        </td>
                      </tr>
                    )
                  )}

                </tbody>

              </table>
            )}

          </div>
        </div>

        {/* SALES */}

        <div className="mt-6 rounded-2xl bg-white shadow">

          <div className="border-b p-6">
            <h2 className="text-xl font-bold">
              Today's Transactions
            </h2>
          </div>

          {report.sales.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No transactions today.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      Receipt #
                    </th>

                    <th className="px-6 py-4 text-left">
                      Cashier
                    </th>

                    <th className="px-6 py-4 text-right">
                      Total
                    </th>

                    <th className="px-6 py-4 text-right">
                      Cash
                    </th>

                    <th className="px-6 py-4 text-right">
                      Change
                    </th>

                    <th className="px-6 py-4 text-left">
                      Time
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">

                  {report.sales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-bold">
                        #{sale.id}
                      </td>

                      <td className="px-6 py-4">
                        {sale.cashier.name}
                      </td>

                      <td className="px-6 py-4 text-right font-bold">
                        ₱{Number(
                          sale.total
                        ).toFixed(2)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        ₱{Number(
                          sale.cashReceived
                        ).toFixed(2)}
                      </td>

                      <td className="px-6 py-4 text-right text-green-600">
                        ₱{Number(
                          sale.change
                        ).toFixed(2)}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(
                          sale.createdAt
                        ).toLocaleTimeString()}
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

export default Reports;