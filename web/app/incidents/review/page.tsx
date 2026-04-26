"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useEffect } from "react";

function IncidentReviewContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "worker";

  const [filterStatus, setFilterStatus] = useState("pending-verification");
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [notes, setNotes] = useState("");

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

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const res: any = await apiFetch(`/api/incidents/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, notes }),
      });
      if (res.status === "success") {
        fetchIncidents();
        setNotes("");
      }
    } catch (err: any) {
      alert(err.message || "Update failed");
    }
  };

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
            â† Back to Dashboard
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
              {["pending-verification", "assigned", "resolved"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-2 rounded text-sm font-semibold transition ${
                    filterStatus === status
                      ? "bg-orange-600 text-white"
                      : "bg-neutral-800 text-gray-400 hover:bg-neutral-700"
                  }`}
                >
                  {status.replace("-", " ").toUpperCase()}
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
                  <p className="font-semibold text-sm">INC-{inc.id.substring(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-gray-400 mt-1">{inc.description ? inc.description.split('.')[0] : 'No Title'}</p>
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
                    <p className="text-sm text-gray-400 mb-2">INC-{current.id.substring(0, 8).toUpperCase()}</p>
                    <h3 className="text-2xl font-bold">{current.description ? current.description.split('.')[0] : 'Incident'}</h3>
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
                  <p className="font-semibold">{current.location}</p>
                </div>
                <div className="p-3 bg-neutral-800 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Date & Time</p>
                  <p className="font-semibold text-sm">{new Date(current.created_at).toLocaleString()}</p>
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
              {current.status === "pending-verification" && (
                <div className="border-t border-neutral-700 pt-6">
                  <h4 className="font-bold mb-4">Verification Required</h4>
                  <div className="space-y-3">
                    <textarea
                      placeholder="Verification notes..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => handleStatusUpdate(current.id, 'assigned')}
                        className="py-3 bg-green-900/30 text-green-400 border border-green-700 rounded-lg hover:bg-green-900/50 transition font-semibold">
                        âœ“ Approve
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(current.id, 'resolved')}
                        className="py-3 bg-red-900/30 text-red-400 border border-red-700 rounded-lg hover:bg-red-900/50 transition font-semibold">
                        âœ— Reject
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

export default function IncidentReviewPage() {
  return (
    <Suspense fallback={<div>Loading incidents...</div>}>
      <IncidentReviewContent />
    </Suspense>
  );
}
