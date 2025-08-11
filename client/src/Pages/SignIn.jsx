import React, { useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to sign in");
      }

      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black lg:grid lg:grid-cols-2">
      <div onClick={() => navigate("/")} className="absolute top-6 right-6 z-10">
        <p className="cursor-pointer"><FaArrowRight /></p>
      </div>

      {/* Left: Background video */}
      <div className="relative hidden lg:block">
        <video
          src="/signIn.mp4"
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          onLoadedMetadata={(e) => {
            try {
              e.currentTarget.playbackRate = 0.1; // Very slow
            } catch (err) {
              console.error("Playback rate error:", err);
            }
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 transform xl:block">
          <div className="h-0.5 w-20 bg-white/80" />
        </div>
      </div>

      {/* Right: Sign In Card */}
      <div className="flex min-h-screen items-center justify-center p-6 bg-gray-100">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-white/20 bg-gray-200/40 shadow-xl backdrop-blur-md backdrop-saturate-150">
            <div className="px-8 py-10">
              {/* Heading */}
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
                  Back again?
                </h1>
                <div className="mt-3 flex items-center justify-center text-neutral-500">
                  <span className="h-px w-10 bg-neutral-300" />
                  <span className="px-3 text-sm">
                    Let's get your rentals rolling
                  </span>
                  <span className="h-px w-10 bg-neutral-300" />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Sign In Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-xs font-semibold tracking-wider text-neutral-900"
                  >
                    EMAIL
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    required
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-neutral-400 focus:ring-4 focus:ring-emerald-100"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-xs font-semibold tracking-wider text-neutral-900"
                  >
                    PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 pr-11 text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-neutral-400 focus:ring-4 focus:ring-emerald-100"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      aria-label="Toggle password visibility"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 transition hover:text-neutral-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {showPassword ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.543 7-1.275 4.057-5.065 7-9.543 7-4.478 0-8.268-2.943-9.543-7zm9.542 3a3 3 0 100-6 3 3 0 000 6z"
                          />
                        )}
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Signing in…" : "Sign in"}
                </button>
              </form>

              {/* Secondary actions */}
              <div className="mt-6 space-y-2 text-center text-sm">
                <p className="text-neutral-600">
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    Create one
                  </Link>
                </p>
                <p className="text-neutral-600">Forgot Password/Username</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
