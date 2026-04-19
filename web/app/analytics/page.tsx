/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { BarChart3, TrendingUp } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function AnalyticsPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "worker";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div>
          <h2 className="text-3xl font-bold mb-2">Analytics Dashboard</h2>
          <p className="text-gray-400">Advanced insights and data analysis</p>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl">
            <h3 className="text-sm text-gray-400 mb-2">
              Total Incidents (30d)
            </h3>
            <p className="text-3xl font-bold mb-2">127</p>
            <p className="text-sm text-red-400">↑ 12% from last month</p>
          </div>
          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl">
            <h3 className="text-sm text-gray-400 mb-2">Safety Score</h3>
            <p className="text-3xl font-bold mb-2">87.5%</p>
            <p className="text-sm text-green-400">↑ 2.1% improvement</p>
          </div>
          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl">
            <h3 className="text-sm text-gray-400 mb-2">Avg Response Time</h3>
            <p className="text-3xl font-bold mb-2">8.2 min</p>
            <p className="text-sm text-green-400">↓ 1.3 min faster</p>
          </div>
          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl">
            <h3 className="text-sm text-gray-400 mb-2">
              Incident Resolution Rate
            </h3>
            <p className="text-3xl font-bold mb-2">94%</p>
            <p className="text-sm text-green-400">↑ 3% increase</p>
          </div>
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <BarChart3 size={20} />
              Incidents Over Time
            </h3>
            <div className="h-48 flex items-end justify-around gap-2">
              {[45, 52, 48, 61, 55, 67, 71, 64, 58, 63, 68, 72].map(
                (value, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-red-500/50 hover:bg-red-500 rounded-t transition cursor-pointer"
                    style={{ height: `${(value / 80) * 100}%` }}
                    title={`Week ${idx + 1}: ${value} incidents`}
                  />
                ),
              )}
            </div>
            <p className="text-xs text-gray-400 mt-4 text-center">
              Last 12 weeks trend
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <TrendingUp size={20} />
              Productivity Index
            </h3>
            <div className="h-48 flex items-end justify-around gap-2">
              {[72, 75, 77, 81, 86, 93, 89, 91, 88, 90, 92, 93].map(
                (value, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-green-500/50 hover:bg-green-500 rounded-t transition cursor-pointer"
                    style={{ height: `${(value / 100) * 100}%` }}
                    title={`Week ${idx + 1}: ${value}%`}
                  />
                ),
              )}
            </div>
            <p className="text-xs text-gray-400 mt-4 text-center">
              Last 12 weeks trend
            </p>
          </div>
        </div>

        {/* INCIDENT BREAKDOWN */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">
              Incident Severity Distribution
            </h3>
            <div className="space-y-4">
              {[
                { label: "Critical", count: 8, color: "red", percentage: 6 },
                { label: "High", count: 34, color: "orange", percentage: 27 },
                { label: "Medium", count: 56, color: "yellow", percentage: 44 },
                { label: "Low", count: 29, color: "green", percentage: 23 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{item.label}</span>
                    <span className="text-sm">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-${item.color}-500`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">Top Risk Zones</h3>
            <div className="space-y-3">
              {[
                { zone: "Zone C", incidents: 34, risk: "HIGH" },
                { zone: "Zone B", incidents: 28, risk: "MEDIUM" },
                { zone: "Zone A", incidents: 18, risk: "MEDIUM" },
                { zone: "Zone D", incidents: 12, risk: "LOW" },
              ].map((item) => (
                <div
                  key={item.zone}
                  className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{item.zone}</p>
                    <p className="text-xs text-gray-400">
                      {item.incidents} incidents
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      item.risk === "HIGH"
                        ? "bg-red-900/30 text-red-400"
                        : item.risk === "MEDIUM"
                          ? "bg-yellow-900/30 text-yellow-400"
                          : "bg-green-900/30 text-green-400"
                    }`}
                  >
                    {item.risk}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
