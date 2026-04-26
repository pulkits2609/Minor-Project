"use client";
export const dynamic = 'force-dynamic';
/* eslint-disable @typescript-eslint/no-explicit-any */
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useEffect } from "react";

export function IncidentsContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "worker";

  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [incidents, setIncidents] = useState<any[]>([]);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const res: any = await apiFetch("/api/incidents");
        if (res.status === "success") {
          setIncidents(res.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch incidents", err);
      }
    };
    fetchIncidents();
  }, []);

  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch =
      (incident.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (incident.id || "").toString().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || incident.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Incidents</h2>
            <p className="text-gray-400">Manage and track safety incidents</p>
          </div>
          {(role === "worker" || role === "supervisor" || role === "safety_officer") && (
            <Link href={`/incidents/report?role=${role}`}>
              <button className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition">
                + Report Incident
              </button>
            </Link>
          )}
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
              placeholder="Search incidents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div className="flex gap-2">
            {[
              "all",
              "pending-verification",
              "assigned",
              "escalated",
              "resolved",
            ].map((status) => (
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

        {/* STATS */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Total Incidents</p>
            <p className="text-2xl font-bold text-blue-400">
              {incidents.length}
            </p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Critical</p>
            <p className="text-2xl font-bold text-red-400">
              {incidents.filter((i) => i.severity === "critical").length}
            </p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Open</p>
            <p className="text-2xl font-bold text-orange-400">
              {incidents.filter((i) => i.status !== "resolved").length}
            </p>
          </div>
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
            <p className="text-xs text-gray-400 mb-1">Resolved</p>
            <p className="text-2xl font-bold text-green-400">
              {incidents.filter((i) => i.status === "resolved").length}
            </p>
          </div>
        </div>

        {/* INCIDENTS TABLE */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-800">
                <tr className="text-gray-400 text-sm">
                  <th className="text-left py-3 px-4">Incident</th>
                  <th className="text-left py-3 px-4">Zone</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Severity</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {filteredIncidents.map((incident) => (
                  <tr
                    key={incident.id}
                    className="hover:bg-neutral-800/50 transition"
                  >
                    <td className="py-4 px-4">
                      <Link href={`/incidents/${incident.id}?role=${role}`}>
                        <div className="cursor-pointer hover:text-orange-400 transition">
                          <p className="font-semibold text-sm">
                            INC-{incident.id.toString().substring(0, 8).toUpperCase()}
                          </p>
                          <p className="text-xs text-gray-400">
                            {incident.description.substring(0, 40)}...
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="py-4 px-4 text-sm">{incident.location}</td>
                    <td className="py-4 px-4 text-sm text-gray-400">
                      {new Date(incident.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                          incident.severity === "critical"
                            ? "bg-red-900/30 text-red-400"
                            : incident.severity === "high"
                              ? "bg-orange-900/30 text-orange-400"
                              : incident.severity === "medium"
                                ? "bg-yellow-900/30 text-yellow-400"
                                : "bg-green-900/30 text-green-400"
                        }`}
                      >
                        {incident.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                          incident.status === "resolved"
                            ? "bg-green-900/30 text-green-400"
                            : incident.status === "escalated"
                              ? "bg-red-900/30 text-red-400"
                              : incident.status === "assigned"
                                ? "bg-blue-900/30 text-blue-400"
                                : "bg-yellow-900/30 text-yellow-400"
                        }`}
                      >
                        {incident.status.replace("-", " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <Link href={`/incidents/${incident.id}?role=${role}`}>
                        <button className="text-orange-400 hover:text-orange-300 text-sm font-semibold">
                          View Details
                        </button>
                      </Link>
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


export default function IncidentsPage() {
  return (
    <Suspense fallback={<div>Loading incidents...</div>}>
      <IncidentsContent />
    </Suspense>
  );
}
