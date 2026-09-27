import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

type MenuItem = {
  id: number;
  date: string;
  foodId: number;
  food: {
    id: number;
    name: string;
    description?: string;
    price: string;
    image?: string;
    category: {
      name: string;
    };
  };
};

function TodayMenu() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // CART
  const {
    addToCart,
    totalItems,
  } = useCart();

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/daily-menu/today"
      );

      setMenu(response.data);
    } catch (error) {
      console.error(
        "Failed to load today's menu:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading today's menu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">

          <div>
            <h1 className="text-4xl font-bold">
              Today's Menu
            </h1>

            <p className="mt-2 text-gray-500">
              Fresh menu for today
            </p>
          </div>

          {/* CART */}
          <Link
            to="/cart"
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white shadow hover:bg-blue-700"
          >
            🛒 Cart ({totalItems})
          </Link>

        </div>

        {/* MENU */}
        {menu.length === 0 ? (

          <div className="rounded-xl bg-white p-10 text-center shadow">

            <h2 className="text-xl font-semibold">
              No menu available today
            </h2>

            <p className="mt-2 text-gray-500">
              Please check again later.
            </p>

          </div>

        ) : (

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {menu.map((item) => (

              <div
                key={item.id}
                className="overflow-hidden rounded-2xl bg-white shadow transition hover:-translate-y-1 hover:shadow-lg"
              >

                {/* IMAGE */}
                {item.food.image ? (

                  <img
                    src={item.food.image}
                    alt={item.food.name}
                    className="h-48 w-full object-cover"
                  />

                ) : (

                  <div className="flex h-48 w-full items-center justify-center bg-gray-200 text-5xl">
                    🍽️
                  </div>

                )}

                {/* CONTENT */}
                <div className="p-5">

                  <p className="mb-2 text-sm font-medium text-blue-600">
                    {item.food.category.name}
                  </p>

                  <h2 className="text-2xl font-bold">
                    {item.food.name}
                  </h2>

                  {item.food.description && (
                    <p className="mt-2 text-gray-500">
                      {item.food.description}
                    </p>
                  )}

                  {/* PRICE */}
                  <div className="mt-4 text-2xl font-bold">
                    ₱{Number(item.food.price).toFixed(2)}
                  </div>

                  {/* ADD TO CART */}
                  <button
                    onClick={() =>
                      addToCart(item.food)
                    }
                    className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
                  >
                    🛒 Add to Cart
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>
    </div>
  );
}

export default TodayMenu;