"use client";
import Link from "next/link";
import { useState } from "react";
import { AlertCircle, Loader2, HardHat, ShieldCheck, Zap, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface LoginResponse {
  token?: string;
  access_token?: string;
  user?: { role?: string };
}

const demoAccounts = [
  { email: "worker@coalmine.com", password: "password123", role: "worker", label: "Worker", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
  { email: "supervisor@coalmine.com", password: "password123", role: "supervisor", label: "Supervisor", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { email: "safety@coalmine.com", password: "password123", role: "safety", label: "Safety Officer", color: "text-green-400 bg-green-500/10 border-green-500/20" },
  { email: "admin@coalmine.com", password: "password123", role: "admin", label: "Administrator", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  { email: "authority@coalmine.com", password: "password123", role: "authority", label: "Authority", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapRoleToRoute = (role?: string) => {
    if (!role) return "worker";
    if (role === "safety_officer") return "safety";
    return role;
  };

  const handleLogin = async (inputEmail: string, inputPassword: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const data = await apiFetch<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: inputEmail,
          password: String(inputPassword),
        }),
      });
      const token = data?.access_token || data?.token;
      if (token && typeof window !== "undefined") {
        localStorage.setItem("access_token", token);
      }
      const role = mapRoleToRoute(data?.user?.role);
      router.replace(`/dashboard/${role}?role=${role}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex bg-neutral-950 text-white overflow-hidden"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden border-r border-white/[0.06]">
        {/* Ambient gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 100% 80% at 0% 50%, rgba(249,115,22,0.15) 0%, transparent 65%), #0a0a0a",
          }}
        />
        <div className="absolute inset-0 bg-dot-pattern opacity-25" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/40">
              <HardHat size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold">MineOps</span>
          </div>

          {/* Center card */}
          <div className="max-w-sm">
            {/* Floating icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center mb-8 shadow-xl shadow-orange-500/30 animate-float">
              <ShieldCheck size={32} className="text-white" />
            </div>

            <h2 className="text-3xl font-black leading-tight mb-4">
              Secure Access to
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #f97316, #fb923c)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Mine Operations
              </span>
            </h2>
            <p className="text-neutral-500 text-sm leading-relaxed mb-8">
              Role-based authentication ensures every personnel only
              accesses what they need — securely enforced server-side.
            </p>

            {/* Features */}
            {[
              { icon: <ShieldCheck size={14} />, text: "RBAC — server-enforced roles" },
              { icon: <Zap size={14} />, text: "Real-time incident monitoring" },
              { icon: <AlertCircle size={14} />, text: "Automated alert escalation" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3 mb-3">
                <div className="w-6 h-6 rounded-lg bg-orange-500/15 text-orange-400 flex items-center justify-center flex-shrink-0">
                  {f.icon}
                </div>
                <span className="text-sm text-neutral-400">{f.text}</span>
              </div>
            ))}
          </div>

          {/* Bottom */}
          <p className="text-xs text-neutral-700">© 2026 MineOps Safety System</p>
        </div>

        {/* Decorative glow orbs */}
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-orange-500/5 blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 left-1/3 w-48 h-48 rounded-full bg-orange-500/8 blur-2xl pointer-events-none animate-float" style={{ animationDelay: "1s" }} />
      </div>

      {/* ── Right — form panel ── */}
      <div className="w-full lg:w-[480px] flex flex-col justify-center px-8 py-10 relative">
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
          <div className="mb-8">
            <h1 className="text-2xl font-black mb-1.5">Welcome back</h1>
            <p className="text-sm text-neutral-500">Sign in to your mine operations account</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-sm text-red-300 animate-fade-in">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">
                Email / Employee ID
              </label>
              <input
                id="login-email"
                type="text"
                placeholder="you@coalmine.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin(email, password)}
                className="input-premium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin(email, password)}
                  className="input-premium pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-xs text-neutral-500 cursor-pointer">
                <input type="checkbox" className="accent-orange-500 rounded" />
                Remember me
              </label>
              <span className="text-xs text-orange-400 hover:text-orange-300 cursor-pointer transition-colors">
                Forgot password?
              </span>
            </div>

            <button
              id="login-btn"
              onClick={() => handleLogin(email, password)}
              disabled={isLoading}
              className="btn-primary w-full py-3"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/[0.07]" />
            <span className="text-xs text-neutral-600 font-medium">or try a demo account</span>
            <div className="flex-1 h-px bg-white/[0.07]" />
          </div>

          {/* Demo accounts */}
          <div className="mb-6">
            <button
              onClick={() => setShowDemo(!showDemo)}
              className="w-full py-2.5 rounded-xl border border-white/[0.08] text-neutral-400 text-sm hover:border-orange-500/30 hover:text-orange-400 transition-all flex items-center justify-center gap-2"
            >
              {showDemo ? "Hide demo accounts" : "Show demo accounts"}
            </button>

            {showDemo && (
              <div className="mt-3 space-y-2 animate-fade-in-up">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.role}
                    onClick={() => handleLogin(acc.email, acc.password)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border ${acc.color} transition-all hover:opacity-80`}
                  >
                    <div className="text-left">
                      <p className="text-sm font-semibold">{acc.label}</p>
                      <p className="text-xs opacity-60">{acc.email}</p>
                    </div>
                    <ArrowRight size={14} className="opacity-60" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Security note */}
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex gap-2.5 text-xs text-neutral-600 mb-6">
            <ShieldCheck size={14} className="flex-shrink-0 mt-0.5 text-orange-500/60" />
            <p>RBAC enforced — users cannot elevate privilege from the UI. Access is server-authorized.</p>
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-neutral-600">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
              Create account <ArrowRight size={12} className="inline" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
