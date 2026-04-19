/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { AlertTriangle, TrendingUp, Gauge, Zap } from "lucide-react";
import Link from "next/link";

export function SafetyMonitor() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-red-900/30 border border-red-700 p-4 rounded-xl">
        <p className="text-xs text-gray-400 mb-1">Gas Level</p>
        <p className="text-2xl font-bold text-red-400">73 ppm</p>
        <p className="text-xs text-red-300 mt-1">🚨 Critical</p>
      </div>

      <div className="bg-yellow-900/30 border border-yellow-700 p-4 rounded-xl">
        <p className="text-xs text-gray-400 mb-1">Temperature</p>
        <p className="text-2xl font-bold text-yellow-400">47°C</p>
        <p className="text-xs text-yellow-300 mt-1">⚠ Elevated</p>
      </div>

      <div className="bg-green-900/30 border border-green-700 p-4 rounded-xl">
        <p className="text-xs text-gray-400 mb-1">Hazard Level</p>
        <p className="text-2xl font-bold text-green-400">Medium</p>
        <p className="text-xs text-green-300 mt-1">✓ Monitored</p>
      </div>
    </div>
  );
}

export default function SafetyDashboard() {
  const incidents = [
    {
      id: 1,
      code: "INC-3412",
      title: "Gas leak report",
      severity: "critical",
      status: "pending-verification",
    },
    {
      id: 2,
      code: "INC-3407",
      title: "PPE breach",
      severity: "high",
      status: "assigned",
    },
    {
      id: 3,
      code: "INC-3398",
      title: "Equipment heat anomaly",
      severity: "medium",
      status: "escalated",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div>
          <h2 className="text-3xl font-bold mb-2">Safety Command Monitor</h2>
          <p className="text-gray-400">
            Real-time monitoring and incident review
          </p>
        </div>

        {/* CRITICAL ALERT */}
        <div className="bg-red-900/30 border border-red-700 p-5 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="text-red-500 flex-shrink-0 mt-0.5"
              size={24}
            />
            <div>
              <h3 className="font-semibold text-red-400 text-lg">
                🚨 BLINKING ALERT
              </h3>
              <p className="text-red-200 mt-1">
                Methane approaching critical threshold in Zone C (73 ppm - HIGH)
              </p>
              <button className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition">
                TRIGGER EMERGENCY ALERT
              </button>
            </div>
          </div>
        </div>

        {/* REAL-TIME MONITORING */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Gauge size={20} />
            Real Time Monitoring
          </h3>
          <SafetyMonitor />

          {/* TREND CHART */}
          <div className="mt-6 pt-6 border-t border-neutral-800">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp size={16} />
              Temperature Trend
            </h4>
            <div className="h-32 bg-neutral-800 rounded-lg p-4 flex items-end justify-around">
              {[36, 39, 41, 43, 46, 44, 47].map((temp, idx) => (
                <div
                  key={idx}
                  className="flex-1 mx-1 bg-gradient-to-t from-orange-500 to-orange-400 rounded-t relative group"
                  style={{ height: `${(temp / 50) * 100}%` }}
                >
                  <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 opacity-0 group-hover:opacity-100">
                    {temp}°C
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Trend: <span className="text-orange-400">rising</span>
            </p>
          </div>
        </div>

        {/* HAZARD INDICATOR */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="font-bold mb-4">Zone Status</h3>
            <div className="space-y-3">
              {[
                { zone: "Zone A", status: "green" },
                { zone: "Zone B", status: "yellow" },
                { zone: "Zone C", status: "red" },
                { zone: "Zone D", status: "green" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-neutral-800 rounded"
                >
                  <span className="font-semibold">{item.zone}</span>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      item.status === "red"
                        ? "bg-red-500"
                        : item.status === "yellow"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                  ></div>
                </div>
              ))}
            </div>
          </div>

          {/* SENSOR DATA */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="font-bold mb-4">Sensor Readings</h3>
            <div className="space-y-3">
              <div className="p-3 bg-neutral-800 rounded">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">
                    Gas Level (Methane)
                  </span>
                  <span className="font-bold text-red-400">73 ppm</span>
                </div>
                <div className="w-full bg-red-900 h-2 rounded mt-2"></div>
              </div>
              <div className="p-3 bg-neutral-800 rounded">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Temperature</span>
                  <span className="font-bold text-yellow-400">47°C</span>
                </div>
                <div className="w-full bg-yellow-900 h-2 rounded mt-2"></div>
              </div>
              <div className="p-3 bg-neutral-800 rounded">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Humidity</span>
                  <span className="font-bold text-blue-400">65%</span>
                </div>
                <div className="w-full bg-blue-900 h-2 rounded mt-2"></div>
              </div>
            </div>
          </div>
        </div>

        {/* INCIDENT REVIEW QUEUE */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">Incident Review Queue</h3>
          <div className="space-y-3">
            {incidents.map((incident) => (
              <Link
                key={incident.id}
                href={`/incidents/review?id=${incident.id}&role=safety`}
              >
                <div className="p-4 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition cursor-pointer border border-neutral-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-orange-400">
                          {incident.code}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded font-semibold ${
                            incident.severity === "critical"
                              ? "bg-red-900/30 text-red-300"
                              : incident.severity === "high"
                                ? "bg-orange-900/30 text-orange-300"
                                : "bg-yellow-900/30 text-yellow-300"
                          }`}
                        >
                          {incident.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="font-semibold">{incident.title}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        Status: {incident.status.replace("-", " ")}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
