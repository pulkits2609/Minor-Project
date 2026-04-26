"use client";
import { Suspense } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Clock, LogIn, LogOut } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

interface AttendanceRow {
  id: string;
  user_id: string;
  shift_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
}
interface ShiftRow {
  id: string;
  start_time: string;
  end_time: string;
  location?: string;
  created_by?: string;
}
interface AttendanceResponse {
  status: string;
  data: AttendanceRow[];
}
interface ShiftsResponse {
  status: string;
  data: ShiftRow[];
}

function AttendanceContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pathParts = pathname.split("/").filter(Boolean);
  const roleFromPath =
    pathParts[0] === "dashboard" && pathParts[1] ? pathParts[1] : null;
  const role = roleFromPath || searchParams.get("role") || "worker";
  const canManageShifts = role === "supervisor";

  const [selectedDate, setSelectedDate] = useState("2026-04-19");
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [shifts, setShifts] = useState<ShiftRow[]>([]);
  const [selectedShiftId, setSelectedShiftId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shiftForm, setShiftForm] = useState({
    start_time: "",
    end_time: "",
    location: "",
    user_ids_csv: "",
  });
  const [isShiftSubmitting, setIsShiftSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setError(null);
      setIsLoading(true);
      try {
        const [att, sh] = await Promise.all([
          apiFetch<AttendanceResponse>("/api/attendance"),
          apiFetch<ShiftsResponse>("/api/shifts"),
        ]);
        setAttendance(att.data || []);
        setShifts(sh.data || []);
        if (!selectedShiftId && sh.data?.[0]?.id) {
          setSelectedShiftId(sh.data[0].id);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load attendance");
      } finally {
        setIsLoading(false);
      }
    };
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reloadAll = async () => {
    const [att, sh] = await Promise.all([
      apiFetch<AttendanceResponse>("/api/attendance"),
      apiFetch<ShiftsResponse>("/api/shifts"),
    ]);
    setAttendance(att.data || []);
    setShifts(sh.data || []);
  };

  const stats = useMemo(() => {
    const present = attendance.filter((a) => a.status === "present").length;
    const late = attendance.filter((a) => a.status === "late").length;
    const absent = attendance.filter((a) => a.status === "absent").length;
    return {
      present,
      late,
      absent,
      total: attendance.length,
    };
  }, [attendance]);

  const fmtTime = (value: string | null) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const duration = (row: AttendanceRow) => {
    if (!row.check_in) return "—";
    if (!row.check_out) return "In Progress";
    const start = new Date(row.check_in).getTime();
    const end = new Date(row.check_out).getTime();
    if (Number.isNaN(start) || Number.isNaN(end) || end < start) return "—";
    const mins = Math.round((end - start) / 60000);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const checkIn = async () => {
    if (!selectedShiftId) return;
    await apiFetch("/api/attendance/checkin", {
      method: "POST",
      body: JSON.stringify({ shift_id: selectedShiftId }),
    });
    const att = await apiFetch<AttendanceResponse>("/api/attendance");
    setAttendance(att.data || []);
  };

  const checkOut = async () => {
    if (!selectedShiftId) return;
    await apiFetch("/api/attendance/checkout", {
      method: "POST",
      body: JSON.stringify({ shift_id: selectedShiftId }),
    });
    const att = await apiFetch<AttendanceResponse>("/api/attendance");
    setAttendance(att.data || []);
  };

  const createShiftAndAssign = async () => {
    if (!canManageShifts) {
      setError("Only supervisors can create shifts.");
      return;
    }
    if (!shiftForm.start_time || !shiftForm.end_time) {
      setError("start_time and end_time are required.");
      return;
    }
    setError(null);
    setIsShiftSubmitting(true);
    try {
      const created = await apiFetch<{ status: string; shift_id: string }>(
        "/api/shifts",
        {
          method: "POST",
          body: JSON.stringify({
            start_time: shiftForm.start_time,
            end_time: shiftForm.end_time,
            location: shiftForm.location || null,
          }),
        },
      );

      const userIds = shiftForm.user_ids_csv
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (userIds.length > 0) {
        await apiFetch(`/api/shifts/${created.shift_id}/assign`, {
          method: "POST",
          body: JSON.stringify({ user_ids: userIds }),
        });
      }

      setShiftForm({
        start_time: "",
        end_time: "",
        location: "",
        user_ids_csv: "",
      });
      await reloadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create shift");
    } finally {
      setIsShiftSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div>
          <h2 className="text-3xl font-bold mb-2">Attendance Tracking</h2>
          <p className="text-gray-400">
            Check-in/Check-out and attendance records
          </p>
        </div>

        {/* DATE SELECTOR */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-semibold">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-sm text-red-300">
            {error}
          </div>
        )}

        {canManageShifts && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-2">Create Shift</h3>
            <p className="text-sm text-gray-400 mb-5">
              Supervisor only. Create a shift and optionally assign workers
              (comma-separated user ids).
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-2 block">
                  Start time
                </label>
                <input
                  type="datetime-local"
                  value={shiftForm.start_time}
                  onChange={(e) =>
                    setShiftForm((p) => ({ ...p, start_time: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-2 block">
                  End time
                </label>
                <input
                  type="datetime-local"
                  value={shiftForm.end_time}
                  onChange={(e) =>
                    setShiftForm((p) => ({ ...p, end_time: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-400 mb-2 block">
                  Location
                </label>
                <input
                  value={shiftForm.location}
                  onChange={(e) =>
                    setShiftForm((p) => ({ ...p, location: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="e.g. Zone A"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-400 mb-2 block">
                  Assign workers (user_ids, comma-separated)
                </label>
                <input
                  value={shiftForm.user_ids_csv}
                  onChange={(e) =>
                    setShiftForm((p) => ({
                      ...p,
                      user_ids_csv: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="uuid1, uuid2, uuid3"
                />
              </div>
              <div className="col-span-2 flex justify-end">
                <button
                  onClick={createShiftAndAssign}
                  disabled={isShiftSubmitting}
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isShiftSubmitting ? "Creating..." : "Create Shift"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Total Staff</p>
            <p className="text-2xl font-bold text-blue-400">{stats.total}</p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Present</p>
            <p className="text-2xl font-bold text-green-400">{stats.present}</p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Late</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.late}</p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Absent</p>
            <p className="text-2xl font-bold text-red-400">{stats.absent}</p>
          </div>
        </div>

        {/* CHECK IN/OUT BUTTONS */}
        {role === "worker" && (
          <div className="grid grid-cols-2 gap-4 bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <div className="col-span-2 flex items-center gap-3 mb-3">
              <label className="text-sm text-gray-400">Shift:</label>
              <select
                value={selectedShiftId}
                onChange={(e) => setSelectedShiftId(e.target.value)}
                className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg"
              >
                {shifts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.location || "Shift"} •{" "}
                    {new Date(s.start_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    -
                    {new Date(s.end_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={checkIn}
              disabled={!selectedShiftId}
              className="py-3 flex items-center justify-center gap-2 bg-green-600/30 text-green-400 border border-green-600 rounded-lg hover:bg-green-600/50 transition font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <LogIn size={20} />
              Check In
            </button>
            <button
              onClick={checkOut}
              disabled={!selectedShiftId}
              className="py-3 flex items-center justify-center gap-2 bg-red-600/30 text-red-400 border border-red-600 rounded-lg hover:bg-red-600/50 transition font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <LogOut size={20} />
              Check Out
            </button>
          </div>
        )}

        {/* ATTENDANCE TABLE */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-800">
                <tr className="text-gray-400 text-sm">
                  <th className="text-left py-3 px-4">Employee</th>
                  <th className="text-center py-3 px-4">Check In</th>
                  <th className="text-center py-3 px-4">Check Out</th>
                  <th className="text-center py-3 px-4">Duration</th>
                  <th className="text-center py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {isLoading && (
                  <tr>
                    <td className="py-4 px-4 text-gray-400" colSpan={5}>
                      Loading attendance...
                    </td>
                  </tr>
                )}
                {!isLoading && attendance.length === 0 && (
                  <tr>
                    <td className="py-4 px-4 text-gray-400" colSpan={5}>
                      No attendance records.
                    </td>
                  </tr>
                )}
                {attendance.map((person) => (
                  <tr
                    key={person.id}
                    className="hover:bg-neutral-800/50 transition"
                  >
                    <td className="py-4 px-4 font-semibold">
                      {person.user_name || person.user_id}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <LogIn size={16} className="text-green-400" />
                        <span>{fmtTime(person.check_in)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {!person.check_out ? (
                        <span className="text-gray-400">—</span>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <LogOut size={16} className="text-red-400" />
                          <span>{fmtTime(person.check_out)}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Clock size={16} className="text-orange-400" />
                        <span>{duration(person)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                          person.status === "present"
                            ? "bg-green-900/30 text-green-400"
                            : person.status === "late"
                              ? "bg-yellow-900/30 text-yellow-400"
                              : "bg-red-900/30 text-red-400"
                        }`}
                      >
                        {person.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">Daily Summary</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-neutral-800 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">
                Average Check In Time
              </p>
              <p className="text-2xl font-bold">08:01</p>
            </div>
            <div className="p-4 bg-neutral-800 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">
                Average Check Out Time
              </p>
              <p className="text-2xl font-bold">16:29</p>
            </div>
            <div className="p-4 bg-neutral-800 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">Attendance Rate</p>
              <p className="text-2xl font-bold text-green-400">80%</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function AttendancePage() {
  return (
    <Suspense fallback={<div>Loading attendance...</div>}>
      <AttendanceContent />
    </Suspense>
  );
}
