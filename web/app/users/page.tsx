"use client";
export const dynamic = 'force-dynamic';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Plus, Edit2, Trash2, Shield } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

export function UsersContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "worker";

  const [showCreate, setShowCreate] = useState(false);
  const [filterRole, setFilterRole] = useState("all");

  const users = [
    {
      id: 1,
      name: "R Das",
      email: "rdas@coalmine.com",
      role: "Worker",
      status: "Active",
      lastActive: "Just now",
    },
    {
      id: 2,
      name: "M Khan",
      email: "mkhan@coalmine.com",
      role: "Supervisor",
      status: "Active",
      lastActive: "5 min ago",
    },
    {
      id: 3,
      name: "N Roy",
      email: "nroy@coalmine.com",
      role: "Safety Officer",
      status: "Suspended",
      lastActive: "2 days ago",
    },
    {
      id: 4,
      name: "A Sharma",
      email: "asharma@coalmine.com",
      role: "Administrator",
      status: "Active",
      lastActive: "Just now",
    },
    {
      id: 5,
      name: "P Kumar",
      email: "pkumar@coalmine.com",
      role: "Worker",
      status: "Active",
      lastActive: "30 min ago",
    },
  ];

  const filteredUsers =
    filterRole === "all"
      ? users
      : users.filter((u) => u.role.toLowerCase() === filterRole.toLowerCase());

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">User Management</h2>
            <p className="text-gray-400">Manage system users and permissions</p>
          </div>
          {(role === "admin" || role === "authority") && (
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition flex items-center gap-2"
            >
              <Plus size={20} />
              Create User
            </button>
          )}
        </div>

        {/* CREATE FORM */}
        {showCreate && (role === "admin" || role === "authority") && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-lg mb-4">Add New User</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                placeholder="Full Name"
                className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg"
              />
              <input
                placeholder="Email"
                type="email"
                className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg"
              />
              <input
                placeholder="Employee ID"
                className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg"
              />
              <select className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg">
                <option>Select Role</option>
                <option>Worker</option>
                <option>Supervisor</option>
                <option>Safety Officer</option>
                <option>Administrator</option>
              </select>
            </div>
            <button className="w-full py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition">
              Create User
            </button>
          </div>
        )}

        {/* FILTER */}
        <div className="flex gap-2">
          {[
            "all",
            "Worker",
            "Supervisor",
            "Safety Officer",
            "Administrator",
          ].map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                filterRole === r
                  ? "bg-orange-600 text-white"
                  : "bg-neutral-800 text-gray-400 hover:bg-neutral-700"
              }`}
            >
              {r === "all" ? "All" : r}
            </button>
          ))}
        </div>

        {/* USERS TABLE */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-800">
                <tr className="text-gray-400 text-sm">
                  <th className="text-left py-3 px-4">User</th>
                  <th className="text-left py-3 px-4">Role</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Last Active</th>
                  <th className="text-center py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-neutral-800/50 transition"
                  >
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="flex items-center gap-1 text-sm font-semibold">
                        <Shield size={14} className="text-orange-400" />
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                          user.status === "Active"
                            ? "bg-green-900/30 text-green-400"
                            : "bg-red-900/30 text-red-400"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-400">
                      {user.lastActive}
                    </td>
                    <td className="py-4 px-4 text-center flex justify-center gap-2">
                      {(role === "admin" || role === "authority") && (
                        <>
                          <button className="p-2 hover:bg-neutral-700 rounded transition">
                            <Edit2 size={16} />
                          </button>
                          <button className="p-2 hover:bg-neutral-700 rounded transition text-red-400">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Total Users</p>
            <p className="text-2xl font-bold text-blue-400">{users.length}</p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Active Users</p>
            <p className="text-2xl font-bold text-green-400">
              {users.filter((u) => u.status === "Active").length}
            </p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Suspended</p>
            <p className="text-2xl font-bold text-red-400">
              {users.filter((u) => u.status === "Suspended").length}
            </p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Last Updated</p>
            <p className="text-lg font-bold">Today</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function UsersPage() {
  return (
    <Suspense fallback={<div>Loading users...</div>}>
      <UsersContent />
    </Suspense>
  );
}