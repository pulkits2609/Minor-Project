"use client";
import { Suspense } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Bell, AlertTriangle, Info } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

type AlertType = "emergency" | "critical" | "warning" | "alert" | "info";
interface AlertRow {
  id: string;
  type: string;
  message: string;
  severity?: string;
  is_read: boolean;
  created_at: string;
}
interface AlertsResponse {
  status: string;
  data: AlertRow[];
}

function AlertsContent() {
  const [filterType, setFilterType] = useState("all");
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setError(null);
      setIsLoading(true);
      try {
        const res = await apiFetch<AlertsResponse>("/api/alerts");
        setAlerts(res.data || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load alerts");
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const type = alert.type as AlertType;
      const matchesType = filterType === "all" || type === filterType;
      return matchesType && !alert.is_read;
    });
  }, [alerts, filterType]);

  const markRead = async (alertId: string) => {
    await apiFetch("/api/alerts/read", {
      method: "PATCH",
      body: JSON.stringify({ alert_id: alertId }),
    });
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, is_read: true } : a)),
    );
  };

  const alertCounts = useMemo(() => {
    return {
      critical: alerts.filter((a) => a.type === "critical").length,
      warning: alerts.filter((a) => a.type === "warning").length,
      alert: alerts.filter((a) => a.type === "alert").length,
      info: alerts.filter((a) => a.type === "info").length,
    };
  }, [alerts]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-bold mb-2">Alerts & Notifications</h2>
        <p className="text-gray-400">
          System alerts and important notifications
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-sm text-red-300">
          {error}
        </div>
      )}

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
          <p className="text-2xl font-bold text-blue-400">{alertCounts.info}</p>
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
        {isLoading && (
          <div className="text-sm text-gray-400">Loading alerts...</div>
        )}
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
                    {alert.type.toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-300 mb-3">{alert.message}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>{new Date(alert.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => markRead(alert.id)}
                  className={`px-4 py-2 rounded font-semibold text-sm transition ${
                    alert.type === "critical"
                      ? "bg-red-600/30 hover:bg-red-600/50 text-red-300"
                      : alert.type === "warning"
                        ? "bg-orange-600/30 hover:bg-orange-600/50 text-orange-300"
                        : "bg-neutral-700 hover:bg-neutral-600 text-gray-300"
                  }`}
                >
                  Mark read
                </button>
                <button
                  onClick={() => markRead(alert.id)}
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
  );
}

export default function AlertsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div>Loading alerts...</div>}>
        <AlertsContent />
      </Suspense>
    </DashboardLayout>
  );
}
