"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function Sidebar() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "worker";

  const menuMap: Record<string, Array<{ name: string; path: string }>> = {
    worker: [
      { name: "Dashboard", path: "/dashboard/worker" },
      { name: "Report Incident", path: "/incidents/report" },
      { name: "Check In/Out", path: "/attendance" },
      { name: "Tasks", path: "/tasks" },
      { name: "Alerts", path: "/alerts" },
    ],
    supervisor: [
      { name: "Dashboard", path: "/dashboard/supervisor" },
      { name: "Team", path: "/team" },
      { name: "Tasks", path: "/tasks" },
      { name: "Incidents", path: "/incidents" },
      { name: "Alerts", path: "/alerts" },
    ],
    safety: [
      { name: "Dashboard", path: "/dashboard/safety" },
      { name: "Safety Monitoring", path: "/monitoring" },
      { name: "Alerts", path: "/alerts" },
      { name: "Incident Review", path: "/incidents/review" },
      { name: "Settings", path: "/settings" },
    ],
    admin: [
      { name: "Dashboard", path: "/dashboard/admin" },
      { name: "Users", path: "/users" },
      { name: "Roles", path: "/roles" },
      { name: "Logs", path: "/logs" },
      { name: "Settings", path: "/settings" },
    ],
    authority: [
      { name: "Dashboard", path: "/dashboard/authority" },
      { name: "Analytics", path: "/analytics" },
      { name: "Reports", path: "/reports" },
      { name: "User Control", path: "/users" },
      { name: "System Control", path: "/system" },
      { name: "Global Alerts", path: "/alerts" },
    ],
  };

  const menu = menuMap[role] || menuMap.worker;

  return (
    <div className="w-64 bg-neutral-900 p-4 border-r border-neutral-800 overflow-y-auto h-screen">
      <Link href="/">
        <h2 className="text-xl font-bold mb-6 hover:text-orange-400 transition">
          MineOps
        </h2>
      </Link>

      <div className="mb-4 p-2 bg-neutral-800 rounded-lg text-xs text-gray-400">
        Role: <span className="capitalize text-orange-400">{role}</span>
      </div>

      <div className="space-y-2">
        {menu.map((item) => (
          <Link
            key={item.name}
            href={`${item.path}?role=${role}`}
            className="block p-3 rounded-lg hover:bg-neutral-800 transition text-sm"
          >
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
