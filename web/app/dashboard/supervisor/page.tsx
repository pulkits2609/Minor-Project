"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Users, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface DashboardResponse {
  data?: {
    stats?: {
      total_team?: number;
      active_tasks?: number;
      open_incidents?: number;
      attendance?: string;
    };
    team_members?: Array<{ name?: string; status?: string; task?: string }>;
    tasks?: Array<{ id?: number; title?: string; status?: string }>;
    incidents?: Array<{ id?: number; title?: string; severity?: string; team?: string }>;
  };
}

export default function SupervisorDashboard() {
  const [stats, setStats] = useState({
    teamMembers: 0,
    activeTasks: 0,
    openIncidents: 0,
    attendanceToday: "0/0",
  });
  const [teamMembers, setTeamMembers] = useState<
    Array<{ name: string; status: string; task: string }>
  >([]);
  const [tasks, setTasks] = useState<Array<{ id: number; title: string; status: string }>>(
    []
  );
  const [incidents, setIncidents] = useState<
    Array<{ id: number; title: string; severity: string; team: string }>
  >([]);
  useEffect(() => {
    const load = async () => {
      const data = await apiFetch<DashboardResponse>("/api/dashboard").catch(
        () => null
      );
      const supervisor = data?.data;
      if (!supervisor) return;
      setStats({
        teamMembers: supervisor.stats?.total_team || 0,
        activeTasks: supervisor.stats?.active_tasks || 0,
        openIncidents: supervisor.stats?.open_incidents || 0,
        attendanceToday: supervisor.stats?.attendance || "0/0",
      });
      setTeamMembers(
        (supervisor.team_members || []).map((member, idx) => ({
          name: member.name || `Member ${idx + 1}`,
          status: member.status || "Active",
          task: member.task || "Assigned Task",
        }))
      );
      setTasks(
        (supervisor.tasks || []).map((task, idx) => ({
          id: task.id || idx + 1,
          title: task.title || `Task ${idx + 1}`,
          status: task.status || "pending",
        }))
      );
      setIncidents(
        (supervisor.incidents || []).map((incident, idx) => ({
          id: incident.id || idx + 1,
          title: incident.title || `Incident ${idx + 1}`,
          severity: incident.severity || "open",
          team: incident.team || "Team",
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
              {stats.teamMembers}
            </p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Active Tasks</p>
            <p className="text-2xl font-bold text-blue-400">{stats.activeTasks}</p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Open Incidents</p>
            <p className="text-2xl font-bold text-red-400">{stats.openIncidents}</p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Attendance Today</p>
            <p className="text-2xl font-bold text-green-400">
              {stats.attendanceToday}
            </p>
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
                  {teamMembers.length === 0 && (
                    <tr>
                      <td className="py-3 px-2 text-gray-400" colSpan={3}>
                        No team members found.
                      </td>
                    </tr>
                  )}
                  {teamMembers.map((member, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-neutral-800 hover:bg-neutral-800/50 transition"
                    >
                      <td className="py-3 px-2 font-semibold">{member.name}</td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${member.status === "Active"
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
              {incidents.length === 0 && (
                <p className="text-sm text-gray-400">No incidents assigned.</p>
              )}
              {incidents.map((incident) => (
                <Link key={incident.id} href="/dashboard/supervisor/incidents">
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
                  .filter((t) => t.status === "assigned")
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
                  .filter((t) => t.status === "in_progress")
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
