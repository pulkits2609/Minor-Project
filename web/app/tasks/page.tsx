"use client";
export const dynamic = 'force-dynamic';
/* eslint-disable @typescript-eslint/no-explicit-any */
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  CheckCircle2,
  Circle,
  Plus,
  Search,
} from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

interface TaskRow {
  id: string;
  task_name: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: "assigned" | "in_progress" | "completed";
  assigned_to?: string;
  created_at?: string;
}
interface TasksResponse {
  status: string;
  data: TaskRow[];
}

export function TasksContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pathParts = pathname.split("/").filter(Boolean);
  const roleFromPath =
    pathParts[0] === "dashboard" && pathParts[1] ? pathParts[1] : null;
  const role = roleFromPath || searchParams.get("role") || "worker";
  const canAssignTask = role === "supervisor";

  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    task_name: "",
    description: "",
    priority: "medium" as TaskRow["priority"],
    assigned_to: "",
  });
  const [isAssignSubmitting, setIsAssignSubmitting] = useState(false);
  const [workers, setWorkers] = useState<{ id: string; name: string }[]>([]);
  const [workersLoading, setWorkersLoading] = useState(false);

  const openAssignModal = async () => {
    setIsAssignOpen(true);
    if (workers.length > 0) return; // already fetched
    setWorkersLoading(true);
    try {
      const res = await apiFetch<{ status: string; data: { id: string; name: string }[] }>("/api/tasks/workers");
      setWorkers(res.data || []);
    } catch {
      // non-fatal — supervisor can still see an empty list
    } finally {
      setWorkersLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      setError(null);
      setIsLoading(true);
      try {
        const res = await apiFetch<TasksResponse>("/api/tasks");
        setTasks(res.data || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load tasks");
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const reloadTasks = async () => {
    const res = await apiFetch<TasksResponse>("/api/tasks");
    setTasks(res.data || []);
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.task_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "assigned"
          ? task.status === "assigned"
          : filterStatus === "in_progress"
            ? task.status === "in_progress"
            : task.status === "completed");
      return matchesSearch && matchesStatus;
    });
  }, [tasks, searchTerm, filterStatus]);

  const updateStatus = async (taskId: string, status: TaskRow["status"]) => {
    await apiFetch("/api/tasks/status", {
      method: "PATCH",
      body: JSON.stringify({ task_id: taskId, status }),
    });
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
  };

  const submitAssign = async () => {
    if (!canAssignTask) {
      setError("Only supervisors can assign tasks.");
      return;
    }
    if (!assignForm.task_name.trim() || !assignForm.priority || !assignForm.assigned_to.trim()) {
      setError("Task name, priority, and assigned_to are required.");
      return;
    }
    setError(null);
    setIsAssignSubmitting(true);
    try {
      await apiFetch("/api/tasks", {
        method: "POST",
        body: JSON.stringify({
          task_name: assignForm.task_name.trim(),
          description: assignForm.description.trim() || null,
          priority: assignForm.priority,
          assigned_to: assignForm.assigned_to.trim(),
        }),
      });
      setIsAssignOpen(false);
      setAssignForm({
        task_name: "",
        description: "",
        priority: "medium",
        assigned_to: "",
      });
      await reloadTasks();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to assign task");
    } finally {
      setIsAssignSubmitting(false);
    }
  };

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
            <button
              onClick={openAssignModal}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition flex items-center gap-2"
            >
              <Plus size={20} />
              Assign Task
            </button>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-sm text-red-300">
            {error}
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Total Tasks</p>
            <p className="text-2xl font-bold text-blue-400">{tasks.length}</p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">In Progress</p>
            <p className="text-2xl font-bold text-orange-400">
              {tasks.filter((t) => t.status === "in_progress").length}
            </p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">
              {tasks.filter((t) => t.status === "assigned").length}
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
            {["all", "assigned", "in_progress", "completed"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                  filterStatus === status
                    ? "bg-orange-600 text-white"
                    : "bg-neutral-800 text-gray-400 hover:bg-neutral-700"
                }`}
              >
                {status.replace("_", " ").toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* TASKS GRID */}
        <div className="grid grid-cols-2 gap-4">
          {isLoading && (
            <div className="text-sm text-gray-400">Loading tasks...</div>
          )}
          {!isLoading && filteredTasks.length === 0 && (
            <div className="text-sm text-gray-400">No tasks found.</div>
          )}
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
                  onClick={() =>
                    updateStatus(
                      task.id,
                      task.status === "completed"
                        ? "assigned"
                        : task.status === "assigned"
                          ? "in_progress"
                          : "completed"
                    )
                  }
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

              <h3 className="font-bold text-lg mb-2">{task.task_name}</h3>
              <p className="text-sm text-gray-400 mb-4">
                {task.description || "—"}
              </p>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Assigned:</span>
                  <span className="font-semibold">
                    {task.assigned_to || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Created:</span>
                  <span className="font-semibold">
                    {task.created_at ? new Date(task.created_at).toLocaleString() : "—"}
                  </span>
                </div>
              </div>

              <button
                className={`w-full py-2 rounded font-semibold text-sm transition ${
                  task.status === "completed"
                    ? "bg-neutral-800 text-gray-400"
                    : "bg-orange-600/20 text-orange-400 border border-orange-600/30 hover:bg-orange-600/30"
                }`}
              >
                {task.status === "completed"
                  ? "Completed"
                  : task.status === "in_progress"
                    ? "In Progress"
                    : "Assigned"}
              </button>
            </div>
          ))}
        </div>

        {isAssignOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">Assign Task</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Select a worker from the list to assign the task.
                  </p>
                </div>
                <button
                  onClick={() => setIsAssignOpen(false)}
                  className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition"
                >
                  ✕
                </button>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">Task name</label>
                  <input
                    value={assignForm.task_name}
                    onChange={(e) =>
                      setAssignForm((p) => ({ ...p, task_name: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="e.g. Inspect Zone A"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">Description</label>
                  <textarea
                    value={assignForm.description}
                    onChange={(e) =>
                      setAssignForm((p) => ({ ...p, description: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="Optional"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-2 block">Priority</label>
                    <select
                      value={assignForm.priority}
                      onChange={(e) =>
                        setAssignForm((p) => ({
                          ...p,
                          priority: e.target.value as TaskRow["priority"],
                        }))
                      }
                      className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                    >
                      <option value="low">LOW</option>
                      <option value="medium">MEDIUM</option>
                      <option value="high">HIGH</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-2 block">Assign to Worker</label>
                    <select
                      value={assignForm.assigned_to}
                      onChange={(e) =>
                        setAssignForm((p) => ({ ...p, assigned_to: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                      disabled={workersLoading}
                    >
                      <option value="">
                        {workersLoading ? "Loading workers…" : "Select a worker"}
                      </option>
                      {workers.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    onClick={() => setIsAssignOpen(false)}
                    className="px-5 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitAssign}
                    disabled={isAssignSubmitting}
                    className="px-5 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg transition font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isAssignSubmitting ? "Assigning..." : "Assign"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={<div>Loading team...</div>}>
      <TasksContent />
    </Suspense>
  );
}