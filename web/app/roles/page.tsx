"use client";
export const dynamic = 'force-dynamic';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Shield, Lock, Eye, Edit } from "lucide-react";
import { Suspense } from "react";

export function RolesContent() {

  const roles = [
    {
      name: "Worker",
      level: 1,
      permissions: [
        "Report Incidents",
        "View Tasks",
        "Check In/Out",
        "View Alerts",
      ],
      canEdit: false,
    },
    {
      name: "Supervisor",
      level: 2,
      permissions: [
        "Manage Team",
        "Assign Tasks",
        "Review Incidents",
        "Monitor Alerts",
      ],
      canEdit: false,
    },
    {
      name: "Safety Officer",
      level: 3,
      permissions: [
        "Safety Monitoring",
        "Incident Review",
        "Hazard Assessment",
        "System Oversight",
      ],
      canEdit: false,
    },
    {
      name: "Administrator",
      level: 4,
      permissions: [
        "User Management",
        "System Configuration",
        "Logs & Audit",
        "Role Management",
      ],
      canEdit: false,
    },
    {
      name: "Authority",
      level: 5,
      permissions: [
        "Full System Control",
        "Global Override",
        "All Permissions",
        "Policy Override",
      ],
      canEdit: false,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div>
          <h2 className="text-3xl font-bold mb-2">Role Management</h2>
          <p className="text-gray-400">
            Define and manage user roles and permissions
          </p>
        </div>

        {/* ROLE HIERARCHY */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-lg mb-4">Role Hierarchy</h3>
          <div className="flex items-center gap-2 overflow-x-auto">
            {roles.map((r, idx) => (
              <div key={idx} className="flex items-center">
                <div className="px-4 py-3 bg-orange-600/20 border border-orange-600 rounded text-center min-w-fit">
                  <p className="font-bold text-sm">{r.name}</p>
                  <p className="text-xs text-gray-400">Level {r.level}</p>
                </div>
                {idx < roles.length - 1 && (
                  <div className="px-3 text-gray-400">â†’</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ROLES GRID */}
        <div className="grid grid-cols-2 gap-6">
          {roles.map((roleItem, idx) => (
            <div
              key={idx}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Shield size={20} className="text-orange-400" />
                    {roleItem.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Level {roleItem.level}
                  </p>
                </div>
                {roleItem.canEdit && (
                  <button className="p-2 hover:bg-neutral-800 rounded transition">
                    <Edit size={16} />
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-400 mb-3">
                  Permissions:
                </p>
                {roleItem.permissions.map((perm, pidx) => (
                  <div key={pidx} className="flex items-center gap-2 text-sm">
                    <Eye size={14} className="text-green-400" />
                    <span>{perm}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-800">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Lock size={12} />
                  <span>RBAC Enforced - No UI Escalation</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PERMISSION MATRIX */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-6">Permission Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-neutral-800">
                <tr className="text-gray-400">
                  <th className="text-left py-3 px-3">Feature</th>
                  <th className="text-center py-3 px-3">Worker</th>
                  <th className="text-center py-3 px-3">Supervisor</th>
                  <th className="text-center py-3 px-3">Safety</th>
                  <th className="text-center py-3 px-3">Admin</th>
                  <th className="text-center py-3 px-3">Authority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {[
                  {
                    feature: "Report Incidents",
                    perms: [true, true, true, true, true],
                  },
                  {
                    feature: "View Tasks",
                    perms: [true, true, true, true, true],
                  },
                  {
                    feature: "Manage Team",
                    perms: [false, true, true, true, true],
                  },
                  {
                    feature: "Review Incidents",
                    perms: [false, true, true, true, true],
                  },
                  {
                    feature: "System Logs",
                    perms: [false, false, false, true, true],
                  },
                  {
                    feature: "User Management",
                    perms: [false, false, false, true, true],
                  },
                  {
                    feature: "Global Override",
                    perms: [false, false, false, false, true],
                  },
                ].map((item, idx) => (
                  <tr key={idx} className="hover:bg-neutral-800/50">
                    <td className="py-3 px-3 font-semibold">{item.feature}</td>
                    {item.perms.map((perm, pidx) => (
                      <td key={pidx} className="py-3 px-3 text-center">
                        <span
                          className={
                            perm ? "text-green-400 font-bold" : "text-gray-500"
                          }
                        >
                          {perm ? "âœ“" : "âœ—"}
                        </span>
                      </td>
                    ))}
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

export default function RolesPage() {
  return (
    <Suspense fallback={<div>Loading roles...</div>}>
      <RolesContent />
    </Suspense>
  );
}