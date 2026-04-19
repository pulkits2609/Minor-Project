"use client";
import Link from "next/link";
import { useState } from "react";
import { AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    employeeId: "",
    email: "",
    requestedRole: "worker",
    password: "",
    confirmPassword: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    setIsSubmitted(true);
    setTimeout(() => {
      window.location.href = "/login";
    }, 3000);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        <div className="text-center">
          <div className="mb-6 text-6xl">✅</div>
          <h1 className="text-3xl font-bold mb-4">
            Registration Request Submitted
          </h1>
          <p className="text-gray-400 mb-6 max-w-md">
            Your account request has been submitted for approval. An
            administrator will review your request and assign a role
            accordingly.
          </p>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white py-12">
      <div className="w-full max-w-md">
        {/* LOGO */}
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-bold mb-2 hover:text-orange-400 transition">
              MineOps
            </h1>
          </Link>
          <p className="text-gray-400 text-sm">Create Your Account</p>
        </div>

        {/* REGISTRATION CARD */}
        <div className="p-8 bg-neutral-900 rounded-2xl shadow-lg border border-neutral-800">
          <h2 className="text-2xl font-bold mb-6 text-center">
            User Registration
          </h2>

          <p className="text-xs text-gray-400 mb-6 text-center">
            Account request workflow with admin approval
          </p>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-400 text-white"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                Employee ID
              </label>
              <input
                type="text"
                name="employeeId"
                placeholder="Enter your employee ID"
                required
                value={formData.employeeId}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-400 text-white"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-400 text-white"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                Requested Role (Read-Only Request)
              </label>
              <select
                name="requestedRole"
                value={formData.requestedRole}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-400 text-white"
              >
                <option value="worker">Worker</option>
                <option value="supervisor">Supervisor</option>
                <option value="safety">Safety Officer</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Final role assignment is made by Admin/Authority policy engine
              </p>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                Create Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter secure password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-400 text-white"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-400 text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold"
            >
              Submit Registration Request
            </button>
          </form>

          {/* SECURITY NOTE */}
          <div className="mt-6 bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-xs text-gray-400">
            <div className="flex gap-2">
              <AlertCircle
                size={14}
                className="flex-shrink-0 mt-0.5 text-orange-400"
              />
              <p>
                Your final role will be assigned by the system administrator
                after approval.
              </p>
            </div>
          </div>
        </div>

        {/* LOGIN LINK */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-400 mb-3">Already have an account?</p>
          <Link href="/login">
            <button className="w-full py-3 border border-orange-400 text-orange-400 rounded-lg hover:bg-orange-500/10 transition font-semibold">
              Sign In
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
