import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* WELCOME */}
        <div className="mb-8 rounded-2xl bg-blue-600 p-8 text-white shadow-lg">
          <p className="text-sm font-medium text-blue-100">
            Welcome back 👋
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {user?.name}
          </h2>

          <p className="mt-2 max-w-2xl text-blue-100">
            Manage your canteen menu, food items, categories,
            and daily operations from one place.
          </p>
        </div>

        {/* OVERVIEW */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Overview
            </h2>

            <p className="text-sm text-gray-500">
              Quick view of your canteen system
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {/* FOOD */}
            <Link
              to="/admin/foods"
              className="group rounded-2xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="rounded-xl bg-orange-100 p-3 text-3xl">
                  🍔
                </div>

                <span className="text-gray-400 transition group-hover:translate-x-1">
                  →
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-800">
                Food Management
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Add, edit and manage food items.
              </p>
            </Link>

            

            {/* DAILY MENU */}
            <Link
              to="/admin/menu"
              className="group rounded-2xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="rounded-xl bg-green-100 p-3 text-3xl">
                  📅
                </div>

                <span className="text-gray-400 transition group-hover:translate-x-1">
                  →
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-800">
                Daily Menu
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Set the menu for each day.
              </p>
            </Link>

            {/* QR MENU */}
            <Link
              to="/admin/qr-menu"
              className="group rounded-2xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="rounded-xl bg-blue-100 p-3 text-3xl">
                  📱
                </div>

                <span className="text-gray-400 transition group-hover:translate-x-1">
                  →
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-800">
                QR Menu
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Display the canteen menu through QR code.
              </p>
            </Link>

          </div>
        </section>

        {/* OPERATIONS */}
        <section className="mt-10">

          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Operations
            </h2>

            <p className="text-sm text-gray-500">
              Other management tools
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">

            {/* USERS */}
            <button
              onClick={() => {
                alert(
                  "User Management will be implemented next."
                );
              }}
              className="rounded-2xl bg-white p-6 text-left shadow transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-4 text-4xl">
                👥
              </div>

              <h3 className="text-xl font-bold text-gray-800">
                User Management
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Manage students, cashiers and administrators.
              </p>

              <div className="mt-5 font-semibold text-blue-600">
                Manage Users →
              </div>
            </button>

            {/* REPORTS */}
           <button
  onClick={() => navigate("/admin/reports")}
  className="rounded-2xl bg-white p-6 text-left shadow transition hover:-translate-y-1 hover:shadow-lg"
>
  <div className="mb-4 text-4xl">
    📊
  </div>

  <h3 className="text-xl font-bold">
    Reports
  </h3>

  <p className="mt-2 text-gray-500">
    View sales, revenue, transactions and best-selling foods.
  </p>
</button>

            {/* INVENTORY */}
         <button
  onClick={() =>
    navigate("/admin/inventory")
  }
  className="rounded-2xl bg-white p-6 text-left shadow transition hover:-translate-y-1 hover:shadow-lg"
>
  <div className="mb-4 text-4xl">
    📦
  </div>

  <h3 className="text-xl font-bold">
    Inventory
  </h3>

  <p className="mt-2 text-gray-500">
    Manage stock, stock-in and stock-out.
  </p>
</button>

          </div>
        </section>

        {/* ACCOUNT */}
        <section className="mt-10">

          <div className="rounded-2xl bg-white p-6 shadow">

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-2xl">
                👤
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Account Information
                </h2>

                <p className="text-sm text-gray-500">
                  Your administrator account
                </p>
              </div>

            </div>

            <div className="mt-6 grid gap-4 border-t pt-6 sm:grid-cols-3">

              <div>
                <p className="text-xs font-semibold uppercase text-gray-400">
                  Name
                </p>

                <p className="mt-1 font-medium text-gray-800">
                  {user?.name}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-gray-400">
                  Email
                </p>

                <p className="mt-1 font-medium text-gray-800">
                  {user?.email}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-gray-400">
                  Role
                </p>

                <span className="mt-1 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                  {user?.role}
                </span>
              </div>

            </div>

          </div>

        </section>

      </main>
    </div>
  );
}

export default AdminDashboard;