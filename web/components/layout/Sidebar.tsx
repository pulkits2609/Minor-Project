"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  AlertTriangle,
  CheckSquare,
  Bell,
  Users,
  ShieldCheck,
  Settings,
  FileText,
  BarChart3,
  UserCog,
  Globe,
  ClipboardList,
  Activity,
  LogOut,
  HardHat,
} from "lucide-react";

const menuMap: Record<string, Array<{ name: string; path: string; icon: React.ReactNode }>> = {
  worker: [
    { name: "Dashboard", path: "/dashboard/worker", icon: <LayoutDashboard size={16} /> },
    { name: "Report Incident", path: "/dashboard/worker/incidents/report", icon: <AlertTriangle size={16} /> },
    { name: "Check In / Out", path: "/dashboard/worker/attendance", icon: <CheckSquare size={16} /> },
    { name: "My Tasks", path: "/dashboard/worker/tasks", icon: <ClipboardList size={16} /> },
    { name: "Alerts", path: "/dashboard/worker/alerts", icon: <Bell size={16} /> },
  ],
  supervisor: [
    { name: "Dashboard", path: "/dashboard/supervisor", icon: <LayoutDashboard size={16} /> },
    { name: "Team", path: "/dashboard/supervisor/team", icon: <Users size={16} /> },
    { name: "Tasks", path: "/dashboard/supervisor/tasks", icon: <ClipboardList size={16} /> },
    { name: "Incidents", path: "/dashboard/supervisor/incidents", icon: <AlertTriangle size={16} /> },
    { name: "Alerts", path: "/dashboard/supervisor/alerts", icon: <Bell size={16} /> },
  ],
  safety: [
    { name: "Dashboard", path: "/dashboard/safety", icon: <LayoutDashboard size={16} /> },
    { name: "Safety Monitoring", path: "/dashboard/safety/monitoring", icon: <Activity size={16} /> },
    { name: "Alerts", path: "/dashboard/safety/alerts", icon: <Bell size={16} /> },
    { name: "Incident Review", path: "/dashboard/safety/incidents/review", icon: <ShieldCheck size={16} /> },
  ],
  admin: [
    { name: "Dashboard", path: "/dashboard/admin", icon: <LayoutDashboard size={16} /> },
    { name: "Users", path: "/dashboard/admin/users", icon: <Users size={16} /> },
    { name: "Roles", path: "/dashboard/admin/roles", icon: <UserCog size={16} /> },
    { name: "Logs", path: "/dashboard/admin/logs", icon: <FileText size={16} /> },
  ],
  authority: [
    { name: "Dashboard", path: "/dashboard/authority", icon: <LayoutDashboard size={16} /> },
    { name: "Analytics", path: "/dashboard/authority/analytics", icon: <BarChart3 size={16} /> },
    { name: "Reports", path: "/dashboard/authority/reports", icon: <FileText size={16} /> },
    { name: "User Control", path: "/dashboard/authority/users", icon: <Users size={16} /> },
    { name: "Global Alerts", path: "/dashboard/authority/alerts", icon: <Globe size={16} /> },
  ],
};

const roleLabels: Record<string, string> = {
  worker: "Mine Worker",
  supervisor: "Supervisor",
  safety: "Safety Officer",
  admin: "Administrator",
  authority: "Authority",
};

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pathParts = pathname.split("/").filter(Boolean);
  const roleFromPath = pathParts[0] === "dashboard" && pathParts[1] ? pathParts[1] : null;
  const role = roleFromPath || searchParams.get("role") || "worker";
  const menu = menuMap[role] || menuMap.worker;

  return (
    <div
      className="flex flex-col h-screen bg-neutral-950 border-r border-white/[0.06]"
      style={{ width: "var(--sidebar-width, 260px)", minWidth: "var(--sidebar-width, 260px)" }}
    >
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shadow-lg group-hover:shadow-orange-500/40 transition-shadow">
            <HardHat size={16} className="text-white" />
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight">MineOps</span>
            <div className="text-[10px] text-neutral-500 font-medium tracking-wider uppercase leading-none mt-0.5">
              Safety System
            </div>
          </div>
        </Link>
      </div>

      {/* Role badge */}
      <div className="px-5 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
          <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse-glow" />
          <span className="text-xs font-semibold text-orange-400 tracking-wide">
            {roleLabels[role] || role}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-3 text-[10px] font-semibold text-neutral-600 uppercase tracking-widest">
          Navigation
        </p>
        {(() => {
          // Pick the single best match: the item whose path is the longest prefix of the current pathname
          const activeItem = menu.reduce<(typeof menu)[0] | null>((best, item) => {
            const matches = pathname === item.path || pathname.startsWith(item.path + "/");
            if (!matches) return best;
            if (!best) return item;
            return item.path.length > best.path.length ? item : best;
          }, null);

          return menu.map((item) => {
          const isActive = item === activeItem;
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`nav-item ${isActive ? "active" : ""}`}
            >
              <span className={isActive ? "text-orange-400" : "text-neutral-500"}>
                {item.icon}
              </span>
              {item.name}
            </Link>
          );
        });
        })()}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/[0.06] space-y-1">
        <Link href="/login" className="nav-item text-red-400/60 hover:text-red-400 hover:bg-red-500/5">
          <LogOut size={16} />
          Sign Out
        </Link>
      </div>
    </div>
  );
}
