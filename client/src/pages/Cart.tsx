import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Cart() {
  const navigate = useNavigate();

  const {
    items,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice,
  } = useCart();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              🛒 Your Cart
            </h1>

            <p className="mt-1 text-gray-500">
              {totalItems} item(s) in your cart
            </p>
          </div>

          <Link
            to="/menu/today"
            className="rounded-lg border bg-white px-4 py-2 font-medium hover:bg-gray-50"
          >
            ← Back to Menu
          </Link>
        </div>

        {/* EMPTY CART */}
        {items.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow">

            <div className="mb-4 text-6xl">
              🛒
            </div>

            <h2 className="text-2xl font-bold">
              Your cart is empty
            </h2>

            <p className="mt-2 text-gray-500">
              Add some delicious food from today's menu.
            </p>

            <Link
              to="/menu/today"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Browse Menu
            </Link>

          </div>
        ) : (

          /* CART WITH ITEMS */
          <div className="grid gap-6 lg:grid-cols-3">

            {/* CART ITEMS */}
            <div className="space-y-4 lg:col-span-2">

              {items.map((item) => {
                const itemTotal =
                  Number(item.food.price) *
                  item.quantity;

                return (
                  <div
                    key={item.food.id}
                    className="rounded-2xl bg-white p-5 shadow"
                  >
                    <div className="flex gap-4">

                      {/* FOOD IMAGE */}
                      {item.food.image ? (
                        <img
                          src={item.food.image}
                          alt={item.food.name}
                          className="h-24 w-24 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-gray-200 text-3xl">
                          🍽️
                        </div>
                      )}

                      <div className="flex-1">

                        {/* FOOD INFORMATION */}
                        <div className="flex items-start justify-between">

                          <div>
                            <p className="text-sm text-blue-600">
                              {item.food.category.name}
                            </p>

                            <h2 className="text-xl font-bold">
                              {item.food.name}
                            </h2>

                            <p className="mt-1 text-gray-500">
                              ₱
                              {Number(
                                item.food.price
                              ).toFixed(2)}{" "}
                              each
                            </p>
                          </div>

                          <button
                            onClick={() =>
                              removeFromCart(item.food.id)
                            }
                            className="text-sm font-medium text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>

                        </div>

                        {/* QUANTITY + ITEM TOTAL */}
                        <div className="mt-4 flex items-center justify-between">

                          <div className="flex items-center rounded-lg border">

                            <button
                              onClick={() =>
                                decreaseQuantity(
                                  item.food.id
                                )
                              }
                              className="px-4 py-2 text-lg hover:bg-gray-100"
                            >
                              −
                            </button>

                            <span className="px-4 py-2 font-semibold">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() =>
                                increaseQuantity(
                                  item.food.id
                                )
                              }
                              className="px-4 py-2 text-lg hover:bg-gray-100"
                            >
                              +
                            </button>

                          </div>

                          <p className="text-xl font-bold">
                            ₱{itemTotal.toFixed(2)}
                          </p>

                        </div>

                      </div>

                    </div>
                  </div>
                );
              })}

              {/* CLEAR CART */}
              <button
                onClick={clearCart}
                className="rounded-lg text-sm font-medium text-red-600 hover:text-red-700"
              >
                Clear Cart
              </button>

            </div>

            {/* SUMMARY */}
            <div className="h-fit rounded-2xl bg-white p-6 shadow">

              <h2 className="text-xl font-bold">
                Order Summary
              </h2>

              <div className="my-5 space-y-3">

                {/* ITEMS */}
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Items
                  </span>

                  <span className="font-medium">
                    {totalItems}
                  </span>
                </div>

                {/* SUBTOTAL */}
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Subtotal
                  </span>

                  <span className="font-medium">
                    ₱{totalPrice.toFixed(2)}
                  </span>
                </div>

              </div>

              {/* TOTAL */}
              <div className="border-t pt-5">

                <div className="flex justify-between">

                  <span className="text-lg font-bold">
                    Total
                  </span>

                  <span className="text-2xl font-bold text-blue-600">
                    ₱{totalPrice.toFixed(2)}
                  </span>

                </div>

              </div>

              {/* CHECKOUT */}
              <button
                onClick={() => navigate("/checkout")}
                className="mt-6 w-full rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
              >
                Proceed to Checkout
              </button>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default Cart;