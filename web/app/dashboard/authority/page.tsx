/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Globe,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Network,
  Bell,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function AuthorityDashboard() {
  const [selectedMine, setSelectedMine] = useState(null);

  const mineStats = [
    {
      name: "Coal Mine A",
      status: "online",
      incidents: 2,
      productivity: "93.1%",
      hazardLevel: "HIGH",
    },
    {
      name: "Coal Mine B",
      status: "online",
      incidents: 0,
      productivity: "88.5%",
      hazardLevel: "MEDIUM",
    },
    {
      name: "Coal Mine C",
      status: "online",
      incidents: 1,
      productivity: "91.2%",
      hazardLevel: "MEDIUM",
    },
  ];

  const overrides = [
    { id: 1, request: "INC-3412", origin: "Safety", decision: "APPROVE" },
    { id: 2, request: "USR 2201", origin: "Admin", decision: "REJECT" },
    { id: 3, request: "TSK-1019", origin: "Super", decision: "ESCALATE" },
  ];

  const alerts = [
    { type: "critical", title: "Methane surge detected", time: "Just now" },
    { type: "warning", title: "Staff shortage warning", time: "15 min ago" },
    { type: "info", title: "Audit complete", time: "1 hour ago" },
  ];

  const productivity = [72, 75, 77, 81, 86, 93];
  const incidents = [31, 29, 27, 24, 22, 19];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div>
          <h2 className="text-3xl font-bold mb-2">Central Command Center</h2>
          <p className="text-gray-400">
            Mining Authority - Full System Visibility & Control
          </p>
        </div>

        {/* GLOBAL STATS */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Mines Online</p>
            <p className="text-2xl font-bold text-blue-400">12</p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Critical Alerts</p>
            <p className="text-2xl font-bold text-red-400">2</p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Active Investigations</p>
            <p className="text-2xl font-bold text-orange-400">31</p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Overall Risk</p>
            <p className="text-2xl font-bold text-red-500">HIGH</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* PRODUCTIVITY */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="font-bold mb-4">Productivity</h3>
            <p className="text-3xl font-bold text-green-400 mb-4">93.1%</p>
            <div className="h-24 flex items-end justify-around gap-1">
              {productivity.map((value, idx) => (
                <div
                  key={idx}
                  className="flex-1 bg-green-500/50 hover:bg-green-500 rounded-t transition relative group"
                  style={{ height: `${(value / 100) * 100}%` }}
                >
                  <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100">
                    {value}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* INCIDENTS TREND */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="font-bold mb-4">Incidents</h3>
            <p className="text-3xl font-bold text-red-400 mb-4">19 active</p>
            <div className="h-24 flex items-end justify-around gap-1">
              {incidents.map((value, idx) => (
                <div
                  key={idx}
                  className="flex-1 bg-red-500/50 hover:bg-red-500 rounded-t transition relative group"
                  style={{ height: `${(value / 35) * 100}%` }}
                >
                  <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* COMPLIANCE */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="font-bold mb-4">Compliance</h3>
            <p className="text-3xl font-bold text-green-400 mb-4">91%</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Safety Protocols</span>
                <span className="text-green-400">✓</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">RBAC Enforced</span>
                <span className="text-green-400">✓</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Audit Ready</span>
                <span className="text-yellow-400">⚠</span>
              </div>
            </div>
          </div>
        </div>

        {/* ZONE HEATMAP */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">Zone Risk Assessment</h3>
          <div className="grid grid-cols-4 gap-4">
            {[
              { zone: "Zone A", risk: 4, color: "from-green-600 to-green-400" },
              {
                zone: "Zone B",
                risk: 6,
                color: "from-yellow-600 to-yellow-400",
              },
              { zone: "Zone C", risk: 8, color: "from-red-600 to-red-400" },
              { zone: "Zone D", risk: 3, color: "from-green-600 to-green-400" },
            ].map((item, idx) => (
              <div key={idx} className="bg-neutral-800 rounded-lg p-4">
                <h4 className="font-semibold mb-2">{item.zone}</h4>
                <div
                  className={`h-32 bg-gradient-to-t ${item.color} rounded-lg relative flex items-end justify-center pb-2`}
                >
                  <span className="text-sm font-bold text-white">
                    {item.risk}/10
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* GLOBAL ALERTS */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Bell size={20} />
              Global Alerts
            </h3>
            <div className="space-y-3">
              {alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${
                    alert.type === "critical"
                      ? "bg-red-900/20 border-red-700"
                      : alert.type === "warning"
                        ? "bg-yellow-900/20 border-yellow-700"
                        : "bg-blue-900/20 border-blue-700"
                  }`}
                >
                  <p className="font-semibold text-sm">{alert.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{alert.time}</p>
                </div>
              ))}
            </div>
          </div>

          {/* GLOBAL OVERRIDE PANEL */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">Global Override Panel</h3>
            <div className="space-y-3">
              {overrides.map((override) => (
                <div
                  key={override.id}
                  className="p-3 bg-neutral-800 rounded-lg flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{override.request}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      From: {override.origin}
                    </p>
                  </div>
                  <button
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      override.decision === "APPROVE"
                        ? "bg-green-900/30 text-green-400"
                        : override.decision === "REJECT"
                          ? "bg-red-900/30 text-red-400"
                          : "bg-orange-900/30 text-orange-400"
                    }`}
                  >
                    {override.decision}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MINE OPERATIONS */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Network size={20} />
            Mine Operations
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-neutral-800">
                  <th className="text-left py-3 px-3">Mine</th>
                  <th className="text-left py-3 px-3">Status</th>
                  <th className="text-left py-3 px-3">Incidents</th>
                  <th className="text-left py-3 px-3">Productivity</th>
                  <th className="text-left py-3 px-3">Risk Level</th>
                  <th className="text-center py-3 px-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {mineStats.map((mine, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-neutral-800 hover:bg-neutral-800/50 transition"
                  >
                    <td className="py-3 px-3 font-semibold">{mine.name}</td>
                    <td className="py-3 px-3">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                      <span className="text-green-400">{mine.status}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          mine.incidents === 0
                            ? "bg-green-900/30 text-green-400"
                            : "bg-orange-900/30 text-orange-400"
                        }`}
                      >
                        {mine.incidents}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold">
                      {mine.productivity}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          mine.hazardLevel === "HIGH"
                            ? "bg-red-900/30 text-red-400"
                            : "bg-yellow-900/30 text-yellow-400"
                        }`}
                      >
                        {mine.hazardLevel}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Link href={`/mine/${idx}?role=authority`}>
                        <button className="text-orange-400 hover:text-orange-300 text-xs font-semibold">
                          View Details
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
