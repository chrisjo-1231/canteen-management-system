import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";

import TodayMenu from "./pages/TodayMenu";
import DailyMenuManagement from "./pages/DailyMenuManagement";
import FoodManagement from "./pages/FoodManagement"
import QRMenu from "./pages/QRMenu";
import Cart from "./pages/Cart";
import Register from "./pages/Register";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import CashierDashboard from "./pages/CashierDashboard";
import Checkout from "./pages/Checkout";
import CashierOrders from "./pages/CashierOrders";
import CashierPOS from "./pages/CashierPOS";
import CashierTransactions from "./pages/CashierTransactions";
import RoleRoute from "./components/RoleRoute";
import Receipt from "./pages/Receipt";
import Reports from "./pages/Reports";
import GCashPayment from "./pages/GCASHPayment";
import InventoryManagement from "./pages/InventoryManagement";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

function Navigation() {
  const { user, logout } = useAuth();

  // Walang navigation kapag hindi naka-login
  if (!user) {
    return null;
  }

  // =========================
  // ADMIN NAVIGATION
  // =========================
  if (user.role === "ADMIN") {
    return (
      <nav className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* LOGO */}
          <Link
            to="/admin/dashboard"
            className="text-xl font-bold text-blue-600"
          >
            🍽️ Canteen Admin
          </Link>

          {/* ADMIN LINKS */}
          <div className="flex items-center gap-2">

            <Link
              to="/admin/dashboard"
              className="rounded-lg px-4 py-2 font-medium text-gray-700 hover:bg-gray-100"
            >
              Dashboard
            </Link>

            <Link
              to="/admin/foods"
              className="rounded-lg px-4 py-2 font-medium text-gray-700 hover:bg-gray-100"
            >
              Foods
            </Link>

            <Link
              to="/admin/categories"
              className="rounded-lg px-4 py-2 font-medium text-gray-700 hover:bg-gray-100"
            >
              Categories
            </Link>

            <Link
              to="/admin/menu"
              className="rounded-lg px-4 py-2 font-medium text-gray-700 hover:bg-gray-100"
            >
              Daily Menu
            </Link>

            <Link
              to="/admin/qr-menu"
              className="rounded-lg px-4 py-2 font-medium text-gray-700 hover:bg-gray-100"
            >
              QR Menu
            </Link>

            <button
              onClick={() => {
                logout();
                window.location.href = "/login";
              }}
              className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
            >
              Logout
            </button>

          </div>
        </div>
      </nav>
    );
  }

  // =========================
  // STUDENT NAVIGATION
  // =========================
  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* LOGO */}
        <Link
          to="/menu/today"
          className="text-xl font-bold text-blue-600"
        >
          🍽️ Canteen
        </Link>

        {/* STUDENT LINKS */}
        <div className="flex items-center gap-2">

          <Link
            to="/menu/today"
            className="rounded-lg px-4 py-2 font-medium text-gray-700 hover:bg-gray-100"
          >
            Today's Menu
          </Link>

          <Link
            to="/cart"
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            🛒 Cart
          </Link>

          <button
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
            className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
          >
            Logout
          </button>

        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>

          <Navigation />

          <Routes>

            {/* =========================
                AUTH
            ========================= */}

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/register"
              element={<Register />}
            />


            {/* =========================
                STUDENT
            ========================= */}

            <Route
              path="/menu/today"
              element={
                <RoleRoute role="CUSTOMER">
                  <TodayMenu />
                </RoleRoute>
              }
            />

            <Route
              path="/cart"
              element={
                <RoleRoute role="CUSTOMER">
                  <Cart />
                </RoleRoute>
              }
            />

                          <Route
                path="/cashier/dashboard"
                element={
                  <RoleRoute role="CASHIER">
                    <CashierDashboard />
                  </RoleRoute>
                }
              />
                        <Route
                path="/cashier/orders"
                element={
                  <RoleRoute role="CASHIER">
                    <CashierOrders />
                  </RoleRoute>
                }
              />
              <Route
  path="/cashier/pos"
  element={
    <RoleRoute role="CASHIER">
      <CashierPOS />
    </RoleRoute>
  }
/>
              <Route
  path="/cashier/transactions"
  element={
    <RoleRoute role="CASHIER">
      <CashierTransactions />
    </RoleRoute>
  }
/>
<Route
  path="/cashier/receipt/:id"
  element={
    <RoleRoute role="CASHIER">
      <Receipt />
    </RoleRoute>
  }
/>
            {/* =========================
                ADMIN
            ========================= */}

            <Route
              path="/admin/dashboard"
              element={
                <RoleRoute role="ADMIN">
                  <AdminDashboard />
                </RoleRoute>
              }
            />

            <Route
              path="/admin/foods"
              element={
                <RoleRoute role="ADMIN">
                  <FoodManagement />
                </RoleRoute>
              }
            />
            <Route
  path="/admin/reports"
  element={
    <RoleRoute role="ADMIN">
      <Reports />
    </RoleRoute>
  }
/>
<Route
  path="/admin/inventory"
  element={
    <RoleRoute role="ADMIN">
      <InventoryManagement />
    </RoleRoute>
  }
/>
            {/* =========================
                CUSTOMER
            ========================= */}

            <Route
              path="/checkout"
              element={
                <RoleRoute role="CUSTOMER">
                  <Checkout />
                </RoleRoute>
              }
            />
            <Route
  path="/payment/gcash/:id"
  element={
    <RoleRoute role="CUSTOMER">
      <GCashPayment />
    </RoleRoute>
  }
/>

            <Route
              path="/admin/menu"
              element={
                <RoleRoute role="ADMIN">
                  <DailyMenuManagement />
                </RoleRoute>
              }
            />

            <Route
              path="/admin/qr-menu"
              element={
                <RoleRoute role="ADMIN">
                  <QRMenu />
                </RoleRoute>
              }
            />



            {/* =========================
                DEFAULT
            ========================= */}

            <Route
              path="/"
              element={
                <Navigate
                  to="/login"
                  replace
                />
              }
            />

            {/* =========================
                CATCH ALL
            ========================= */}

            <Route
              path="*"
              element={
                <Navigate
                  to="/login"
                  replace
                />
              }
            />

          </Routes>

        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;