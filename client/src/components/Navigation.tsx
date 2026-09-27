import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navigation() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const linkClass = (path: string) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive(path)
        ? "bg-blue-600 text-white"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        
        {/* LOGO */}
        <Link
          to={
            user.role === "ADMIN"
              ? "/admin/dashboard"
              : user.role === "CASHIER"
              ? "/cashier/dashboard"
              : "/menu/today"
          }
          className="flex items-center gap-2"
        >
          <span className="text-3xl">🍽️</span>

          <div>
            <h1 className="font-bold text-gray-800">
              Canteen Management
            </h1>

            <p className="text-xs text-gray-500">
              {user.role}
            </p>
          </div>
        </Link>

        {/* NAVIGATION */}
        <div className="hidden items-center gap-2 md:flex">

          {/* ADMIN */}
          {user.role === "ADMIN" && (
            <>
              <Link
                to="/admin/dashboard"
                className={linkClass("/admin/dashboard")}
              >
                Dashboard
              </Link>

              <Link
                to="/admin/foods"
                className={linkClass("/admin/foods")}
              >
                Foods
              </Link>

              <Link
                to="/admin/categories"
                className={linkClass("/admin/categories")}
              >
                Categories
              </Link>

              <Link
                to="/admin/menu"
                className={linkClass("/admin/menu")}
              >
                Daily Menu
              </Link>

              <Link
                to="/admin/qr-menu"
                className={linkClass("/admin/qr-menu")}
              >
                QR Menu
              </Link>
            </>
          )}

          {/* CASHIER */}
          {user.role === "CASHIER" && (
            <>
              <Link
                to="/cashier/dashboard"
                className={linkClass("/cashier/dashboard")}
              >
                Dashboard
              </Link>

              <Link
                to="/cashier/orders"
                className={linkClass("/cashier/orders")}
              >
                Orders
              </Link>

              <Link
                to="/cashier/pos"
                className={linkClass("/cashier/pos")}
              >
                POS
              </Link>

              <Link
                to="/cashier/transactions"
                className={linkClass("/cashier/transactions")}
              >
                Transactions
              </Link>
            </>
          )}

          {/* CUSTOMER */}
          {user.role === "CUSTOMER" && (
            <>
              <Link
                to="/menu/today"
                className={linkClass("/menu/today")}
              >
                Today's Menu
              </Link>

              <Link
                to="/cart"
                className={linkClass("/cart")}
              >
                🛒 Cart
              </Link>

              <Link
                to="/my-orders"
                className={linkClass("/my-orders")}
              >
                My Orders
              </Link>
            </>
          )}
        </div>

        {/* USER */}
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-gray-800">
              {user.name}
            </p>

            <p className="text-xs text-gray-500">
              {user.role}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;