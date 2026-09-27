import { useEffect, useState } from "react";
import axios from "axios";

type Category = {
  id: number;
  name: string;
};

type Food = {
  id: number;
  name: string;
  description?: string;
  price: string;
  stock: number;
  image?: string;
  isAvailable: boolean;
  categoryId: number;
  category: Category;
};

function FoodManagement() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [editingFood, setEditingFood] = useState<Food | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    image: "",
  });

  // LOAD DATA
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [foodsResponse, categoriesResponse] =
        await Promise.all([
          axios.get("http://localhost:5000/api/foods"),
          axios.get("http://localhost:5000/api/categories"),
        ]);

      setFoods(foodsResponse.data);
      setCategories(categoriesResponse.data);
    } catch (error) {
      console.error("Failed to load data:", error);
      alert("Failed to load food data.");
    } finally {
      setLoading(false);
    }
  };

  // OPEN ADD MODAL
  const openAddModal = () => {
    setEditingFood(null);

    setForm({
      name: "",
      description: "",
      price: "",
      stock: "",
      categoryId: "",
      image: "",
    });

    setShowModal(true);
  };

  // OPEN EDIT MODAL
  const openEditModal = (food: Food) => {
    setEditingFood(food);

    setForm({
      name: food.name,
      description: food.description || "",
      price: food.price,
      stock: String(food.stock),
      categoryId: String(food.categoryId),
      image: food.image || "",
    });

    setShowModal(true);
  };

  // CLOSE MODAL
  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingFood(null);
  };

  // HANDLE FORM
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // ADD / UPDATE FOOD
  const saveFood = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Food name is required.");
      return;
    }

    if (!form.price) {
      alert("Price is required.");
      return;
    }

    if (!form.categoryId) {
      alert("Please select a category.");
      return;
    }

    try {
      setSaving(true);

      const foodData = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        price: Number(form.price),
        stock: Number(form.stock || 0),
        categoryId: Number(form.categoryId),
        image: form.image.trim() || undefined,
      };

      // UPDATE
      if (editingFood) {
        await axios.put(
          `http://localhost:5000/api/foods/${editingFood.id}`,
          foodData
        );

        alert("Food updated successfully!");
      }

      // ADD
      else {
        await axios.post(
          "http://localhost:5000/api/foods",
          foodData
        );

        alert("Food added successfully!");
      }

      setShowModal(false);
      setEditingFood(null);

      await loadData();
    } catch (error) {
      console.error("Failed to save food:", error);

      alert(
        editingFood
          ? "Failed to update food."
          : "Failed to add food."
      );
    } finally {
      setSaving(false);
    }
  };

  // DELETE FOOD
  const deleteFood = async (food: Food) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${food.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/api/foods/${food.id}`
      );

      await loadData();

      alert("Food deleted successfully!");
    } catch (error) {
      console.error("Failed to delete food:", error);

      alert("Failed to delete food.");
    }
  };

  // ENABLE / DISABLE FOOD
  const toggleAvailability = async (food: Food) => {
    try {
      await axios.put(
        `http://localhost:5000/api/foods/${food.id}`,
        {
          isAvailable: !food.isAvailable,
        }
      );

      await loadData();
    } catch (error) {
      console.error(
        "Failed to update availability:",
        error
      );

      alert("Failed to update availability.");
    }
  };

  // LOADING
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mb-3 text-4xl">
            🍽️
          </div>

          <p className="text-gray-500">
            Loading foods...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Food Management
            </h1>

            <p className="mt-1 text-gray-500">
              Manage the foods available in your canteen.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white shadow hover:bg-blue-700"
          >
            + Add Food
          </button>

        </div>

        {/* FOOD LIST */}
        <div className="rounded-2xl bg-white p-6 shadow">

          <div className="mb-5">
            <h2 className="text-xl font-bold">
              Foods
            </h2>

            <p className="text-sm text-gray-500">
              {foods.length} food item(s)
            </p>
          </div>

          {foods.length === 0 ? (

            <div className="rounded-xl border border-dashed p-10 text-center">

              <div className="mb-3 text-5xl">
                🍽️
              </div>

              <p className="text-gray-500">
                No foods found.
              </p>

              <button
                onClick={openAddModal}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
              >
                Add your first food
              </button>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead>
                  <tr className="border-b">

                    <th className="px-4 py-3">
                      Food
                    </th>

                    <th className="px-4 py-3">
                      Category
                    </th>

                    <th className="px-4 py-3">
                      Price
                    </th>

                    <th className="px-4 py-3">
                      Stock
                    </th>

                    <th className="px-4 py-3">
                      Status
                    </th>

                    <th className="px-4 py-3">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {foods.map((food) => (

                    <tr
                      key={food.id}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >

                      {/* FOOD */}
                      <td className="px-4 py-4">

                        <div className="flex items-center gap-3">

                          {food.image ? (

                            <img
                              src={food.image}
                              alt={food.name}
                              className="h-14 w-14 rounded-lg object-cover"
                            />

                          ) : (

                            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-100 text-2xl">
                              🍽️
                            </div>

                          )}

                          <div>

                            <p className="font-semibold">
                              {food.name}
                            </p>

                            {food.description && (
                              <p className="text-sm text-gray-500">
                                {food.description}
                              </p>
                            )}

                          </div>

                        </div>

                      </td>

                      {/* CATEGORY */}
                      <td className="px-4 py-4">
                        {food.category.name}
                      </td>

                      {/* PRICE */}
                      <td className="px-4 py-4 font-semibold">
                        ₱{food.price}
                      </td>

                      {/* STOCK */}
                      <td className="px-4 py-4">

                        <span
                          className={
                            food.stock === 0
                              ? "font-semibold text-red-600"
                              : food.stock <= 10
                              ? "font-semibold text-yellow-600"
                              : "text-gray-700"
                          }
                        >
                          {food.stock}
                        </span>

                      </td>

                      {/* STATUS */}
                      <td className="px-4 py-4">

                        {food.isAvailable ? (

                          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                            Available
                          </span>

                        ) : (

                          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                            Unavailable
                          </span>

                        )}

                      </td>

                      {/* ACTIONS */}
                      <td className="px-4 py-4">

                        <div className="flex flex-wrap gap-2">

                          {/* EDIT */}
                          <button
                            onClick={() =>
                              openEditModal(food)
                            }
                            className="rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200"
                          >
                            Edit
                          </button>

                          {/* ENABLE / DISABLE */}
                          <button
                            onClick={() =>
                              toggleAvailability(food)
                            }
                            className={`rounded-lg px-3 py-2 text-sm font-medium ${
                              food.isAvailable
                                ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                          >
                            {food.isAvailable
                              ? "Disable"
                              : "Enable"}
                          </button>

                          {/* DELETE */}
                          <button
                            onClick={() =>
                              deleteFood(food)
                            }
                            className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>
      </div>

      {/* ADD / EDIT FOOD MODAL */}
      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b p-6">

              <div>

                <h2 className="text-2xl font-bold">
                  {editingFood
                    ? "Edit Food"
                    : "Add New Food"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingFood
                    ? "Update the food information."
                    : "Add a new food item to your canteen."}
                </p>

              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="text-2xl text-gray-400 hover:text-gray-700 disabled:opacity-50"
              >
                ×
              </button>

            </div>

            {/* FORM */}
            <form onSubmit={saveFood}>

              <div className="max-h-[65vh] space-y-5 overflow-y-auto p-6">

                {/* NAME */}
                <div>

                  <label className="mb-2 block font-semibold">
                    Food Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Fried Chicken"
                    className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                  />

                </div>

                {/* DESCRIPTION */}
                <div>

                  <label className="mb-2 block font-semibold">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="e.g. Crispy fried chicken"
                    rows={3}
                    className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                  />

                </div>

                {/* PRICE */}
                <div>

                  <label className="mb-2 block font-semibold">
                    Price
                  </label>

                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="85"
                    min="0"
                    step="0.01"
                    className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                  />

                </div>

                {/* STOCK */}
                <div>

                  <label className="mb-2 block font-semibold">
                    Stock
                  </label>

                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="50"
                    min="0"
                    className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                  />

                </div>

                {/* CATEGORY */}
                <div>

                  <label className="mb-2 block font-semibold">
                    Category
                  </label>

                  <select
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleChange}
                    className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                  >

                    <option value="">
                      Select category
                    </option>

                    {categories.map((category) => (

                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>

                    ))}

                  </select>

                </div>

                {/* IMAGE */}
                <div>

                  <label className="mb-2 block font-semibold">
                    Image URL
                  </label>

                  <input
                    type="text"
                    name="image"
                    value={form.image}
                    onChange={handleChange}
                    placeholder="https://example.com/food.jpg"
                    className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                  />

                  <p className="mt-1 text-xs text-gray-400">
                    Optional
                  </p>

                </div>

              </div>

              {/* FOOTER */}
              <div className="flex justify-end gap-3 border-t bg-gray-50 p-6">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border bg-white px-5 py-3 font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingFood
                    ? "Update Food"
                    : "Save Food"}
                </button>

              </div>

            </form>

          </div>
        </div>

      )}

    </div>
  );
}

export default FoodManagement;