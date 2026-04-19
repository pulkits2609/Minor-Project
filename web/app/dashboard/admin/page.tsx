/* eslint-disable @typescript-eslint/no-explicit-any */
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

export default function AdminDashboard() {
  const [showCreateUser, setShowCreateUser] = useState(false);

  const users = [
    {
      id: 1,
      name: "R Das",
      email: "rdas@coalmine.com",
      role: "Worker",
      status: "Active",
    },
    {
      id: 2,
      name: "M Khan",
      email: "mkhan@coalmine.com",
      role: "Supervisor",
      status: "Active",
    },
    {
      id: 3,
      name: "N Roy",
      email: "nroy@coalmine.com",
      role: "Safety Officer",
      status: "Suspended",
    },
    {
      id: 4,
      name: "A Sharma",
      email: "asharma@coalmine.com",
      role: "Administrator",
      status: "Active",
    },
  ];

  const logs = [
    { time: "10:08", user: "R Das", action: "Login", status: "success" },
    {
      time: "10:12",
      user: "M Khan",
      action: "Role request pending",
      status: "pending",
    },
    {
      time: "10:17",
      user: "System",
      action: "Escalation blocked",
      status: "warning",
    },
    {
      time: "09:45",
      user: "N Roy",
      action: "Account suspended",
      status: "alert",
    },
  ];

  const roleHierarchy = [
    { from: "Worker", to: "Supervisor", permission: "Request" },
    { from: "Supervisor", to: "Safety", permission: "Authority" },
    { from: "UI Escalation", to: "Block", permission: "Blocked" },
  ];

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
            <p className="text-2xl font-bold text-blue-400">512</p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Active Sessions</p>
            <p className="text-2xl font-bold text-green-400">143</p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Pending Requests</p>
            <p className="text-2xl font-bold text-orange-400">9</p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">System Health</p>
            <p className="text-2xl font-bold text-green-400">99.8%</p>
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
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            user.status === "Active"
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
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          log.status === "success"
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
          <Link href="/logs?role=admin">
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
