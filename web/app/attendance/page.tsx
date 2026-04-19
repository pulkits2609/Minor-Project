/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Clock, CheckCircle2, LogIn, LogOut } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function AttendancePage() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "worker";

  const [selectedDate, setSelectedDate] = useState("2026-04-19");

  const attendance = [
    {
      id: 1,
      name: "R. Das",
      checkIn: "07:45",
      checkOut: "16:30",
      status: "Present",
      duration: "8h 45m",
    },
    {
      id: 2,
      name: "M. Khan",
      checkIn: "08:00",
      checkOut: "16:45",
      status: "Present",
      duration: "8h 45m",
    },
    {
      id: 3,
      name: "P. Kumar",
      checkIn: "08:30",
      checkOut: "—",
      status: "Late",
      duration: "In Progress",
    },
    {
      id: 4,
      name: "A. Roy",
      checkIn: "07:50",
      checkOut: "16:20",
      status: "Present",
      duration: "8h 30m",
    },
    {
      id: 5,
      name: "S. Singh",
      checkIn: "—",
      checkOut: "—",
      status: "Absent",
      duration: "—",
    },
  ];

  const stats = {
    present: attendance.filter((a) => a.status === "Present").length,
    late: attendance.filter((a) => a.status === "Late").length,
    absent: attendance.filter((a) => a.status === "Absent").length,
    total: attendance.length,
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
            <button className="py-3 flex items-center justify-center gap-2 bg-green-600/30 text-green-400 border border-green-600 rounded-lg hover:bg-green-600/50 transition font-semibold">
              <LogIn size={20} />
              Check In
            </button>
            <button className="py-3 flex items-center justify-center gap-2 bg-red-600/30 text-red-400 border border-red-600 rounded-lg hover:bg-red-600/50 transition font-semibold">
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
                {attendance.map((person) => (
                  <tr
                    key={person.id}
                    className="hover:bg-neutral-800/50 transition"
                  >
                    <td className="py-4 px-4 font-semibold">{person.name}</td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <LogIn size={16} className="text-green-400" />
                        <span>{person.checkIn}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {person.checkOut === "—" ? (
                        <span className="text-gray-400">—</span>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <LogOut size={16} className="text-red-400" />
                          <span>{person.checkOut}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Clock size={16} className="text-orange-400" />
                        <span>{person.duration}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                          person.status === "Present"
                            ? "bg-green-900/30 text-green-400"
                            : person.status === "Late"
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
