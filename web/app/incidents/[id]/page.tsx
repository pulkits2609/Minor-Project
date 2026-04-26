/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function IncidentDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "worker";
  const id = params.id as string;

  const [incident, setIncident] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        const res: any = await apiFetch(`/api/incidents/${id}`);
        if (res.status === "success") {
          setIncident(res.data);
        } else {
          setError(res.error || "Failed to load incident");
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch incident details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchIncident();
  }, [id]);

  async function updateIncidentStatus(status: string) {
    try {
      await apiFetch(`/api/incidents/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setIncident((prev: any) => ({ ...prev, status }));
      alert("Status updated successfully");
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-400">Loading incident details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !incident) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center space-y-4">
          <AlertCircle className="mx-auto text-red-500" size={48} />
          <h2 className="text-2xl font-bold text-red-400">Error</h2>
          <p className="text-gray-400">{error || "Incident not found"}</p>
          <Link href={`/incidents?role=${role}`} className="text-orange-400 hover:underline">
            Back to Incidents
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div>
          <Link
            href={`/incidents?role=${role}`}
            className="text-orange-400 hover:text-orange-300 text-sm mb-4 inline-block"
          >
            ← Back to Incidents
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-2">INC-{incident.id.substring(0, 8).toUpperCase()}</p>
              <h2 className="text-3xl font-bold mb-2">Incident Report</h2>
            </div>
            <span
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${incident.severity === "critical"
                  ? "bg-red-900/30 text-red-400"
                  : "bg-orange-900/30 text-orange-400"
                }`}
            >
              {incident.severity.toUpperCase()}
            </span>
          </div>
        </div>

        {/* CRITICAL ALERT */}
        {incident.severity === "critical" && (
          <div className="bg-red-900/30 border border-red-700 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle
              className="text-red-500 flex-shrink-0 mt-0.5"
              size={20}
            />
            <div>
              <h3 className="font-semibold text-red-400">
                Critical Incident - Immediate Action Required
              </h3>
              <p className="text-sm text-red-200 mt-1">
                This is a critical safety incident. Personnel in the affected
                zone must be alerted immediately.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          {/* MAIN CONTENT */}
          <div className="col-span-2 space-y-6">
            {/* DESCRIPTION */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Incident Description</h3>
              <p className="text-gray-300 leading-relaxed">
                {incident.description}
              </p>
            </div>

            {/* TIMELINE - Backend currently doesn't have a timeline table, showing basic info */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-6">Incident History</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <div className="w-0.5 h-8 bg-neutral-700 mt-2"></div>
                  </div>
                  <div>
                    <p className="font-semibold">Reported</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {incident.reporter} • {new Date(incident.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${incident.status === 'resolved' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  </div>
                  <div>
                    <p className="font-semibold">Current Status: {incident.status.toUpperCase()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-4">
            {/* DETAILS CARD */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
              <h3 className="font-bold mb-4">Details</h3>

              <div>
                <p className="text-xs text-gray-400 mb-1">Zone</p>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-orange-400" />
                  <p className="font-semibold">{incident.location}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Reported At</p>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-blue-400" />
                  <p className="font-semibold">
                    {new Date(incident.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <span className={`inline-block px-3 py-1 rounded text-xs font-semibold ${incident.status === "resolved" ? "bg-green-900/30 text-green-400" : "bg-yellow-900/30 text-yellow-400"
                  }`}>
                  {incident.status.replace("-", " ").toUpperCase()}
                </span>
              </div>
            </div>

            {/* REPORTER */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h3 className="font-bold mb-4">Reporter</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center font-bold">
                  {incident.reporter.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    {incident.reporter}
                  </p>
                  <p className="text-xs text-gray-400">
                    {incident.reporter_role || "Staff"}
                  </p>
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            {(role === "supervisor" ||
              role === "safety_officer" ||
              role === "admin" ||
              role === "authority") && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-3">
                  <h3 className="font-bold mb-4">Update Status</h3>
                  <button
                    onClick={() => updateIncidentStatus("resolved")}
                    className="w-full px-4 py-2 bg-green-900/30 text-green-400 border border-green-700 rounded hover:bg-green-900/50 transition font-semibold text-sm"
                  >
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => updateIncidentStatus("assigned")}
                    className="w-full px-4 py-2 bg-blue-900/30 text-blue-400 border border-blue-700 rounded hover:bg-blue-900/50 transition font-semibold text-sm"
                  >
                    Assign Team
                  </button>
                </div>
              )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
