/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { BarChart3, Download, Filter, Calendar } from "lucide-react";
import { useState, useSearchParams } from "next/navigation";

export default function ReportsPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "worker";

  const [reportType, setReportType] = useState("incidents");
  const [dateRange, setDateRange] = useState("month");

  const reportTypes = [
    { id: "incidents", label: "Incidents", color: "red" },
    { id: "productivity", label: "Productivity", color: "green" },
    { id: "safety", label: "Safety Compliance", color: "orange" },
    { id: "attendance", label: "Attendance", color: "blue" },
  ];

  const metrics = {
    incidents: { current: 19, previous: 22, change: -13.6 },
    productivity: { current: 93.1, previous: 88.5, change: 5.2 },
    safety: { current: 91, previous: 85, change: 7.1 },
    attendance: { current: 88, previous: 85, change: 3.5 },
  };

  const chartData = [
    { month: "Jan", value: 28 },
    { month: "Feb", value: 31 },
    { month: "Mar", value: 27 },
    { month: "Apr", value: 19 },
  ];

  const canExport = ["admin", "authority"].includes(role);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Reports & Analytics</h2>
            <p className="text-gray-400">Generate and review system reports</p>
          </div>
          {canExport && (
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition flex items-center gap-2">
              <Download size={20} />
              Export Report
            </button>
          )}
        </div>

        {/* FILTERS */}
        <div className="flex gap-4">
          <div className="flex gap-2">
            {reportTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setReportType(type.id)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                  reportType === type.id
                    ? "bg-orange-600 text-white"
                    : "bg-neutral-800 text-gray-400 hover:bg-neutral-700"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 ml-auto">
            {["week", "month", "quarter", "year"].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                  dateRange === range
                    ? "bg-orange-600 text-white"
                    : "bg-neutral-800 text-gray-400 hover:bg-neutral-700"
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* KEY METRICS */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-sm text-gray-400 mb-8">Current Metric</h3>
            <p className="text-5xl font-bold mb-4">
              {reportType === "incidents"
                ? metrics.incidents.current
                : reportType === "productivity"
                  ? metrics.productivity.current
                  : reportType === "safety"
                    ? metrics.safety.current
                    : metrics.attendance.current}
              {reportType !== "incidents" && "%"}
            </p>
            <p
              className={`text-sm font-semibold ${
                reportType === "incidents"
                  ? metrics.incidents.change < 0
                    ? "text-green-400"
                    : "text-red-400"
                  : "text-green-400"
              }`}
            >
              {reportType === "incidents"
                ? `${metrics.incidents.change}% from last month`
                : `+${
                    reportType === "productivity"
                      ? metrics.productivity.change
                      : reportType === "safety"
                        ? metrics.safety.change
                        : metrics.attendance.change
                  }% from last month`}
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-sm text-gray-400 mb-2">Trend Chart</h3>
            <div className="h-48 flex items-end justify-around gap-2 mt-6">
              {chartData.map((data, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1">
                  <div
                    className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t transition hover:from-orange-600 hover:to-orange-500 cursor-pointer"
                    style={{ height: `${(data.value / 50) * 100}%` }}
                  />
                  <p className="text-xs text-gray-400 mt-2">{data.month}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DETAILED REPORT */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <BarChart3 size={20} />
            Detailed {reportTypes.find((t) => t.id === reportType)?.label}{" "}
            Report
          </h3>

          {reportType === "incidents" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">
                    Critical Incidents
                  </p>
                  <p className="text-2xl font-bold text-red-400">2</p>
                </div>
                <div className="p-4 bg-orange-900/20 border border-orange-700 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">High Priority</p>
                  <p className="text-2xl font-bold text-orange-400">5</p>
                </div>
                <div className="p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Medium Priority</p>
                  <p className="text-2xl font-bold text-yellow-400">12</p>
                </div>
              </div>
              <table className="w-full text-sm mt-6">
                <thead className="border-b border-neutral-700">
                  <tr className="text-gray-400">
                    <th className="text-left py-2">Zone</th>
                    <th className="text-center py-2">Incidents</th>
                    <th className="text-center py-2">Avg Resolution Time</th>
                    <th className="text-center py-2">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {["Zone A", "Zone B", "Zone C", "Zone D"].map((zone, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-neutral-800 hover:bg-neutral-800/50"
                    >
                      <td className="py-3 font-semibold">{zone}</td>
                      <td className="py-3 text-center">
                        {Math.floor(Math.random() * 10) + 1}
                      </td>
                      <td className="py-3 text-center">
                        {Math.floor(Math.random() * 8) + 2} hours
                      </td>
                      <td className="py-3 text-center">
                        <span className="text-green-400">↓ Improving</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {reportType !== "incidents" && (
            <div className="text-center py-8 text-gray-400">
              <p>
                Detailed {reportTypes.find((t) => t.id === reportType)?.label}{" "}
                report data would be displayed here
              </p>
            </div>
          )}
        </div>

        {/* ACCESS CONTROL NOTE */}
        {!canExport && (
          <div className="bg-blue-900/20 border border-blue-700 p-4 rounded-xl">
            <p className="text-sm text-blue-300">
              📊 Note: Full export and advanced analytics are available for
              Admin and Authority roles only.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
