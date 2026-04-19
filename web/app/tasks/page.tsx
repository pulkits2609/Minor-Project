/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  Plus,
  Filter,
  Search,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function TasksPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "worker";

  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const tasks = [
    {
      id: 1,
      title: "Ventilation check - Zone C",
      description: "Inspect and calibrate ventilation sensors",
      assignedTo: "R. Das",
      zone: "Zone C",
      dueDate: "Today",
      priority: "high",
      status: "pending",
    },
    {
      id: 2,
      title: "Equipment maintenance",
      description: "Regular maintenance of conveyor belt system",
      assignedTo: "M. Khan",
      zone: "Zone B",
      dueDate: "Tomorrow",
      priority: "medium",
      status: "in-progress",
    },
    {
      id: 3,
      title: "Safety briefing",
      description: "Conduct safety briefing for Team A",
      assignedTo: "Supervisor",
      zone: "Main",
      dueDate: "2 days",
      priority: "medium",
      status: "completed",
    },
    {
      id: 4,
      title: "Tool inventory check",
      description: "Count and verify all safety equipment",
      assignedTo: "A. Roy",
      zone: "Storage",
      dueDate: "3 days",
      priority: "low",
      status: "pending",
    },
  ];

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Tasks</h2>
            <p className="text-gray-400">Manage and track work assignments</p>
          </div>
          {(role === "supervisor" ||
            role === "admin" ||
            role === "authority") && (
            <button className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition flex items-center gap-2">
              <Plus size={20} />
              Assign Task
            </button>
          )}
        </div>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Total Tasks</p>
            <p className="text-2xl font-bold text-blue-400">{tasks.length}</p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">In Progress</p>
            <p className="text-2xl font-bold text-orange-400">
              {tasks.filter((t) => t.status === "in-progress").length}
            </p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">
              {tasks.filter((t) => t.status === "pending").length}
            </p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-400">
              {tasks.filter((t) => t.status === "completed").length}
            </p>
          </div>
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
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div className="flex gap-2">
            {["all", "pending", "in-progress", "completed"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                  filterStatus === status
                    ? "bg-orange-600 text-white"
                    : "bg-neutral-800 text-gray-400 hover:bg-neutral-700"
                }`}
              >
                {status.replace("-", " ").toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* TASKS GRID */}
        <div className="grid grid-cols-2 gap-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-orange-600/50 transition"
            >
              <div className="flex items-start justify-between mb-3">
                <button
                  className={`text-2xl transition hover:scale-110 ${
                    task.status === "completed"
                      ? "text-green-400"
                      : "text-gray-400 hover:text-orange-400"
                  }`}
                >
                  {task.status === "completed" ? (
                    <CheckCircle2 size={24} />
                  ) : (
                    <Circle size={24} />
                  )}
                </button>
                <span
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    task.priority === "high"
                      ? "bg-red-900/30 text-red-400"
                      : task.priority === "medium"
                        ? "bg-yellow-900/30 text-yellow-400"
                        : "bg-green-900/30 text-green-400"
                  }`}
                >
                  {task.priority.toUpperCase()}
                </span>
              </div>

              <h3 className="font-bold text-lg mb-2">{task.title}</h3>
              <p className="text-sm text-gray-400 mb-4">{task.description}</p>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Zone:</span>
                  <span className="font-semibold">{task.zone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Assigned:</span>
                  <span className="font-semibold">{task.assignedTo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Due:</span>
                  <span className="font-semibold">{task.dueDate}</span>
                </div>
              </div>

              <button
                className={`w-full py-2 rounded font-semibold text-sm transition ${
                  task.status === "completed"
                    ? "bg-neutral-800 text-gray-400"
                    : "bg-orange-600/20 text-orange-400 border border-orange-600/30 hover:bg-orange-600/30"
                }`}
              >
                {task.status === "completed" ? "Completed" : "View Details"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
