"use client";
export const dynamic = 'force-dynamic';
/* eslint-disable @typescript-eslint/no-explicit-any */
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  CheckCircle2,
  Circle,
  Plus,
  Search,
  ClipboardList,
  Clock,
  Loader2,
  X,
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

const priorityStyles = {
  high:   { badge: "bg-red-500/15 text-red-400 border-red-500/25",    bar: "bg-red-500",    label: "HIGH" },
  medium: { badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25", bar: "bg-yellow-400", label: "MEDIUM" },
  low:    { badge: "bg-green-500/15 text-green-400 border-green-500/25",  bar: "bg-green-500", label: "LOW" },
};

const statusStyles = {
  assigned:    { label: "Assigned",    chip: "bg-neutral-700/60 text-neutral-300 border-neutral-600/50" },
  in_progress: { label: "In Progress", chip: "bg-orange-500/15 text-orange-400 border-orange-500/25" },
  completed:   { label: "Completed",   chip: "bg-green-500/15 text-green-400 border-green-500/25" },
};

const filterOptions = [
  { key: "all",         label: "All" },
  { key: "pending",     label: "Pending" },
  { key: "in-progress", label: "In Progress" },
  { key: "completed",   label: "Done" },
];

export function TasksContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pathParts = pathname.split("/").filter(Boolean);
  const roleFromPath = pathParts[0] === "dashboard" && pathParts[1] ? pathParts[1] : null;
  const role = roleFromPath || searchParams.get("role") || "worker";
  const canAssignTask = role === "supervisor" || role === "admin" || role === "authority";

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
    if (workers.length > 0) return;
    setWorkersLoading(true);
    try {
      const res = await apiFetch<{ status: string; data: { id: string; name: string }[] }>("/api/tasks/workers");
      setWorkers(res.data || []);
    } catch { /* non-fatal */ }
    finally { setWorkersLoading(false); }
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
      const matchesSearch = task.task_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "pending" ? task.status === "assigned"
          : filterStatus === "in-progress" ? task.status === "in_progress"
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
    if (!canAssignTask) { setError("Only supervisors can assign tasks."); return; }
    if (!assignForm.task_name.trim() || !assignForm.assigned_to.trim()) {
      setError("Task name and assigned worker are required.");
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
      setAssignForm({ task_name: "", description: "", priority: "medium", assigned_to: "" });
      await reloadTasks();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to assign task");
    } finally {
      setIsAssignSubmitting(false);
    }
  };

  const totalTasks = tasks.length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const pending = tasks.filter((t) => t.status === "assigned").length;
  const completed = tasks.filter((t) => t.status === "completed").length;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl">
        {/* ── Header ── */}
        <div className="flex items-start justify-between animate-fade-in-up">
          <div>
            <h2 className="text-2xl font-black text-white mb-1">Tasks</h2>
            <p className="text-sm text-neutral-500">Manage and track work assignments</p>
          </div>
          {canAssignTask && (
            <button
              onClick={openAssignModal}
              className="btn-primary"
            >
              <Plus size={16} />
              Assign Task
            </button>
          )}
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center gap-2.5 text-sm text-red-300 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-4 gap-4 animate-fade-in-up">
          {[
            { label: "Total Tasks",  value: totalTasks, icon: <ClipboardList size={18} />, color: "text-blue-400",   bg: "bg-blue-500/10" },
            { label: "In Progress",  value: inProgress, icon: <Loader2 size={18} />,       color: "text-orange-400", bg: "bg-orange-500/10" },
            { label: "Pending",      value: pending,    icon: <Clock size={18} />,          color: "text-yellow-400", bg: "bg-yellow-500/10" },
            { label: "Completed",    value: completed,  icon: <CheckCircle2 size={18} />,   color: "text-green-400",  bg: "bg-green-500/10" },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">{s.label}</span>
                <div className={`w-8 h-8 rounded-lg ${s.bg} ${s.color} flex items-center justify-center`}>{s.icon}</div>
              </div>
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Search & filter ── */}
        <div className="flex gap-3 animate-fade-in-up">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-premium pl-10"
            />
          </div>
          <div className="flex gap-2">
            {filterOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setFilterStatus(opt.key)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  filterStatus === opt.key
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                    : "bg-neutral-900 text-neutral-400 border border-white/[0.07] hover:border-orange-500/30 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Task grid ── */}
        {isLoading && (
          <div className="grid grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-52 skeleton rounded-xl" />)}
          </div>
        )}

        {!isLoading && filteredTasks.length === 0 && (
          <div className="text-center py-16 text-neutral-600">
            <ClipboardList size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No tasks found.</p>
          </div>
        )}

        {!isLoading && filteredTasks.length > 0 && (
          <div className="grid grid-cols-2 gap-4 animate-fade-in-up">
            {filteredTasks.map((task) => {
              const p = priorityStyles[task.priority] || priorityStyles.medium;
              const s = statusStyles[task.status] || statusStyles.assigned;
              const nextStatus: TaskRow["status"] =
                task.status === "completed" ? "assigned"
                  : task.status === "assigned" ? "in_progress"
                  : "completed";

              return (
                <div
                  key={task.id}
                  className="group rounded-xl border border-white/[0.06] bg-neutral-900/70 overflow-hidden hover:border-orange-500/20 transition-all hover:-translate-y-0.5"
                >
                  {/* Top bar */}
                  <div className={`h-0.5 w-full ${p.bar}`} />

                  <div className="p-5">
                    {/* Row: checkbox + priority */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => updateStatus(task.id, nextStatus)}
                        className={`transition-all hover:scale-110 ${task.status === "completed" ? "text-green-400" : "text-neutral-600 hover:text-orange-400"}`}
                      >
                        {task.status === "completed"
                          ? <CheckCircle2 size={22} />
                          : <Circle size={22} />
                        }
                      </button>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${p.badge}`}>
                          {p.label}
                        </span>
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border ${s.chip}`}>
                          {s.label}
                        </span>
                      </div>
                    </div>

                    {/* Task name */}
                    <h3 className={`font-bold text-base mb-1.5 ${task.status === "completed" ? "line-through text-neutral-600" : "text-white"}`}>
                      {task.task_name}
                    </h3>
                    <p className="text-xs text-neutral-500 mb-4 line-clamp-2 min-h-[2rem]">
                      {task.description || "No description provided."}
                    </p>

                    {/* Meta */}
                    <div className="space-y-1.5 text-xs border-t border-white/[0.05] pt-3">
                      {task.assigned_to && (
                        <div className="flex justify-between text-neutral-500">
                          <span>Assigned to</span>
                          <span className="text-neutral-300 font-medium">{task.assigned_to}</span>
                        </div>
                      )}
                      {task.created_at && (
                        <div className="flex justify-between text-neutral-500">
                          <span>Created</span>
                          <span className="text-neutral-400">{new Date(task.created_at).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Assign Task Modal ── */}
        {isAssignOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backdropFilter: "blur(8px)", background: "rgba(0,0,0,0.7)" }}>
            <div className="w-full max-w-lg rounded-2xl border border-white/[0.1] bg-neutral-900 shadow-2xl animate-fade-in-up">
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.07]">
                <div>
                  <h3 className="text-lg font-black text-white">Assign New Task</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Select a worker and fill in task details</p>
                </div>
                <button
                  onClick={() => setIsAssignOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-neutral-400 hover:text-white transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal body */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">Task Name *</label>
                  <input
                    value={assignForm.task_name}
                    onChange={(e) => setAssignForm((p) => ({ ...p, task_name: e.target.value }))}
                    className="input-premium"
                    placeholder="e.g. Inspect Zone A ventilation"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">Description</label>
                  <textarea
                    value={assignForm.description}
                    onChange={(e) => setAssignForm((p) => ({ ...p, description: e.target.value }))}
                    className="input-premium resize-none"
                    placeholder="Optional description..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">Priority *</label>
                    <select
                      value={assignForm.priority}
                      onChange={(e) => setAssignForm((p) => ({ ...p, priority: e.target.value as TaskRow["priority"] }))}
                      className="input-premium"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-2 uppercase tracking-wider">Assign to Worker *</label>
                    <select
                      value={assignForm.assigned_to}
                      onChange={(e) => setAssignForm((p) => ({ ...p, assigned_to: e.target.value }))}
                      className="input-premium"
                      disabled={workersLoading}
                    >
                      <option value="">{workersLoading ? "Loading..." : "Select worker"}</option>
                      {workers.map((w) => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/[0.07]">
                <button
                  onClick={() => setIsAssignOpen(false)}
                  className="btn-ghost py-2.5 px-5"
                >
                  Cancel
                </button>
                <button
                  onClick={submitAssign}
                  disabled={isAssignSubmitting}
                  className="btn-primary py-2.5 px-5"
                >
                  {isAssignSubmitting ? <><Loader2 size={14} className="animate-spin" /> Assigning...</> : "Assign Task"}
                </button>
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
    <Suspense fallback={<div className="min-h-screen bg-neutral-950" />}>
      <TasksContent />
    </Suspense>
  );
}