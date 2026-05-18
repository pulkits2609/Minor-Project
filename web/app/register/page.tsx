"use client";
import Link from "next/link";
import { useState } from "react";
import { AlertCircle, Loader2, CheckCircle2, HardHat, UserPlus, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { apiFetch } from "@/lib/api";

const steps = ["Account Info", "Security", "Role"];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    requestedRole: "worker",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setIsLoading(true);
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: formData.requestedRole,
        }),
      });
      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Success state ──
  if (isSubmitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-neutral-950 text-white"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        <div className="absolute inset-0 bg-dot-pattern opacity-20 pointer-events-none" />
        <div className="relative z-10 text-center max-w-md px-6 animate-fade-in-up">
          <div className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={36} className="text-green-400" />
          </div>
          <h1 className="text-3xl font-black mb-3">Registration Submitted!</h1>
          <p className="text-neutral-500 mb-8 leading-relaxed">
            Your account has been created. You can now sign in with your credentials.
          </p>
          <Link href="/login">
            <button className="btn-primary px-8 py-3">
              Continue to Login <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex bg-neutral-950 text-white overflow-hidden"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden border-r border-white/[0.06]">
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 100% 80% at 0% 50%, rgba(249,115,22,0.12) 0%, transparent 65%), #0a0a0a",
          }}
        />
        <div className="absolute inset-0 bg-dot-pattern opacity-25" />

        <div className="relative z-10 flex flex-col justify-between h-full p-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/40">
              <HardHat size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold">MineOps</span>
          </div>

          {/* Center content */}
          <div className="max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center mb-8 shadow-xl shadow-orange-500/30 animate-float">
              <UserPlus size={30} className="text-white" />
            </div>

            <h2 className="text-3xl font-black leading-tight mb-4">
              Join the
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #f97316, #fb923c)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Safety Network
              </span>
            </h2>
            <p className="text-neutral-500 text-sm leading-relaxed mb-8">
              Create your mine operations account. Your role will be verified and
              assigned by an administrator after review.
            </p>

            {/* Step indicators */}
            <div className="space-y-3">
              {steps.map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-500/15 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-orange-400">{i + 1}</span>
                  </div>
                  <span className="text-sm text-neutral-400">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-neutral-700">© 2026 MineOps Safety System</p>
        </div>

        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-orange-500/5 blur-3xl pointer-events-none" />
      </div>

      {/* ── Right — form panel ── */}
      <div className="w-full lg:w-[500px] flex flex-col justify-center px-8 py-10 relative overflow-y-auto">
        <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none" />

        <div className="relative z-10 w-full max-w-sm mx-auto">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
              <HardHat size={16} className="text-white" />
            </div>
            <span className="font-bold text-base">MineOps</span>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-2xl font-black mb-1.5">Create Account</h1>
            <p className="text-sm text-neutral-500">Fill in your details to request access</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-sm text-red-300 animate-fade-in">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="input-premium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@coalmine.com"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-premium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">
                Requested Role
              </label>
              <select
                name="requestedRole"
                value={formData.requestedRole}
                onChange={handleChange}
                className="input-premium"
                style={{ appearance: "none" }}
              >
                <option value="worker">Worker</option>
                <option value="supervisor">Supervisor</option>
                <option value="safety">Safety Officer</option>
              </select>
              <p className="text-[11px] text-neutral-600 mt-1.5">
                Final role is assigned by the admin policy engine
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">
                Create Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Minimum 6 characters"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-premium pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-premium pr-10"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Registration
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Security note */}
          <div className="mt-5 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex gap-2.5 text-xs text-neutral-600">
            <ShieldCheck size={14} className="flex-shrink-0 mt-0.5 text-orange-500/60" />
            <p>Your final role will be assigned by the system administrator after approval.</p>
          </div>

          {/* Login link */}
          <p className="text-center text-sm text-neutral-600 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
              Sign in <ArrowRight size={12} className="inline" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
