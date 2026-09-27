import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

type Food = {
  id: number;
  name: string;
  stock: number;
  price: string;
  isAvailable: boolean;
  category: {
    name: string;
  };
};

function InventoryManagement() {
  const navigate = useNavigate();

  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedFood, setSelectedFood] =
    useState<Food | null>(null);

  const [quantity, setQuantity] =
    useState("");

  const [reason, setReason] =
    useState("");

  const [type, setType] = useState<
    "STOCK_IN" | "STOCK_OUT"
  >("STOCK_IN");

  const loadInventory = async () => {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/inventory",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFoods(response.data);
    } catch (error: any) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to load inventory."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const openStockModal = (
    food: Food,
    stockType: "STOCK_IN" | "STOCK_OUT"
  ) => {
    setSelectedFood(food);
    setType(stockType);
    setQuantity("");
    setReason("");
  };

  const closeModal = () => {
    setSelectedFood(null);
    setQuantity("");
    setReason("");
  };

  const handleStockUpdate = async () => {
    if (!selectedFood) return;

    const qty = Number(quantity);

    if (!Number.isInteger(qty) || qty <= 0) {
      alert("Enter a valid quantity.");
      return;
    }

    if (
      type === "STOCK_OUT" &&
      qty > selectedFood.stock
    ) {
      alert("Not enough stock.");
      return;
    }

    try {
      const token =
        localStorage.getItem("token");

      await axios.post(
        `http://localhost:5000/api/inventory/${
          type === "STOCK_IN"
            ? "stock-in"
            : "stock-out"
        }`,
        {
          foodId: selectedFood.id,
          quantity: qty,
          reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(
        type === "STOCK_IN"
          ? "Stock added successfully."
          : "Stock removed successfully."
      );

      closeModal();
      await loadInventory();
    } catch (error: any) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to update stock."
      );
    }
  };

  const lowStockCount = foods.filter(
    (food) =>
      food.stock > 0 &&
      food.stock <= 5
  ).length;

  const outOfStockCount = foods.filter(
    (food) => food.stock <= 0
  ).length;

  return (
    <div className="min-h-screen bg-gray-100">

      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div>
            <h1 className="text-2xl font-bold">
              📦 Inventory Management
            </h1>

            <p className="text-sm text-gray-500">
              Manage canteen food stock
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

        <div className="mb-6 grid gap-5 md:grid-cols-3">

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Total Foods
            </p>

            <p className="mt-2 text-3xl font-bold">
              {foods.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Low Stock
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {lowStockCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">
              Out of Stock
            </p>

            <p className="mt-2 text-3xl font-bold text-red-600">
              {outOfStockCount}
            </p>
          </div>

        </div>

        {/* INVENTORY */}

        <div className="rounded-2xl bg-white shadow">

          <div className="flex items-center justify-between border-b p-6">

            <div>
              <h2 className="text-xl font-bold">
                Food Inventory
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Current stock levels
              </p>
            </div>

            <button
              onClick={loadInventory}
              className="rounded-lg border px-4 py-2 font-medium hover:bg-gray-50"
            >
              ↻ Refresh
            </button>

          </div>

          {loading ? (
            <div className="p-10 text-center">
              Loading inventory...
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      Food
                    </th>

                    <th className="px-6 py-4 text-left">
                      Category
                    </th>

                    <th className="px-6 py-4 text-right">
                      Price
                    </th>

                    <th className="px-6 py-4 text-center">
                      Stock
                    </th>

                    <th className="px-6 py-4 text-center">
                      Status
                    </th>

                    <th className="px-6 py-4 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">

                  {foods.map((food) => {

                    const lowStock =
                      food.stock > 0 &&
                      food.stock <= 5;

                    const outOfStock =
                      food.stock <= 0;

                    return (
                      <tr
                        key={food.id}
                        className="hover:bg-gray-50"
                      >

                        <td className="px-6 py-4 font-semibold">
                          {food.name}
                        </td>

                        <td className="px-6 py-4 text-gray-500">
                          {food.category.name}
                        </td>

                        <td className="px-6 py-4 text-right">
                          ₱
                          {Number(
                            food.price
                          ).toFixed(2)}
                        </td>

                        <td className="px-6 py-4 text-center">
                          <span
                            className={`font-bold ${
                              outOfStock
                                ? "text-red-600"
                                : lowStock
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}
                          >
                            {food.stock}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-center">

                          {outOfStock ? (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                              Out of Stock
                            </span>
                          ) : lowStock ? (
                            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                              Low Stock
                            </span>
                          ) : (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                              In Stock
                            </span>
                          )}

                        </td>

                        <td className="px-6 py-4">

                          <div className="flex justify-center gap-2">

                            <button
                              onClick={() =>
                                openStockModal(
                                  food,
                                  "STOCK_IN"
                                )
                              }
                              className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"
                            >
                              + Stock
                            </button>

                            <button
                              onClick={() =>
                                openStockModal(
                                  food,
                                  "STOCK_OUT"
                                )
                              }
                              disabled={
                                food.stock <= 0
                              }
                              className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                            >
                              - Stock
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </main>

      {/* MODAL */}

      {selectedFood && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-xl font-bold">
                  {type === "STOCK_IN"
                    ? "Add Stock"
                    : "Remove Stock"}
                </h2>

                <p className="text-sm text-gray-500">
                  {selectedFood.name}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="text-2xl text-gray-400 hover:text-gray-600"
              >
                ×
              </button>

            </div>

            <div className="mt-6">

              <p className="text-sm text-gray-500">
                Current Stock
              </p>

              <p className="text-2xl font-bold">
                {selectedFood.stock}
              </p>

            </div>

            <div className="mt-5">

              <label className="mb-2 block font-semibold">
                Quantity
              </label>

              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(e.target.value)
                }
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                placeholder="Enter quantity"
              />

            </div>

            <div className="mt-5">

              <label className="mb-2 block font-semibold">
                Reason
              </label>

              <input
                type="text"
                value={reason}
                onChange={(e) =>
                  setReason(e.target.value)
                }
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                placeholder="e.g. New delivery"
              />

            </div>

            <div className="mt-6 flex gap-3">

              <button
                onClick={closeModal}
                className="flex-1 rounded-lg border px-4 py-3 font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={handleStockUpdate}
                className={`flex-1 rounded-lg px-4 py-3 font-semibold text-white ${
                  type === "STOCK_IN"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {type === "STOCK_IN"
                  ? "Add Stock"
                  : "Remove Stock"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default InventoryManagement;