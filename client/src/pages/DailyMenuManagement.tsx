import { useEffect, useState } from "react";
import axios from "axios";

type Food = {
  id: number;
  name: string;
  price: string;
  isAvailable: boolean;
  category: {
    name: string;
  };
};

type MenuItem = {
  id: number;
  date: string;
  foodId: number;
  food: Food;
};

function DailyMenuManagement() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);

  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [loading, setLoading] = useState(true);

  // MODAL
  const [showModal, setShowModal] = useState(false);
  const [selectedFoodIds, setSelectedFoodIds] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState(date);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [date]);

  const loadData = async () => {
    try {
      setLoading(true);

      const foodsResponse = await axios.get(
        "http://localhost:5000/api/foods"
      );

      const menuResponse = await axios.get(
        `http://localhost:5000/api/daily-menu/date/${date}`
      );

      setFoods(foodsResponse.data);
      setMenu(menuResponse.data);
    } catch (error) {
      console.error("Failed to load menu data:", error);
    } finally {
      setLoading(false);
    }
  };

  // OPEN MODAL
  const openAddModal = () => {
    setSelectedFoodIds([]);
    setSelectedDate(date);
    setShowModal(true);
  };

  // CLOSE MODAL
  const closeModal = () => {
    setShowModal(false);
    setSelectedFoodIds([]);
  };

  // SELECT / UNSELECT FOOD
  const toggleFood = (foodId: number) => {
    setSelectedFoodIds((current) => {
      if (current.includes(foodId)) {
        return current.filter((id) => id !== foodId);
      }

      return [...current, foodId];
    });
  };

  // ADD MULTIPLE FOODS
  const addToMenu = async () => {
    if (selectedFoodIds.length === 0) {
      alert("Please select at least one food.");
      return;
    }

    try {
      setSaving(true);

      await Promise.all(
        selectedFoodIds.map((foodId) =>
          axios.post(
            "http://localhost:5000/api/daily-menu",
            {
              date: selectedDate,
              foodId,
            }
          )
        )
      );

      closeModal();

      if (selectedDate === date) {
        await loadData();
      } else {
        setDate(selectedDate);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to add foods to menu.");
    } finally {
      setSaving(false);
    }
  };

  // REMOVE MENU ITEM
  const removeFromMenu = async (id: number) => {
    const confirmed = window.confirm(
      "Remove this food from the menu?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/daily-menu/${id}`
      );

      await loadData();
    } catch (error) {
      console.error(error);
      alert("Failed to remove food.");
    }
  };

  const isInMenu = (foodId: number) => {
    return menu.some(
      (item) => item.foodId === foodId
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Daily Menu Management
            </h1>

            <p className="mt-1 text-gray-500">
              Manage your daily canteen menu.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            + Add Foods
          </button>
        </div>

        {/* DATE */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow">
          <label className="mb-2 block font-semibold">
            Menu Date
          </label>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border px-4 py-3"
          />
        </div>

        {/* CURRENT MENU */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold">
            Menu for {date}
          </h2>

          {menu.length === 0 ? (
            <p className="text-gray-500">
              No foods added to this menu.
            </p>
          ) : (
            <div className="space-y-3">
              {menu.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <h3 className="font-semibold">
                      {item.food.name}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {item.food.category.name} • ₱
                      {item.food.price}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      removeFromMenu(item.id)
                    }
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AVAILABLE FOODS */}
        <div className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold">
            Available Foods
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {foods.map((food) => {
              const alreadyAdded = isInMenu(food.id);

              return (
                <div
                  key={food.id}
                  className="rounded-xl border p-5"
                >
                  <h3 className="text-lg font-bold">
                    {food.name}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {food.category.name}
                  </p>

                  <p className="mt-2 text-xl font-bold">
                    ₱{food.price}
                  </p>

                  <div className="mt-4">
                    {alreadyAdded ? (
                      <span className="inline-block rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-500">
                        Already Added
                      </span>
                    ) : !food.isAvailable ? (
                      <span className="inline-block rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-400">
                        Unavailable
                      </span>
                    ) : (
                      <span className="text-sm text-green-600">
                        Available
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MULTI-SELECT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b p-6">
              <div>
                <h2 className="text-2xl font-bold">
                  Add Foods to Daily Menu
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Select multiple foods for your menu.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="text-2xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="max-h-[60vh] overflow-y-auto p-6">

              {/* DATE */}
              <div className="mb-6">
                <label className="mb-2 block font-semibold">
                  Menu Date
                </label>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) =>
                    setSelectedDate(e.target.value)
                  }
                  className="w-full rounded-lg border px-4 py-3"
                />
              </div>

              {/* SELECTED COUNT */}
              <div className="mb-4 rounded-lg bg-blue-50 p-4">
                <span className="font-semibold text-blue-700">
                  Selected: {selectedFoodIds.length} foods
                </span>
              </div>

              {/* FOOD LIST */}
              <div className="space-y-3">

                {foods.map((food) => {
                  const alreadyAdded = isInMenu(food.id);

                  const selected =
                    selectedFoodIds.includes(food.id);

                  const disabled =
                    alreadyAdded ||
                    !food.isAvailable;

                  return (
                    <button
                      key={food.id}
                      type="button"
                      disabled={disabled}
                      onClick={() =>
                        toggleFood(food.id)
                      }
                      className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                        disabled
                          ? "cursor-not-allowed bg-gray-100 opacity-60"
                          : selected
                          ? "border-blue-500 bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                    >

                      {/* CHECKBOX */}
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-md border-2 ${
                          selected
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-gray-300"
                        }`}
                      >
                        {selected && "✓"}
                      </div>

                      {/* FOOD INFO */}
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          {food.name}
                        </h3>

                        <p className="text-sm text-gray-500">
                          {food.category.name}
                        </p>
                      </div>

                      {/* PRICE */}
                      <div className="font-bold">
                        ₱{food.price}
                      </div>

                    </button>
                  );
                })}

              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="flex items-center justify-between border-t p-6">

              <p className="text-sm text-gray-500">
                {selectedFoodIds.length} selected
              </p>

              <div className="flex gap-3">

                <button
                  onClick={closeModal}
                  className="rounded-lg border px-5 py-3 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  onClick={addToMenu}
                  disabled={
                    saving ||
                    selectedFoodIds.length === 0
                  }
                  className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Adding..."
                    : `Add ${selectedFoodIds.length} Foods`}
                </button>

              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default DailyMenuManagement;