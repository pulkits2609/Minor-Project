"use client";
import { Bell, Settings, LogOut, Search, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const roleLabels: Record<string, string> = {
  worker: "Mine Worker",
  supervisor: "Supervisor",
  safety: "Safety Officer",
  admin: "Administrator",
  authority: "Authority",
};

const roleInitials: Record<string, string> = {
  worker: "MW",
  supervisor: "SV",
  safety: "SO",
  admin: "AD",
  authority: "AU",
};

export default function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pathParts = pathname.split("/").filter(Boolean);
  const roleFromPath = pathParts[0] === "dashboard" && pathParts[1] ? pathParts[1] : null;
  const role = roleFromPath || searchParams.get("role") || "worker";

  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setDate(now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Build breadcrumb from pathname
  const breadcrumb = pathParts
    .filter((p) => p !== "dashboard")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, " "));

  return (
    <header
      className="flex items-center justify-between px-6 py-0 border-b border-white/[0.06]"
      style={{
        height: "64px",
        background: "rgba(10,10,10,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      {/* Left — breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-neutral-500 font-medium">MineOps</span>
        {breadcrumb.map((crumb, i) => (
          <span key={i} className="flex items-center gap-2">
            <ChevronRight size={14} className="text-neutral-700" />
            <span className={i === breadcrumb.length - 1 ? "text-white font-semibold" : "text-neutral-400"}>
              {crumb}
            </span>
          </span>
        ))}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Live clock */}
        <div className="hidden md:flex flex-col items-end mr-2">
          <span className="text-xs font-mono font-semibold text-neutral-300 tabular-nums">{time}</span>
          <span className="text-[10px] text-neutral-600 font-medium">{date}</span>
        </div>

        {/* Search */}
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.07] text-neutral-500 text-xs hover:border-orange-500/30 hover:text-neutral-300 transition-all">
          <Search size={14} />
          <span className="hidden md:inline">Search...</span>
          <kbd className="hidden md:inline ml-1 px-1.5 py-0.5 rounded text-[10px] bg-white/[0.06] font-mono">⌘K</kbd>
        </button>

        {/* Bell */}
        <div className="relative">
          <button className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-neutral-400 hover:text-white hover:border-orange-500/30 transition-all">
            <Bell size={16} />
          </button>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-neutral-950">
            <span className="absolute inset-0 rounded-full bg-orange-400 animate-ping-slow opacity-75" />
          </span>
        </div>

        {/* Settings */}
        <Link
          href={`/dashboard/${role}/settings`}
          className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-neutral-400 hover:text-white hover:border-orange-500/30 transition-all"
        >
          <Settings size={16} />
        </Link>

        {/* User avatar */}
        <div className="flex items-center gap-2 pl-3 border-l border-white/[0.07]">
          <div className="flex flex-col items-end hidden md:flex">
            <span className="text-xs font-semibold text-white">{roleLabels[role] || role}</span>
            <span className="text-[10px] text-neutral-500">Active Session</span>
          </div>
          <div className="relative">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #f97316, #ea580c)",
                boxShadow: "0 0 0 2px rgba(249,115,22,0.4), 0 0 12px rgba(249,115,22,0.2)",
              }}
            >
              {roleInitials[role] || "U"}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full ring-2 ring-neutral-950" />
          </div>
          <Link
            href="/login"
            className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-neutral-400 hover:text-red-400 hover:border-red-500/30 transition-all"
            title="Sign out"
          >
            <LogOut size={15} />
          </Link>
        </div>
      </div>
    </header>
  );
}
