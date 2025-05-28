"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If token exists, redirect to home
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/");
    }
  }, [router]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Validate token format
      if (!data.token || typeof data.token !== 'string') {
        throw new Error("Invalid token received from server");
      }

      // Clear any existing token
      localStorage.removeItem("token");
      
      // Store the new token
      localStorage.setItem("token", data.token);
      
      // Verify the token was stored correctly
      const storedToken = localStorage.getItem("token");
      if (storedToken !== data.token) {
        throw new Error("Failed to store token properly");
      }

      router.push("/");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-100">
      <div className="flex max-w-5xl w-full shadow-xl rounded-xl overflow-hidden">
        <div className="w-1/2 bg-gradient-to-br from-purple-500 to-purple-700 text-white p-12">
          <h1 className="text-4xl font-bold mb-4">A New Way To Learn Data Structures</h1>
          <p className="text-purple-100">Log in to your account and continue building.</p>
        </div>
        <div className="w-1/2 bg-white p-12 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-purple-700 mb-4">Log In</h2>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-600 rounded-lg">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              required
              autoComplete="username"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              required
              autoComplete="current-password"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {isLoading ? "Logging in..." : "Log In"}
            </button>
            <p className="text-sm text-gray-500 text-center">
              Don't have an account?{" "}
              <a href="/signup" className="text-purple-600 hover:underline">
                Sign Up
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
