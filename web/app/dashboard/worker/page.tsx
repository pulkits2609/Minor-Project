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
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function WorkerDashboard() {
  const [checkInTime, setCheckInTime] = useState<string | null>("08:15 AM");
  const [activeTab, setActiveTab] = useState("overview");

  const tasks = [
    {
      id: 1,
      title: "Zone C Patrol",
      status: "pending",
      zone: "Zone C",
      priority: "high",
    },
    {
      id: 2,
      title: "Equipment Check",
      status: "in-progress",
      zone: "Zone A",
      priority: "medium",
    },
    {
      id: 3,
      title: "Shift Briefing",
      status: "completed",
      zone: "Main",
      priority: "medium",
    },
  ];

  const alerts = [
    { time: "08:15", message: "Helmet compliance reminder", type: "warning" },
    { time: "07:40", message: "Safety briefing updated", type: "info" },
    {
      time: "06:30",
      message: "Critical: Zone C ventilation check due in 20 minutes",
      type: "critical",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* CRITICAL ALERT */}
        <div className="bg-red-900/30 border border-red-700 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle
            className="text-red-500 flex-shrink-0 mt-0.5"
            size={20}
          />
          <div>
            <h3 className="font-semibold text-red-400">🚨 CRITICAL ALERT</h3>
            <p className="text-sm text-red-200">
              Zone C ventilation check due in 20 minutes. Report immediately if
              issues detected.
            </p>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/incidents/report?role=worker">
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

          <Link href="/tasks?role=worker">
            <div className="p-6 bg-blue-900/30 border border-blue-700 rounded-xl hover:bg-blue-900/50 cursor-pointer transition">
              <Briefcase className="text-blue-500 mb-2" size={24} />
              <h3 className="font-semibold">View Tasks</h3>
              <p className="text-xs text-gray-400">
                Today: {tasks.length} assigned
              </p>
            </div>
          </Link>

          <Link href="/alerts?role=worker">
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
            <p className="text-lg font-semibold text-green-400">✓ On Shift</p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-2">Check-in Time</p>
            <p className="text-lg font-semibold">{checkInTime}</p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-2">Zone Assigned</p>
            <p className="text-lg font-semibold text-orange-400">Zone C</p>
          </div>
        </div>

        {/* TASKS */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">Today's Tasks</h3>
          <div className="space-y-3">
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
                      className={`px-2 py-0.5 rounded ${
                        task.priority === "high"
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
                  className={`text-xs font-semibold ${
                    task.status === "completed"
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
            {alerts.map((alert, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border ${
                  alert.type === "critical"
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
