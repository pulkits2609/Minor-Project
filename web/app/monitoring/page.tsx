/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Gauge, TrendingUp, AlertTriangle } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function MonitoringPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "worker";

  const zones = [
    { zone: "Zone A", gasLevel: 35, temp: 42, status: "normal" },
    { zone: "Zone B", gasLevel: 52, temp: 45, status: "warning" },
    { zone: "Zone C", gasLevel: 73, temp: 47, status: "critical" },
    { zone: "Zone D", gasLevel: 28, temp: 40, status: "normal" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div>
          <h2 className="text-3xl font-bold mb-2">Safety Monitoring</h2>
          <p className="text-gray-400">
            Real-time monitoring and hazard detection
          </p>
        </div>

        {/* GLOBAL METRICS */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Avg Gas Level</p>
            <p className="text-2xl font-bold text-orange-400">47 ppm</p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Avg Temperature</p>
            <p className="text-2xl font-bold text-red-400">43.5°C</p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Critical Zones</p>
            <p className="text-2xl font-bold text-red-500">1</p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">System Status</p>
            <p className="text-2xl font-bold text-orange-400">Warning</p>
          </div>
        </div>

        {/* ZONE MONITORING */}
        <div className="grid grid-cols-2 gap-6">
          {zones.map((item, idx) => (
            <div
              key={idx}
              className={`border rounded-xl p-6 ${
                item.status === "critical"
                  ? "bg-red-900/20 border-red-700"
                  : item.status === "warning"
                    ? "bg-yellow-900/20 border-yellow-700"
                    : "bg-green-900/20 border-green-700"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold">{item.zone}</h3>
                <span
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    item.status === "critical"
                      ? "bg-red-600 text-white"
                      : item.status === "warning"
                        ? "bg-yellow-600 text-white"
                        : "bg-green-600 text-white"
                  }`}
                >
                  {item.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold">
                      Gas Level (Methane)
                    </span>
                    <span className="text-lg font-bold text-orange-400">
                      {item.gasLevel} ppm
                    </span>
                  </div>
                  <div
                    className={`h-3 rounded-full overflow-hidden ${
                      item.status === "critical"
                        ? "bg-red-900/30"
                        : item.status === "warning"
                          ? "bg-yellow-900/30"
                          : "bg-green-900/30"
                    }`}
                  >
                    <div
                      className={`h-full ${
                        item.status === "critical"
                          ? "bg-red-500"
                          : item.status === "warning"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                      style={{ width: `${(item.gasLevel / 100) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Normal: &lt;30 | Warning: 30-60 | Critical: &gt;60
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold">Temperature</span>
                    <span className="text-lg font-bold text-orange-400">
                      {item.temp}°C
                    </span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden bg-neutral-800">
                    <div
                      className="h-full bg-orange-500"
                      style={{ width: `${(item.temp / 50) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Normal: &lt;40 | Elevated: 40-45 | High: &gt;45
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SENSOR DETAILS */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Gauge size={20} />
            Sensor Details
          </h3>

          <div className="grid grid-cols-4 gap-4">
            {[
              {
                name: "Humidity Sensor",
                zone: "Zone A",
                value: "65%",
                status: "ok",
              },
              {
                name: "Vibration Monitor",
                zone: "Zone B",
                value: "2.3 Hz",
                status: "ok",
              },
              {
                name: "Gas Detector",
                zone: "Zone C",
                value: "73 ppm",
                status: "critical",
              },
              {
                name: "Temp Sensor",
                zone: "Zone D",
                value: "40°C",
                status: "ok",
              },
            ].map((sensor, idx) => (
              <div key={idx} className="p-4 bg-neutral-800 rounded-lg">
                <p className="font-semibold text-sm mb-1">{sensor.name}</p>
                <p className="text-xs text-gray-400 mb-3">{sensor.zone}</p>
                <p className="text-lg font-bold mb-2">{sensor.value}</p>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    sensor.status === "critical"
                      ? "bg-red-900/30 text-red-400"
                      : sensor.status === "warning"
                        ? "bg-yellow-900/30 text-yellow-400"
                        : "bg-green-900/30 text-green-400"
                  }`}
                >
                  {sensor.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
