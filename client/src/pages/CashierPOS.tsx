import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

type Food = {
  id: number;
  name: string;
  description?: string;
  price: string;
  image?: string;
  stock: number;
  isAvailable: boolean;
  category: {
    id: number;
    name: string;
  };
};

type POSItem = {
  food: Food;
  quantity: number;
};

function CashierPOS() {
  const navigate = useNavigate();

  const [foods, setFoods] = useState<Food[]>([]);
  const [items, setItems] = useState<POSItem[]>([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] =
    useState("ALL");

  const [cashReceived, setCashReceived] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [processing, setProcessing] =
    useState(false);

  const loadFoods = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "http://localhost:5000/api/foods"
      );

      setFoods(response.data);
    } catch (error) {
      console.error(
        "Failed to load foods:",
        error
      );

      alert("Failed to load foods.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFoods();
  }, []);

  const categories = useMemo(() => {
    const names = foods.map(
      (food) => food.category.name
    );

    return Array.from(new Set(names));
  }, [foods]);

  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      const matchesSearch =
        food.name
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        category === "ALL" ||
        food.category.name === category;

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [foods, search, category]);

  const totalItems = items.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  const totalPrice = items.reduce(
    (total, item) =>
      total +
      Number(item.food.price) *
        item.quantity,
    0
  );

  const cash = Number(cashReceived) || 0;

  const change =
    cash >= totalPrice
      ? cash - totalPrice
      : 0;

  const addToCart = (food: Food) => {
    if (!food.isAvailable) {
      return;
    }

    if (food.stock <= 0) {
      alert("This food is out of stock.");
      return;
    }

    setItems((current) => {
      const existing = current.find(
        (item) =>
          item.food.id === food.id
      );

      if (existing) {
        if (
          existing.quantity >=
          food.stock
        ) {
          alert(
            `Only ${food.stock} available.`
          );

          return current;
        }

        return current.map((item) =>
          item.food.id === food.id
            ? {
                ...item,
                quantity:
                  item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...current,
        {
          food,
          quantity: 1,
        },
      ];
    });
  };

  const increaseQuantity = (
    foodId: number
  ) => {
    setItems((current) =>
      current.map((item) => {
        if (item.food.id !== foodId) {
          return item;
        }

        if (
          item.quantity >=
          item.food.stock
        ) {
          alert(
            `Only ${item.food.stock} available.`
          );

          return item;
        }

        return {
          ...item,
          quantity:
            item.quantity + 1,
        };
      })
    );
  };

  const decreaseQuantity = (
    foodId: number
  ) => {
    setItems((current) =>
      current
        .map((item) =>
          item.food.id === foodId
            ? {
                ...item,
                quantity:
                  item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) => item.quantity > 0
        )
    );
  };

  const removeItem = (
    foodId: number
  ) => {
    setItems((current) =>
      current.filter(
        (item) =>
          item.food.id !== foodId
      )
    );
  };

  const clearPOS = () => {
    setItems([]);
    setCashReceived("");
  };

  const completeSale = async () => {
    if (items.length === 0) {
      alert(
        "Please add at least one item."
      );
      return;
    }

    if (cash < totalPrice) {
      alert(
        "Cash received is not enough."
      );
      return;
    }

    try {
      setProcessing(true);

      const token =
        localStorage.getItem("token");

      if (!token) {
        alert("Please login again.");
        navigate("/login");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/pos/sales",
        {
          items: items.map((item) => ({
            foodId: item.food.id,
            quantity: item.quantity,
          })),

          cashReceived: cash,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const sale =
        response.data.sale;

      alert(
        `Sale completed!\n\nReceipt #${sale.id}\nTotal: ₱${Number(
          sale.total
        ).toFixed(2)}\nCash: ₱${Number(
          sale.cashReceived
        ).toFixed(2)}\nChange: ₱${Number(
          sale.change
        ).toFixed(2)}`
      );
clearPOS();
await loadFoods();

navigate(`/cashier/receipt/${sale.id}`);
    } catch (error: any) {
      console.error(
        "POS sale failed:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to complete sale."
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              🛒 Cashier POS
            </h1>

            <p className="text-sm text-gray-500">
              Walk-in Customer Sales
            </p>
          </div>

          <button
            onClick={() =>
              navigate(
                "/cashier/dashboard"
              )
            }
            className="rounded-lg border px-4 py-2 font-medium hover:bg-gray-50"
          >
            ← Dashboard
          </button>

        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 p-6 lg:grid-cols-3">

        {/* FOOD SECTION */}
        <div className="lg:col-span-2">

          {/* SEARCH + CATEGORY */}
          <div className="mb-6 rounded-2xl bg-white p-5 shadow">

            <div className="flex flex-col gap-4 md:flex-row">

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search food..."
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <select
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }
                className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              >
                <option value="ALL">
                  All Categories
                </option>

                {categories.map(
                  (name) => (
                    <option
                      key={name}
                      value={name}
                    >
                      {name}
                    </option>
                  )
                )}
              </select>

            </div>

          </div>

          {/* FOODS */}
          {loading ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow">
              Loading foods...
            </div>
          ) : filteredFoods.length ===
            0 ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow">
              <div className="text-5xl">
                🍽️
              </div>

              <h2 className="mt-3 text-xl font-bold">
                No food found
              </h2>

              <p className="mt-1 text-gray-500">
                Try another search.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

              {filteredFoods.map(
                (food) => (
                  <div
                    key={food.id}
                    className="overflow-hidden rounded-2xl bg-white shadow transition hover:-translate-y-1 hover:shadow-lg"
                  >

                    {food.image ? (
                      <img
                        src={food.image}
                        alt={food.name}
                        className="h-40 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-40 items-center justify-center bg-gray-200 text-5xl">
                        🍽️
                      </div>
                    )}

                    <div className="p-4">

                      <p className="text-xs font-semibold uppercase text-blue-600">
                        {food.category.name}
                      </p>

                      <h2 className="mt-1 text-lg font-bold">
                        {food.name}
                      </h2>

                      <p className="mt-2 text-xl font-bold text-gray-800">
                        ₱
                        {Number(
                          food.price
                        ).toFixed(2)}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Stock:{" "}
                        {food.stock}
                      </p>

                      <button
                        onClick={() =>
                          addToCart(food)
                        }
                        disabled={
                          !food.isAvailable ||
                          food.stock <= 0
                        }
                        className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        {food.stock <= 0
                          ? "Out of Stock"
                          : !food.isAvailable
                          ? "Unavailable"
                          : "Add to Cart"}
                      </button>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </div>

        {/* POS CART */}
        <div>

          <div className="sticky top-6 rounded-2xl bg-white p-6 shadow">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-xl font-bold">
                  Current Sale
                </h2>

                <p className="text-sm text-gray-500">
                  {totalItems} item(s)
                </p>
              </div>

              {items.length > 0 && (
                <button
                  onClick={clearPOS}
                  className="text-sm font-semibold text-red-600 hover:text-red-700"
                >
                  Clear
                </button>
              )}

            </div>

            {/* ITEMS */}
            {items.length === 0 ? (
              <div className="py-12 text-center">

                <div className="text-5xl">
                  🛒
                </div>

                <p className="mt-3 font-semibold text-gray-700">
                  No items
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Select food to start a sale.
                </p>

              </div>
            ) : (
              <div className="mt-6 max-h-[420px] space-y-4 overflow-y-auto">

                {items.map((item) => {

                  const itemTotal =
                    Number(
                      item.food.price
                    ) *
                    item.quantity;

                  return (
                    <div
                      key={item.food.id}
                      className="border-b pb-4"
                    >

                      <div className="flex justify-between gap-3">

                        <div>
                          <h3 className="font-bold">
                            {item.food.name}
                          </h3>

                          <p className="text-sm text-gray-500">
                            ₱
                            {Number(
                              item.food.price
                            ).toFixed(2)}
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            removeItem(
                              item.food.id
                            )
                          }
                          className="text-sm text-red-600"
                        >
                          Remove
                        </button>

                      </div>

                      <div className="mt-3 flex items-center justify-between">

                        <div className="flex items-center rounded-lg border">

                          <button
                            onClick={() =>
                              decreaseQuantity(
                                item.food.id
                              )
                            }
                            className="px-3 py-1 hover:bg-gray-100"
                          >
                            −
                          </button>

                          <span className="px-4 py-1 font-semibold">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              increaseQuantity(
                                item.food.id
                              )
                            }
                            className="px-3 py-1 hover:bg-gray-100"
                          >
                            +
                          </button>

                        </div>

                        <span className="font-bold">
                          ₱
                          {itemTotal.toFixed(
                            2
                          )}
                        </span>

                      </div>

                    </div>
                  );
                })}

              </div>
            )}

            {/* TOTAL */}
            <div className="mt-6 border-t pt-5">

              <div className="flex justify-between">

                <span className="text-lg font-bold">
                  Total
                </span>

                <span className="text-2xl font-bold text-blue-600">
                  ₱
                  {totalPrice.toFixed(2)}
                </span>

              </div>

            </div>

            {/* CASH */}
            <div className="mt-5">

              <label className="mb-2 block font-semibold text-gray-700">
                Cash Received
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={cashReceived}
                onChange={(e) =>
                  setCashReceived(
                    e.target.value
                  )
                }
                placeholder="0.00"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* CHANGE */}
            <div className="mt-4 rounded-xl bg-gray-100 p-4">

              <div className="flex justify-between">

                <span className="font-semibold text-gray-600">
                  Change
                </span>

                <span
                  className={`text-xl font-bold ${
                    cash >= totalPrice &&
                    totalPrice > 0
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  ₱
                  {change.toFixed(2)}
                </span>

              </div>

            </div>

            {/* COMPLETE SALE */}
            <button
              onClick={completeSale}
              disabled={
                processing ||
                items.length === 0 ||
                cash < totalPrice
              }
              className="mt-5 w-full rounded-xl bg-green-600 px-5 py-4 font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {processing
                ? "Processing..."
                : "💰 Complete Sale"}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default CashierPOS;