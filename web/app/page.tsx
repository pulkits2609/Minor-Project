import Link from "next/link";
import {
  HardHat,
  ShieldCheck,
  Users,
  Activity,
  BarChart3,
  ArrowRight,
  Zap,
  Clock,
  AlertTriangle,
} from "lucide-react";

const roleCards = [
  {
    href: "/login?role=worker",
    icon: <HardHat size={22} />,
    label: "Worker Portal",
    desc: "Tasks, check-in & alerts",
    color: "from-orange-500/20 to-orange-600/5",
    border: "border-orange-500/20",
    iconBg: "bg-orange-500/15 text-orange-400",
  },
  {
    href: "/login?role=supervisor",
    icon: <Users size={22} />,
    label: "Supervisor",
    desc: "Team & task management",
    color: "from-blue-500/20 to-blue-600/5",
    border: "border-blue-500/20",
    iconBg: "bg-blue-500/15 text-blue-400",
  },
  {
    href: "/login?role=safety",
    icon: <ShieldCheck size={22} />,
    label: "Safety Officer",
    desc: "Monitoring & compliance",
    color: "from-green-500/20 to-green-600/5",
    border: "border-green-500/20",
    iconBg: "bg-green-500/15 text-green-400",
  },
  {
    href: "/login?role=admin",
    icon: <Activity size={22} />,
    label: "Administrator",
    desc: "Users, roles & settings",
    color: "from-purple-500/20 to-purple-600/5",
    border: "border-purple-500/20",
    iconBg: "bg-purple-500/15 text-purple-400",
  },
  {
    href: "/login?role=authority",
    icon: <BarChart3 size={22} />,
    label: "Authority",
    desc: "Analytics & oversight",
    color: "from-yellow-500/20 to-yellow-600/5",
    border: "border-yellow-500/20",
    iconBg: "bg-yellow-500/15 text-yellow-400",
  },
];

const stats = [
  { label: "Active Workers", value: "2,400+", icon: <Users size={16} /> },
  { label: "Zones Monitored", value: "180+", icon: <Activity size={16} /> },
  { label: "System Uptime", value: "99.9%", icon: <Zap size={16} /> },
  { label: "Incidents Resolved", value: "12K+", icon: <ShieldCheck size={16} /> },
];

export default function LandingPage() {
  return (
    <div
      className="min-h-screen bg-neutral-950 text-white flex flex-col overflow-hidden"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* ── Ambient background ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% -10%, rgba(249,115,22,0.12) 0%, transparent 65%)",
          }}
        />
        <div className="absolute inset-0 bg-dot-pattern opacity-30" />
      </div>

      {/* ── Navbar ── */}
      <nav
        className="relative z-10 flex justify-between items-center px-8 py-4 border-b border-white/[0.06]"
        style={{
          background: "rgba(10,10,10,0.7)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <HardHat size={16} className="text-white" />
          </div>
          <span className="text-base font-bold tracking-tight">MineOps</span>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/register">
            <button className="btn-ghost text-sm py-2 px-4">Register</button>
          </Link>
          <Link href="/login">
            <button className="btn-primary text-sm py-2 px-5">
              Sign In <ArrowRight size={14} />
            </button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 mb-8 animate-fade-in-up">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
          <span className="text-xs font-semibold text-orange-300 tracking-wide uppercase">
            Real-time Mine Safety Platform
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-5xl md:text-7xl font-black mb-6 leading-[1.05] tracking-tight animate-fade-in-up"
          style={{ animationDelay: "0.05s" }}
        >
          Coal Mine Safety
          <br />
          <span
            className="glow-text-orange"
            style={{
              background: "linear-gradient(135deg, #f97316, #fb923c, #fdba74)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            & Productivity
          </span>
        </h1>

        <p
          className="text-neutral-400 max-w-lg text-base md:text-lg mb-10 leading-relaxed animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          Real-time monitoring, incident reporting, and role-based access control
          for safer, smarter mining operations.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-wrap gap-4 justify-center animate-fade-in-up mb-16" style={{ animationDelay: "0.15s" }}>
          <Link href="/login">
            <button className="btn-primary px-8 py-3.5 text-base">
              Get Started <ArrowRight size={16} />
            </button>
          </Link>
          <Link href="/login?demo=true">
            <button className="btn-ghost px-8 py-3.5 text-base">
              Demo Mode
            </button>
          </Link>
        </div>

        {/* Stats strip */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl w-full mb-16 animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="glass-card rounded-xl px-4 py-4 flex flex-col items-center gap-1"
            >
              <div className="text-orange-400 mb-1">{s.icon}</div>
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-neutral-500 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Role cards */}
        <div className="w-full max-w-4xl animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
          <p className="text-xs text-neutral-600 uppercase font-semibold tracking-widest mb-4">
            Quick access by role
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {roleCards.map((card) => (
              <Link key={card.label} href={card.href}>
                <div
                  className={`group p-4 rounded-xl border ${card.border} bg-gradient-to-b ${card.color} hover:scale-[1.03] transition-all duration-200 cursor-pointer text-center`}
                  style={{ backdropFilter: "blur(8px)" }}
                >
                  <div className={`w-10 h-10 rounded-lg ${card.iconBg} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                    {card.icon}
                  </div>
                  <p className="text-sm font-semibold text-white mb-0.5">{card.label}</p>
                  <p className="text-[11px] text-neutral-500">{card.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature strip ── */}
      <section className="relative z-10 border-t border-white/[0.06] py-10 px-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <AlertTriangle size={18} className="text-orange-400" />, title: "Incident Reporting", desc: "One-tap emergency reporting with GPS zone tagging and escalation workflows." },
            { icon: <Clock size={18} className="text-blue-400" />, title: "Shift Management", desc: "Automated check-in/out, attendance tracking, and shift handover logs." },
            { icon: <ShieldCheck size={18} className="text-green-400" />, title: "RBAC Security", desc: "Server-side role enforcement — no privilege elevation possible from the UI." },
          ].map((f) => (
            <div key={f.title} className="glass-card rounded-xl p-5">
              <div className="mb-3">{f.icon}</div>
              <h3 className="font-semibold text-white mb-1.5">{f.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 text-center text-neutral-700 py-5 border-t border-white/[0.04] text-xs font-medium tracking-wide">
        © 2026 MineOps — Coal Mine Safety & Productivity System
      </footer>
    </div>
  );
}
