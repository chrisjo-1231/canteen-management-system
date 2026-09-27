import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

type RegisterRole = "CUSTOMER" | "CASHIER";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "CUSTOMER" as RegisterRole,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Name is required.");
      return;
    }

    if (!form.email.trim()) {
      alert("Email is required.");
      return;
    }

    if (form.password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
        }
      );

      alert(
        "Account created successfully! Please login."
      );

      navigate("/login");

    } catch (error: any) {
      console.error(
        "Registration failed:",
        error
      );

      const message =
        error.response?.data?.message ||
        "Registration failed.";

      alert(message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">

        {/* HEADER */}
        <div className="mb-8 text-center">

          <div className="mb-3 text-5xl">
            🍽️
          </div>

          <h1 className="text-3xl font-bold">
            Create Account
          </h1>

          <p className="mt-2 text-gray-500">
            Register for the Canteen Management System
          </p>

        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* NAME */}
          <div>
            <label className="mb-2 block font-semibold">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Juan Dela Cruz"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="mb-2 block font-semibold">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="student@example.com"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* ROLE */}
          <div>
            <label className="mb-2 block font-semibold">
              Account Type
            </label>

            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="CUSTOMER">
                Student
              </option>

              <option value="CASHIER">
                Cashier
              </option>
            </select>

            <p className="mt-1 text-xs text-gray-400">
              Admin accounts are created separately.
            </p>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="mb-2 block font-semibold">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />

            <p className="mt-1 text-xs text-gray-400">
              Minimum 6 characters
            </p>
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="mb-2 block font-semibold">
              Confirm Password
            </label>

            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>

        {/* LOGIN LINK */}
        <div className="mt-6 text-center text-sm text-gray-500">

          Already have an account?{" "}

          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Login
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Register;