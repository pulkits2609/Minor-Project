/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Users, Clock, MapPin, CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function TeamPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "worker";

  const teamMembers = [
    {
      id: 1,
      name: "R. Das",
      status: "Active",
      shift: "Day",
      zone: "Zone C",
      tasks: 3,
      attendance: "Present",
    },
    {
      id: 2,
      name: "M. Khan",
      status: "Break",
      shift: "Day",
      zone: "Zone B",
      tasks: 2,
      attendance: "Present",
    },
    {
      id: 3,
      name: "P. Kumar",
      status: "Delayed",
      shift: "Day",
      zone: "Zone C",
      tasks: 2,
      attendance: "Late",
    },
    {
      id: 4,
      name: "A. Roy",
      status: "Active",
      shift: "Day",
      zone: "Zone A",
      tasks: 3,
      attendance: "Present",
    },
    {
      id: 5,
      name: "S. Singh",
      status: "Off",
      shift: "Night",
      zone: "Zone D",
      tasks: 0,
      attendance: "Absent",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div>
          <h2 className="text-3xl font-bold mb-2">Team Management</h2>
          <p className="text-gray-400">Monitor and manage team members</p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Team Size</p>
            <p className="text-2xl font-bold text-blue-400">
              {teamMembers.length}
            </p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Currently Active</p>
            <p className="text-2xl font-bold text-green-400">
              {teamMembers.filter((m) => m.status === "Active").length}
            </p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">On Break</p>
            <p className="text-2xl font-bold text-orange-400">
              {teamMembers.filter((m) => m.status === "Break").length}
            </p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Attendance Rate</p>
            <p className="text-2xl font-bold text-green-400">80%</p>
          </div>
        </div>

        {/* TEAM TABLE */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-800">
                <tr className="text-gray-400 text-sm">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Shift</th>
                  <th className="text-left py-3 px-4">Zone</th>
                  <th className="text-center py-3 px-4">Tasks</th>
                  <th className="text-left py-3 px-4">Attendance</th>
                  <th className="text-center py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {teamMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-neutral-800/50 transition"
                  >
                    <td className="py-4 px-4 font-semibold">{member.name}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                          member.status === "Active"
                            ? "bg-green-900/30 text-green-400"
                            : member.status === "Break"
                              ? "bg-yellow-900/30 text-yellow-400"
                              : "bg-gray-900/30 text-gray-400"
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm">{member.shift}</td>
                    <td className="py-4 px-4">
                      <span className="flex items-center gap-1 text-sm">
                        <MapPin size={14} className="text-orange-400" />
                        {member.zone}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center font-semibold">
                      {member.tasks}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                          member.attendance === "Present"
                            ? "bg-green-900/30 text-green-400"
                            : member.attendance === "Late"
                              ? "bg-yellow-900/30 text-yellow-400"
                              : "bg-red-900/30 text-red-400"
                        }`}
                      >
                        {member.attendance}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
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
      </div>
    </DashboardLayout>
  );
}
