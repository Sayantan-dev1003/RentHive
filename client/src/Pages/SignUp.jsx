import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { FaArrowLeft } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const gradientButtonClass =
  "inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200";

const inputClass =
  "block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100";

const SignUp = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "customer",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role || "customer",
      };

      const response = await fetch("http://localhost:8000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to sign up");
      }

      // Use AuthContext login function to properly set state
      login(data.data.user, data.data.token);

      // Redirect based on user role
      const userRole = data.data.user.role;
      if (userRole === 'customer') {
        navigate("/customer/customer-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[100vh] w-full bg-white text-slate-800">
      <div onClick={() => navigate("/")} className="absolute top-6 left-6 z-10">
        <p className="cursor-pointer font-semibold text-lg"><FaArrowLeft /></p>
      </div>

      <div className="w-full h-full flex">
        {/* Left: Form */}
        <div className="w-1/2 h-full flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold tracking-tight">
              Create Your Account
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Already a member?{" "}
              <Link
                to="/signin"
                className="font-semibold text-sky-600 hover:text-sky-700"
              >
                Sign in
              </Link>
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              <div>
                <label
                  htmlFor="name"
                  className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Your full name"
                  className={inputClass}
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Email"
                  className={inputClass}
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Password"
                    className={inputClass}
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-3 my-auto inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? (
                      <FiEyeOff size={18} />
                    ) : (
                      <FiEye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600"
                >
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="Phone number"
                  className={inputClass}
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600"
                >
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  className={`${inputClass} appearance-none`}
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={gradientButtonClass}
                >
                  {loading ? "Creating account..." : "Create account"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Visual/Quote panel */}
        <div className="relative hidden overflow-hidden lg:block w-1/2 h-full">
          {/* Background video to match reference look */}
          <video
            src="/signIn.mp4"
            className="absolute top-0 right-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            onLoadedMetadata={(e) => {
              try {
                e.currentTarget.playbackRate = 0.10;
              } catch {}
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70" />

          {/* Content overlay */}
          <div className="relative flex h-full flex-col justify-end p-12 text-white">
            <div className="text-5xl leading-none">“”</div>
            <p className="mb-6 max-w-xl text-lg font-medium leading-relaxed text-white/90">
              At Renthive, we are committed to making every rental simple,
              secure, and dependable — ensuring our customers have complete
              confidence in every transaction.
            </p>

            <div className="h-px w-40 bg-white/40" />
            <div className="mt-4 text-sm text-white/90">
              <div className="font-semibold">Miles Morales</div>
              <div>CEO & Founder, RentHive</div>
            </div>

            <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white/60 to-transparent opacity-60" />

            <div className="absolute bottom-8 right-8 flex items-center gap-3">
              <button
                type="button"
                className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30"
                aria-label="Previous testimonial"
              >
                <FiChevronLeft />
              </button>
              <button
                type="button"
                className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30"
                aria-label="Next testimonial"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
