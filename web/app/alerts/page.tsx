/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Bell, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function AlertsPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "worker";

  const [filterType, setFilterType] = useState("all");
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([]);

  const alerts = [
    {
      id: 1,
      type: "critical",
      title: "CRITICAL: Methane level critical in Zone C",
      message:
        "Gas concentration has reached dangerous levels. Immediate evacuation may be required.",
      zone: "Zone C",
      time: "Just now",
      action: "View Details",
    },
    {
      id: 2,
      type: "warning",
      title: "Equipment malfunction detected",
      message:
        "Ventilation system in Zone B showing unusual temperature readings.",
      zone: "Zone B",
      time: "5 minutes ago",
      action: "Investigate",
    },
    {
      id: 3,
      type: "alert",
      title: "Staff shortage warning",
      message: "Team C is operating below minimum staffing requirements.",
      zone: "Team C",
      time: "15 minutes ago",
      action: "Assign Personnel",
    },
    {
      id: 4,
      type: "info",
      title: "Maintenance window scheduled",
      message: "Zone A will be under maintenance from 18:00 to 20:00 today.",
      zone: "Zone A",
      time: "2 hours ago",
      action: "Acknowledge",
    },
    {
      id: 5,
      type: "info",
      title: "Shift briefing completed",
      message: "All safety briefings for the day shift have been completed.",
      zone: "Main",
      time: "4 hours ago",
      action: "View Report",
    },
  ];

  const filteredAlerts = alerts.filter((alert) => {
    const matchesType = filterType === "all" || alert.type === filterType;
    return matchesType && !dismissedAlerts.includes(alert.id);
  });

  const dismissAlert = (id: number) => {
    setDismissedAlerts([...dismissedAlerts, id]);
  };

  const alertCounts = {
    critical: alerts.filter((a) => a.type === "critical").length,
    warning: alerts.filter((a) => a.type === "warning").length,
    alert: alerts.filter((a) => a.type === "alert").length,
    info: alerts.filter((a) => a.type === "info").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div>
          <h2 className="text-3xl font-bold mb-2">Alerts & Notifications</h2>
          <p className="text-gray-400">
            System alerts and important notifications
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-red-900/20 border border-red-700 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Critical</p>
            <p className="text-2xl font-bold text-red-400">
              {alertCounts.critical}
            </p>
          </div>
          <div className="p-4 bg-orange-900/20 border border-orange-700 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Warnings</p>
            <p className="text-2xl font-bold text-orange-400">
              {alertCounts.warning}
            </p>
          </div>
          <div className="p-4 bg-yellow-900/20 border border-yellow-700 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Alerts</p>
            <p className="text-2xl font-bold text-yellow-400">
              {alertCounts.alert}
            </p>
          </div>
          <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Info</p>
            <p className="text-2xl font-bold text-blue-400">
              {alertCounts.info}
            </p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex gap-2">
          {["all", "critical", "warning", "alert", "info"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                filterType === type
                  ? "bg-orange-600 text-white"
                  : "bg-neutral-800 text-gray-400 hover:bg-neutral-700"
              }`}
            >
              {type.replace("-", " ").toUpperCase()}
            </button>
          ))}
        </div>

        {/* ALERTS LIST */}
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-5 rounded-xl border ${
                alert.type === "critical"
                  ? "bg-red-900/20 border-red-700"
                  : alert.type === "warning"
                    ? "bg-orange-900/20 border-orange-700"
                    : alert.type === "alert"
                      ? "bg-yellow-900/20 border-yellow-700"
                      : "bg-blue-900/20 border-blue-700"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={`mt-1 ${
                      alert.type === "critical"
                        ? "text-red-400"
                        : alert.type === "warning"
                          ? "text-orange-400"
                          : alert.type === "alert"
                            ? "text-yellow-400"
                            : "text-blue-400"
                    }`}
                  >
                    {alert.type === "critical" ? (
                      <AlertTriangle size={20} />
                    ) : alert.type === "info" ? (
                      <Info size={20} />
                    ) : (
                      <Bell size={20} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">
                      {alert.title}
                    </h3>
                    <p className="text-sm text-gray-300 mb-3">
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>
                        Zone:{" "}
                        <span className="text-white font-semibold">
                          {alert.zone}
                        </span>
                      </span>
                      <span>{alert.time}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    className={`px-4 py-2 rounded font-semibold text-sm transition ${
                      alert.type === "critical"
                        ? "bg-red-600/30 hover:bg-red-600/50 text-red-300"
                        : alert.type === "warning"
                          ? "bg-orange-600/30 hover:bg-orange-600/50 text-orange-300"
                          : "bg-neutral-700 hover:bg-neutral-600 text-gray-300"
                    }`}
                  >
                    {alert.action}
                  </button>
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="px-3 py-2 bg-neutral-700 hover:bg-neutral-600 rounded text-gray-300 transition"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAlerts.length === 0 && (
          <div className="text-center py-12">
            <Bell size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">No alerts to display</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
