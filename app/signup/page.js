"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", username: "", password: "" });

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
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) router.push("/login");
    else alert("Registration failed");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-100">
      <div className="flex max-w-5xl w-full shadow-xl rounded-xl overflow-hidden">
        <div className="w-1/2 bg-gradient-to-br from-purple-500 to-purple-700 text-white p-12">
          <h1 className="text-4xl font-bold mb-4">A New Way To Learn Data Structures</h1>
          <p className="text-purple-100">Join our platform and start building today.</p>
        </div>
        <div className="w-1/2 bg-white p-12 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-purple-700 mb-4">Register</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
            <input
              name="username"
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
            <button
              type="submit"
              className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Register
            </button>
            <p className="text-sm text-gray-500 text-center">
              Already have an account?{" "}
              <a href="/login" className="text-purple-600 hover:underline">
                Log In
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}


