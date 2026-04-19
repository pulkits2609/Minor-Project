/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { AlertCircle, CheckCircle2, Clock, MessageSquare } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function IncidentReviewPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "worker";

  const [filterStatus, setFilterStatus] = useState("pending");
  const [selectedIncident, setSelectedIncident] = useState<number | null>(null);

  const incidents = [
    {
      id: 1,
      code: "INC-3412",
      title: "Gas leak report",
      zone: "Zone C",
      date: "Today 14:30",
      severity: "critical",
      status: "pending",
      reporter: "R. Das",
      description: "Strong gas smell detected near ventilation shaft",
    },
    {
      id: 2,
      code: "INC-3407",
      title: "PPE violation Team C",
      zone: "Zone B",
      date: "Today 12:15",
      severity: "high",
      status: "assigned",
      reporter: "Supervisor",
      description: "Worker found without proper safety gear",
    },
    {
      id: 3,
      code: "INC-3398",
      title: "Equipment heat anomaly",
      zone: "Zone A",
      date: "Yesterday 09:45",
      severity: "medium",
      status: "assigned",
      reporter: "M. Khan",
      description: "Pump showing abnormal temperature readings",
    },
  ];

  const filteredIncidents = incidents.filter((i) => i.status === filterStatus);
  const current =
    selectedIncident !== null
      ? incidents.find((i) => i.id === selectedIncident)
      : filteredIncidents[0];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div>
          <Link
            href={`/dashboard/${role}?role=${role}`}
            className="text-orange-400 hover:text-orange-300 text-sm mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h2 className="text-3xl font-bold mb-2">
            Incident Review & Verification
          </h2>
          <p className="text-gray-400">Review and verify reported incidents</p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* INCIDENT LIST */}
          <div className="space-y-3">
            <div className="flex gap-2">
              {["pending", "assigned", "resolved"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-2 rounded text-sm font-semibold transition ${
                    filterStatus === status
                      ? "bg-orange-600 text-white"
                      : "bg-neutral-800 text-gray-400 hover:bg-neutral-700"
                  }`}
                >
                  {status.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredIncidents.map((inc) => (
                <button
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc.id)}
                  className={`w-full text-left p-3 rounded-lg border transition ${
                    selectedIncident === inc.id
                      ? "bg-orange-900/30 border-orange-600"
                      : "bg-neutral-800 border-neutral-700 hover:border-orange-600"
                  }`}
                >
                  <p className="font-semibold text-sm">{inc.code}</p>
                  <p className="text-xs text-gray-400 mt-1">{inc.title}</p>
                  <span
                    className={`inline-block text-xs font-semibold mt-2 px-2 py-1 rounded ${
                      inc.severity === "critical"
                        ? "bg-red-900/30 text-red-400"
                        : inc.severity === "high"
                          ? "bg-orange-900/30 text-orange-400"
                          : "bg-yellow-900/30 text-yellow-400"
                    }`}
                  >
                    {inc.severity.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* INCIDENT DETAIL */}
          {current && (
            <div className="col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-6">
              {/* HEADER */}
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">{current.code}</p>
                    <h3 className="text-2xl font-bold">{current.title}</h3>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                      current.severity === "critical"
                        ? "bg-red-900/30 text-red-400"
                        : current.severity === "high"
                          ? "bg-orange-900/30 text-orange-400"
                          : "bg-yellow-900/30 text-yellow-400"
                    }`}
                  >
                    {current.severity.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* DETAILS */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-neutral-800 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Zone</p>
                  <p className="font-semibold">{current.zone}</p>
                </div>
                <div className="p-3 bg-neutral-800 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Date & Time</p>
                  <p className="font-semibold text-sm">{current.date}</p>
                </div>
                <div className="p-3 bg-neutral-800 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Reporter</p>
                  <p className="font-semibold">{current.reporter}</p>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div>
                <h4 className="font-bold mb-2">Description</h4>
                <p className="text-gray-300">{current.description}</p>
              </div>

              {/* VERIFICATION SECTION */}
              {current.status === "pending" && (
                <div className="border-t border-neutral-700 pt-6">
                  <h4 className="font-bold mb-4">Verification Required</h4>
                  <div className="space-y-3">
                    <textarea
                      placeholder="Verification notes..."
                      rows={4}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <button className="py-3 bg-green-900/30 text-green-400 border border-green-700 rounded-lg hover:bg-green-900/50 transition font-semibold">
                        ✓ Approve
                      </button>
                      <button className="py-3 bg-red-900/30 text-red-400 border border-red-700 rounded-lg hover:bg-red-900/50 transition font-semibold">
                        ✗ Reject
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STATUS SECTION */}
              {current.status !== "pending" && (
                <div className="border-t border-neutral-700 pt-6">
                  <h4 className="font-bold mb-4">Current Status</h4>
                  <div className="p-4 bg-neutral-800 rounded-lg">
                    <span
                      className={`inline-block px-3 py-1 rounded text-sm font-semibold ${
                        current.status === "assigned"
                          ? "bg-blue-900/30 text-blue-400"
                          : "bg-green-900/30 text-green-400"
                      }`}
                    >
                      {current.status.replace("-", " ").toUpperCase()}
                    </span>
                    <p className="text-sm text-gray-400 mt-2">
                      {current.status === "assigned" &&
                        "Assigned to Safety Officer for investigation"}
                      {current.status === "resolved" &&
                        "This incident has been resolved"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
