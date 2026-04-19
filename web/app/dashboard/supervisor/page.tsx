/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Users, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";

export default function SupervisorDashboard() {
  const teamMembers = [
    {
      name: "R. Das",
      status: "Active",
      task: "Belt Inspection",
      attendance: "Present",
    },
    {
      name: "M. Khan",
      status: "Break",
      task: "Conveyor Check",
      attendance: "Present",
    },
    {
      name: "P. Kumar",
      status: "Delayed",
      task: "Zone C Patrol",
      attendance: "Late",
    },
    {
      name: "A. Roy",
      status: "Active",
      task: "Drill Prep",
      attendance: "Present",
    },
  ];

  const tasks = [
    { id: 1, title: "Ventilation audit", status: "pending" },
    { id: 2, title: "Zone B sensor install", status: "pending" },
    { id: 3, title: "Pump check", status: "in-progress" },
    { id: 4, title: "Attendance reconciliation", status: "in-progress" },
    { id: 5, title: "Shift handover", status: "completed" },
    { id: 6, title: "PPE checklist", status: "completed" },
  ];

  const incidents = [
    {
      id: 1,
      title: "Slippage near Shaft 2",
      severity: "critical",
      team: "Team A",
    },
    { id: 2, title: "PPE violation Team C", severity: "open", team: "Team C" },
    {
      id: 3,
      title: "Ventilation warning",
      severity: "resolved",
      team: "Team B",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div>
          <h2 className="text-3xl font-bold mb-2">Supervisor Control Deck</h2>
          <p className="text-gray-400">
            Manage your team, tasks, and incidents
          </p>
        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Team Members</p>
            <p className="text-2xl font-bold text-orange-400">
              {teamMembers.length}
            </p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Active Tasks</p>
            <p className="text-2xl font-bold text-blue-400">3</p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Open Incidents</p>
            <p className="text-2xl font-bold text-red-400">2</p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Attendance Today</p>
            <p className="text-2xl font-bold text-green-400">28/32</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* TEAM TABLE */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users size={20} />
              Team Overview
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-neutral-800">
                    <th className="text-left py-2 px-2">Name</th>
                    <th className="text-left py-2 px-2">Status</th>
                    <th className="text-left py-2 px-2">Task</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((member, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-neutral-800 hover:bg-neutral-800/50 transition"
                    >
                      <td className="py-3 px-2 font-semibold">{member.name}</td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            member.status === "Active"
                              ? "bg-green-900/30 text-green-400"
                              : member.status === "Break"
                                ? "bg-yellow-900/30 text-yellow-400"
                                : "bg-red-900/30 text-red-400"
                          }`}
                        >
                          {member.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-gray-400">{member.task}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* INCIDENTS LIST */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <AlertCircle size={20} />
              Team Incidents
            </h3>
            <div className="space-y-3">
              {incidents.map((incident) => (
                <Link key={incident.id} href={`/incidents?role=supervisor`}>
                  <div
                    className="p-3 rounded-lg border hover:bg-neutral-800 transition cursor-pointer"
                    style={{
                      borderColor:
                        incident.severity === "critical"
                          ? "#dc2626"
                          : incident.severity === "open"
                            ? "#f59e0b"
                            : "#10b981",
                      backgroundColor:
                        incident.severity === "critical"
                          ? "rgba(220, 38, 38, 0.1)"
                          : incident.severity === "open"
                            ? "rgba(245, 158, 11, 0.1)"
                            : "rgba(16, 185, 129, 0.1)",
                    }}
                  >
                    <p className="font-semibold text-sm">{incident.title}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {incident.team} • {incident.severity.toUpperCase()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* TASK MANAGEMENT */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">Task Management (Kanban)</h3>
          <div className="grid grid-cols-3 gap-4">
            {/* PENDING */}
            <div className="bg-neutral-800 rounded-lg p-4">
              <h4 className="font-semibold mb-3 text-red-400">Pending</h4>
              <div className="space-y-2">
                {tasks
                  .filter((t) => t.status === "pending")
                  .map((task) => (
                    <div
                      key={task.id}
                      className="bg-neutral-700 p-3 rounded hover:bg-neutral-600 transition cursor-pointer"
                    >
                      <p className="text-sm">{task.title}</p>
                    </div>
                  ))}
              </div>
            </div>

            {/* IN PROGRESS */}
            <div className="bg-neutral-800 rounded-lg p-4">
              <h4 className="font-semibold mb-3 text-orange-400">
                In Progress
              </h4>
              <div className="space-y-2">
                {tasks
                  .filter((t) => t.status === "in-progress")
                  .map((task) => (
                    <div
                      key={task.id}
                      className="bg-neutral-700 p-3 rounded hover:bg-neutral-600 transition cursor-pointer"
                    >
                      <p className="text-sm">{task.title}</p>
                    </div>
                  ))}
              </div>
            </div>

            {/* COMPLETED */}
            <div className="bg-neutral-800 rounded-lg p-4">
              <h4 className="font-semibold mb-3 text-green-400">Completed</h4>
              <div className="space-y-2">
                {tasks
                  .filter((t) => t.status === "completed")
                  .map((task) => (
                    <div
                      key={task.id}
                      className="bg-neutral-700 p-3 rounded hover:bg-neutral-600 transition cursor-pointer opacity-70"
                    >
                      <p className="text-sm line-through">{task.title}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
