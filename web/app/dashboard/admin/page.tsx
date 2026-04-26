"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Users,
  Shield,
  Settings,
  LogsIcon,
  Plus,
  Edit2,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useEffect } from "react";
import { apiFetch } from "@/lib/api";

interface DashboardResponse {
  data?: {
    total_users?: number;
    total_incidents?: number;
    system_alerts?: Array<Record<string, unknown>>;
    reports?: Array<Record<string, unknown>>;
  };
}

export default function AdminDashboard() {
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSessions: 0,
    pendingRequests: 0,
    systemHealth: "0%",
  });
  const [users, setUsers] = useState<
    Array<{ id: number; name: string; email: string; role: string; status: string }>
  >([]);
  const [logs, setLogs] = useState<
    Array<{ time: string; user: string; action: string; status: string }>
  >([]);
  const [roleHierarchy, setRoleHierarchy] = useState<
    Array<{ from: string; to: string; permission: string }>
  >([]);
  useEffect(() => {
    const load = async () => {
      const data = await apiFetch<DashboardResponse>("/api/dashboard").catch(
        () => null
      );
      const admin = data?.data;
      if (!admin) return;
      setStats({
        totalUsers: admin.total_users || 0,
        activeSessions: admin.total_users || 0,
        pendingRequests: admin.system_alerts?.length || 0,
        systemHealth: admin.total_incidents === 0 ? "100%" : "92%",
      });
      setUsers(
        (admin.reports || []).map((report, idx) => ({
          id: idx + 1,
          name: String(report.name || report.user || `User ${idx + 1}`),
          email: String(report.email || `user${idx + 1}@example.com`),
          role: String(report.role || "User"),
          status: String(report.status || "Active"),
        }))
      );
      setLogs(
        (admin.system_alerts || []).map((alert, idx) => ({
          time: String(alert.time || "--:--"),
          user: String(alert.user || "System"),
          action: String(alert.message || alert.action || `Alert ${idx + 1}`),
          status: String(alert.status || "warning"),
        }))
      );
      setRoleHierarchy(
        (admin.reports || []).slice(0, 3).map((report) => ({
          from: String(report.from || "Worker"),
          to: String(report.to || "Supervisor"),
          permission: String(report.permission || "Policy"),
        }))
      );
    };
    void load();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div>
          <h2 className="text-3xl font-bold mb-2">
            Administration Control Panel
          </h2>
          <p className="text-gray-400">
            User management, roles, and system settings
          </p>
        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Total Users</p>
            <p className="text-2xl font-bold text-blue-400">{stats.totalUsers}</p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Active Sessions</p>
            <p className="text-2xl font-bold text-green-400">
              {stats.activeSessions}
            </p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Pending Requests</p>
            <p className="text-2xl font-bold text-orange-400">
              {stats.pendingRequests}
            </p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">System Health</p>
            <p className="text-2xl font-bold text-green-400">
              {stats.systemHealth}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* USER MANAGEMENT */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Users size={20} />
                User Management
              </h3>
              <button
                onClick={() => setShowCreateUser(!showCreateUser)}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 rounded text-sm font-semibold flex items-center gap-1 transition"
              >
                <Plus size={16} /> Create User
              </button>
            </div>

            {showCreateUser && (
              <div className="mb-4 p-4 bg-neutral-800 rounded-lg space-y-3">
                <input
                  placeholder="Email"
                  className="w-full p-2 bg-neutral-700 rounded text-sm"
                />
                <input
                  placeholder="Role"
                  className="w-full p-2 bg-neutral-700 rounded text-sm"
                />
                <button className="w-full py-2 bg-orange-600 hover:bg-orange-700 rounded text-sm font-semibold transition">
                  Add User
                </button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-neutral-800">
                    <th className="text-left py-2 px-2">User</th>
                    <th className="text-left py-2 px-2">Role</th>
                    <th className="text-left py-2 px-2">Status</th>
                    <th className="text-center py-2 px-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 && (
                    <tr>
                      <td className="py-3 px-2 text-gray-400" colSpan={4}>
                        No user records from API.
                      </td>
                    </tr>
                  )}
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-neutral-800 hover:bg-neutral-800/50 transition"
                    >
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-sm font-semibold text-orange-400">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${user.status === "Active"
                              ? "bg-green-900/30 text-green-400"
                              : "bg-red-900/30 text-red-400"
                            }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 flex justify-center gap-2">
                        <button className="p-1 hover:bg-neutral-700 rounded transition">
                          <Edit2 size={14} />
                        </button>
                        <button className="p-1 hover:bg-neutral-700 rounded transition">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ROLE CONTROLS */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Shield size={20} />
              Role Controls
            </h3>
            <div className="space-y-3">
              {roleHierarchy.length === 0 && (
                <p className="text-sm text-gray-400">No role policy data available.</p>
              )}
              {roleHierarchy.map((item, idx) => (
                <div key={idx} className="p-3 bg-neutral-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-orange-900/30 text-orange-400 rounded text-sm font-semibold">
                      {item.from}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded text-sm font-semibold">
                      {item.to}
                    </span>
                    <span className="ml-auto text-xs font-semibold text-green-400">
                      {item.permission}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-neutral-800 rounded-lg">
              <h4 className="font-semibold mb-3">Security Settings</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">MFA Status:</span>
                  <span className="text-green-400 font-semibold">ON</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Session Timeout:</span>
                  <span className="font-semibold">15 min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Audit Export:</span>
                  <span className="font-semibold">Daily</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SYSTEM LOGS */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <LogsIcon size={20} />
            System Logs
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-neutral-800">
                  <th className="text-left py-2 px-2">Time</th>
                  <th className="text-left py-2 px-2">User</th>
                  <th className="text-left py-2 px-2">Action</th>
                  <th className="text-left py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 && (
                  <tr>
                    <td className="py-3 px-2 text-gray-400" colSpan={4}>
                      No system logs available.
                    </td>
                  </tr>
                )}
                {logs.map((log, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-neutral-800 hover:bg-neutral-800/50 transition"
                  >
                    <td className="py-3 px-2 text-gray-400">{log.time}</td>
                    <td className="py-3 px-2 font-semibold">{log.user}</td>
                    <td className="py-3 px-2">{log.action}</td>
                    <td className="py-3 px-2">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${log.status === "success"
                            ? "bg-green-900/30 text-green-400"
                            : log.status === "warning"
                              ? "bg-yellow-900/30 text-yellow-400"
                              : log.status === "pending"
                                ? "bg-blue-900/30 text-blue-400"
                                : "bg-red-900/30 text-red-400"
                          }`}
                      >
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link href="/dashboard/admin/logs">
            <button className="mt-4 text-sm text-orange-400 hover:text-orange-300 transition">
              View all logs →
            </button>
          </Link>
        </div>

        {/* SETTINGS */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Settings size={20} />
            System Settings
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-neutral-800 rounded-lg">
              <h4 className="font-semibold mb-2">Database</h4>
              <p className="text-xs text-gray-400 mb-2">
                Status: <span className="text-green-400">Connected</span>
              </p>
              <button className="text-xs text-orange-400 hover:text-orange-300">
                Configure →
              </button>
            </div>
            <div className="p-4 bg-neutral-800 rounded-lg">
              <h4 className="font-semibold mb-2">API</h4>
              <p className="text-xs text-gray-400 mb-2">
                Version: <span className="text-white">v2.1</span>
              </p>
              <button className="text-xs text-orange-400 hover:text-orange-300">
                Manage →
              </button>
            </div>
            <div className="p-4 bg-neutral-800 rounded-lg">
              <h4 className="font-semibold mb-2">Notifications</h4>
              <p className="text-xs text-gray-400 mb-2">
                Status: <span className="text-green-400">Active</span>
              </p>
              <button className="text-xs text-orange-400 hover:text-orange-300">
                Settings →
              </button>
            </div>
            <div className="p-4 bg-neutral-800 rounded-lg">
              <h4 className="font-semibold mb-2">Backup</h4>
              <p className="text-xs text-gray-400 mb-2">
                Last: <span className="text-white">2 hours ago</span>
              </p>
              <button className="text-xs text-orange-400 hover:text-orange-300">
                Run now →
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
