"use client";
export const dynamic = 'force-dynamic';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Search } from "lucide-react";
import { Suspense, useState } from "react";

export function LogsContent() {

  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const logs = [
    {
      id: 1,
      time: "14:32",
      user: "R. Das",
      action: "Login",
      type: "auth",
      status: "success",
    },
    {
      id: 2,
      time: "14:35",
      user: "R. Das",
      action: "Incident Report Created",
      type: "incident",
      status: "success",
    },
    {
      id: 3,
      time: "14:45",
      user: "System",
      action: "Emergency Alert Triggered",
      type: "alert",
      status: "success",
    },
    {
      id: 4,
      time: "15:00",
      user: "M. Khan",
      action: "Role Change Request",
      type: "user",
      status: "pending",
    },
    {
      id: 5,
      time: "15:15",
      user: "Safety Officer",
      action: "Incident Approved",
      type: "incident",
      status: "success",
    },
    {
      id: 6,
      time: "16:00",
      user: "Admin",
      action: "User Suspended",
      type: "user",
      status: "success",
    },
    {
      id: 7,
      time: "16:30",
      user: "System",
      action: "Database Backup",
      type: "system",
      status: "success",
    },
  ];

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || log.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div>
          <h2 className="text-3xl font-bold mb-2">System Logs</h2>
          <p className="text-gray-400">Audit trail and activity logs</p>
        </div>

        {/* SEARCH & FILTER */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div className="flex gap-2">
            {["all", "auth", "incident", "user", "alert", "system"].map(
              (type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                    filterType === type
                      ? "bg-orange-600 text-white"
                      : "bg-neutral-800 text-gray-400 hover:bg-neutral-700"
                  }`}
                >
                  {type.toUpperCase()}
                </button>
              ),
            )}
          </div>
        </div>

        {/* LOGS TABLE */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-800">
                <tr className="text-gray-400 text-sm">
                  <th className="text-left py-3 px-4">Time</th>
                  <th className="text-left py-3 px-4">User</th>
                  <th className="text-left py-3 px-4">Action</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-neutral-800/50 transition"
                  >
                    <td className="py-4 px-4 text-sm font-mono text-gray-400">
                      {log.time}
                    </td>
                    <td className="py-4 px-4 font-semibold">{log.user}</td>
                    <td className="py-4 px-4">{log.action}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          log.type === "auth"
                            ? "bg-blue-900/30 text-blue-400"
                            : log.type === "incident"
                              ? "bg-red-900/30 text-red-400"
                              : log.type === "user"
                                ? "bg-purple-900/30 text-purple-400"
                                : log.type === "alert"
                                  ? "bg-orange-900/30 text-orange-400"
                                  : "bg-green-900/30 text-green-400"
                        }`}
                      >
                        {log.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          log.status === "success"
                            ? "bg-green-900/30 text-green-400"
                            : "bg-yellow-900/30 text-yellow-400"
                        }`}
                      >
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button className="text-orange-400 hover:text-orange-300 text-sm font-semibold">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Showing {filteredLogs.length} of {logs.length} logs
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm font-semibold transition">
              â† Previous
            </button>
            <button className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm font-semibold transition">
              Next â†’
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function LogsPage() {
  return (
    <Suspense fallback={<div>Loading logs...</div>}>
      <LogsContent />
    </Suspense>
  );
}
