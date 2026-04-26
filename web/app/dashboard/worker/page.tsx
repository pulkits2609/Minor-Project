/* eslint-disable react/no-unescaped-entities */
"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  Clock,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface DashboardResponse {
  data?: {
    id?: string;
    status?: string;
    check_in_time?: string;
    assigned_zone?: string;
    tasks?: Array<{ id?: string; title?: string; status?: string; zone?: string; priority?: string }>;
    alerts?: Array<{ time?: string; message?: string; type?: string }>;
  };
}

export default function WorkerDashboard() {
  const [checkInTime, setCheckInTime] = useState<string | null>("--:--");
  const [currentStatus, setCurrentStatus] = useState("On Shift");
  const [assignedZone, setAssignedZone] = useState("Unknown");
  const [tasks, setTasks] = useState<
    Array<{ id: number; title: string; status: string; zone: string; priority: string }>
  >([]);
  const [alerts, setAlerts] = useState<
    Array<{ time: string; message: string; type: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await apiFetch<DashboardResponse>("/api/dashboard");
        const workerData = data.data || {};
        setCheckInTime(workerData.check_in_time || "--:--");
        setCurrentStatus(workerData.status || "On Shift");
        setAssignedZone(workerData.assigned_zone || "Unknown");
        setTasks(
          (workerData.tasks || []).map((task, idx) => ({
            id: task.id ? (task.id as unknown as number) : idx + 1,
            title: task.title || `Task ${idx + 1}`,
            status: task.status || "pending",
            zone: task.zone || "Unknown Zone",
            priority: task.priority || "medium",
          }))
        );
        setAlerts(
          (workerData.alerts || []).map((alert) => ({
            time: alert.time || "--:--",
            message: alert.message || "Alert received",
            type: alert.type || "info",
          }))
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {isLoading && (
          <div className="text-sm text-gray-400">Loading dashboard data...</div>
        )}
        {/* CRITICAL ALERT */}
        <div className="bg-red-900/30 border border-red-700 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle
            className="text-red-500 flex-shrink-0 mt-0.5"
            size={20}
          />
          <div>
            <h3 className="font-semibold text-red-400">🚨 CRITICAL ALERT</h3>
            <p className="text-sm text-red-200">
              {alerts.find((a) => a.type === "critical")?.message ||
                "No critical alerts at the moment."}
            </p>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/dashboard/worker/incidents/report">
            <div className="p-6 bg-orange-900/30 border border-orange-700 rounded-xl hover:bg-orange-900/50 cursor-pointer transition">
              <AlertCircle className="text-orange-500 mb-2" size={24} />
              <h3 className="font-semibold">Report Incident</h3>
              <p className="text-xs text-gray-400">One tap report</p>
            </div>
          </Link>

          <div className="p-6 bg-green-900/30 border border-green-700 rounded-xl hover:bg-green-900/50 cursor-pointer transition">
            <CheckCircle2 className="text-green-500 mb-2" size={24} />
            <h3 className="font-semibold">Check-in / Check-out</h3>
            <p className="text-xs text-gray-400">Shift attendance</p>
          </div>

          <Link href="/dashboard/worker/tasks">
            <div className="p-6 bg-blue-900/30 border border-blue-700 rounded-xl hover:bg-blue-900/50 cursor-pointer transition">
              <Briefcase className="text-blue-500 mb-2" size={24} />
              <h3 className="font-semibold">View Tasks</h3>
              <p className="text-xs text-gray-400">
                Today: {tasks.length} assigned
              </p>
            </div>
          </Link>

          <Link href="/dashboard/worker/alerts">
            <div className="p-6 bg-purple-900/30 border border-purple-700 rounded-xl hover:bg-purple-900/50 cursor-pointer transition">
              <Clock className="text-purple-500 mb-2" size={24} />
              <h3 className="font-semibold">My Alerts</h3>
              <p className="text-xs text-gray-400">{alerts.length} active</p>
            </div>
          </Link>
        </div>

        {/* CURRENT STATUS */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-2">Current Status</p>
            <p className="text-lg font-semibold text-green-400">✓ {currentStatus}</p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-2">Check-in Time</p>
            <p className="text-lg font-semibold">{checkInTime}</p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-2">Zone Assigned</p>
            <p className="text-lg font-semibold text-orange-400">{assignedZone}</p>
          </div>
        </div>

        {/* TASKS */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">Today's Tasks</h3>
          <div className="space-y-3">
            {tasks.length === 0 && (
              <p className="text-sm text-gray-400">No tasks assigned for today.</p>
            )}
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 bg-neutral-800 rounded-lg flex items-center justify-between hover:bg-neutral-700 transition"
              >
                <div className="flex-1">
                  <p className="font-semibold">{task.title}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {task.zone}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded ${task.priority === "high"
                          ? "bg-red-900/30 text-red-300"
                          : task.priority === "medium"
                            ? "bg-yellow-900/30 text-yellow-300"
                            : "bg-green-900/30 text-green-300"
                        }`}
                    >
                      {task.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-xs font-semibold ${task.status === "completed"
                      ? "text-green-400"
                      : task.status === "in-progress"
                        ? "text-orange-400"
                        : "text-gray-400"
                    }`}
                >
                  {task.status.replace("-", " ").toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ALERTS FEED */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">Recent Alerts</h3>
          <div className="space-y-3">
            {alerts.length === 0 && (
              <p className="text-sm text-gray-400">No recent alerts.</p>
            )}
            {alerts.map((alert, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border ${alert.type === "critical"
                    ? "bg-red-900/20 border-red-700"
                    : alert.type === "warning"
                      ? "bg-yellow-900/20 border-yellow-700"
                      : "bg-blue-900/20 border-blue-700"
                  }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xs font-semibold text-gray-400">
                    {alert.time}
                  </span>
                  <p className="text-sm">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
