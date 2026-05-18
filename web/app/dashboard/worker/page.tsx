/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  Clock,
  MapPin,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Activity,
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

const priorityConfig = {
  high:   { label: "HIGH",   bar: "bg-red-500",    badge: "bg-red-500/15 text-red-400 border-red-500/20" },
  medium: { label: "MED",    bar: "bg-yellow-500", badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20" },
  low:    { label: "LOW",    bar: "bg-green-500",  badge: "bg-green-500/15 text-green-400 border-green-500/20" },
};

const alertConfig = {
  critical: { bg: "bg-red-500/8 border-red-500/25",    dot: "bg-red-400", label: "CRITICAL" },
  warning:  { bg: "bg-yellow-500/8 border-yellow-500/25", dot: "bg-yellow-400", label: "WARNING" },
  info:     { bg: "bg-blue-500/8 border-blue-500/25",  dot: "bg-blue-400",  label: "INFO" },
};

export default function WorkerDashboard() {
  const [checkInTime, setCheckInTime] = useState<string | null>("--:--");
  const [currentStatus, setCurrentStatus] = useState("On Shift");
  const [assignedZone, setAssignedZone] = useState("Unknown");
  const [tasks, setTasks] = useState<Array<{ id: number; title: string; status: string; zone: string; priority: string }>>([]);
  const [alerts, setAlerts] = useState<Array<{ time: string; message: string; type: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await apiFetch<DashboardResponse>("/api/dashboard");
        const d = data.data || {};
        setCheckInTime(d.check_in_time || "--:--");
        setCurrentStatus(d.status || "On Shift");
        setAssignedZone(d.assigned_zone || "Unknown");
        setTasks((d.tasks || []).map((task, idx) => ({
          id: task.id ? (task.id as unknown as number) : idx + 1,
          title: task.title || `Task ${idx + 1}`,
          status: task.status || "pending",
          zone: task.zone || "Unknown Zone",
          priority: task.priority || "medium",
        })));
        setAlerts((d.alerts || []).map((alert) => ({
          time: alert.time || "--:--",
          message: alert.message || "Alert received",
          type: alert.type || "info",
        })));
      } finally {
        setIsLoading(false);
      }
    };
    void loadDashboard();
  }, []);

  const criticalAlert = alerts.find((a) => a.type === "critical");

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl">
        {/* ── Page header ── */}
        <div className="flex items-start justify-between animate-fade-in-up">
          <div>
            <h2 className="text-2xl font-black text-white mb-1">Worker Dashboard</h2>
            <p className="text-sm text-neutral-500">Your shift overview and active assignments</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-semibold text-green-400">Active Shift</span>
          </div>
        </div>

        {/* ── Loading skeleton ── */}
        {isLoading && (
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-20 skeleton rounded-xl" />)}
          </div>
        )}

        {/* ── Critical Alert Banner ── */}
        {!isLoading && (
          <div className={`rounded-xl border p-4 flex items-start gap-4 animate-fade-in-up ${criticalAlert ? "bg-red-500/8 border-red-500/30 animate-pulse-glow-red" : "bg-neutral-900 border-white/[0.06]"}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${criticalAlert ? "bg-red-500/15" : "bg-neutral-800"}`}>
              <AlertTriangle size={18} className={criticalAlert ? "text-red-400" : "text-neutral-500"} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: criticalAlert ? "#f87171" : "#737373" }}>
                {criticalAlert ? "🚨 Critical Alert Active" : "System Status"}
              </p>
              <p className="text-sm text-neutral-300">
                {criticalAlert?.message || "All systems normal. No critical alerts at this time."}
              </p>
            </div>
          </div>
        )}

        {/* ── Status cards ── */}
        {!isLoading && (
          <div className="grid grid-cols-3 gap-4 animate-fade-in-up">
            {[
              { label: "Current Status", value: currentStatus, icon: <Activity size={18} />, color: "text-green-400", dot: "bg-green-400" },
              { label: "Check-in Time", value: checkInTime || "--:--", icon: <Clock size={18} />, color: "text-blue-400", dot: "bg-blue-400" },
              { label: "Zone Assigned", value: assignedZone, icon: <MapPin size={18} />, color: "text-orange-400", dot: "bg-orange-400" },
            ].map((s) => (
              <div key={s.label} className="stat-card group">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{s.label}</span>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${s.color} bg-white/[0.05]`}>
                    {s.icon}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                  <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Quick Actions ── */}
        {!isLoading && (
          <div className="grid grid-cols-2 gap-4 animate-fade-in-up">
            <Link href="/dashboard/worker/incidents/report">
              <div className="group p-5 rounded-xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-orange-600/5 hover:border-orange-500/40 hover:from-orange-500/15 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <AlertCircle size={20} className="text-orange-400" />
                  </div>
                  <ArrowRight size={16} className="text-orange-500/40 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-bold text-white mb-1">Report Incident</h3>
                <p className="text-xs text-neutral-500">One-tap emergency reporting</p>
              </div>
            </Link>

            <div className="group p-5 rounded-xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-green-600/5 hover:border-green-500/40 transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 size={20} className="text-green-400" />
                </div>
                <ArrowRight size={16} className="text-green-500/40 group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-bold text-white mb-1">Check-in / Check-out</h3>
              <p className="text-xs text-neutral-500">Shift attendance tracking</p>
            </div>

            <Link href="/dashboard/worker/tasks">
              <div className="group p-5 rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-blue-600/5 hover:border-blue-500/40 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Briefcase size={20} className="text-blue-400" />
                  </div>
                  <ArrowRight size={16} className="text-blue-500/40 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-bold text-white mb-1">View My Tasks</h3>
                <p className="text-xs text-neutral-500">Today: {tasks.length} assigned</p>
              </div>
            </Link>

            <Link href="/dashboard/worker/alerts">
              <div className="group p-5 rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-purple-600/5 hover:border-purple-500/40 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp size={20} className="text-purple-400" />
                  </div>
                  <ArrowRight size={16} className="text-purple-500/40 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-bold text-white mb-1">My Alerts</h3>
                <p className="text-xs text-neutral-500">{alerts.length} active notifications</p>
              </div>
            </Link>
          </div>
        )}

        {/* ── Tasks & Alerts row ── */}
        {!isLoading && (
          <div className="grid grid-cols-2 gap-6 animate-fade-in-up">
            {/* Tasks */}
            <div className="rounded-xl border border-white/[0.06] bg-neutral-900/60 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <h3 className="font-bold text-sm text-white">Today's Tasks</h3>
                <span className="text-xs text-neutral-600 font-medium">{tasks.length} total</span>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {tasks.length === 0 && (
                  <p className="text-xs text-neutral-600 px-5 py-6 text-center">No tasks assigned for today.</p>
                )}
                {tasks.map((task) => {
                  const pConfig = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.medium;
                  return (
                    <div key={task.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                      <div className={`w-0.5 h-10 rounded-full flex-shrink-0 ${pConfig.bar}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{task.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <MapPin size={10} className="text-neutral-600" />
                          <span className="text-[11px] text-neutral-500">{task.zone}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${pConfig.badge}`}>
                        {pConfig.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Alerts feed */}
            <div className="rounded-xl border border-white/[0.06] bg-neutral-900/60 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <h3 className="font-bold text-sm text-white">Recent Alerts</h3>
                <span className="text-xs text-neutral-600 font-medium">{alerts.length} active</span>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {alerts.length === 0 && (
                  <p className="text-xs text-neutral-600 px-5 py-6 text-center">No recent alerts.</p>
                )}
                {alerts.map((alert, idx) => {
                  const aC = alertConfig[alert.type as keyof typeof alertConfig] || alertConfig.info;
                  return (
                    <div key={idx} className={`flex items-start gap-3 px-5 py-3.5 border-l-2 ${aC.bg}`} style={{ borderLeftColor: `var(--tw-border-opacity)` }}>
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${aC.dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-neutral-400 mb-0.5">{alert.time}</p>
                        <p className="text-sm text-neutral-300">{alert.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
