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
  const id = params.id;

  const [incident, setIncident] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Incident ID is required");
      setIsLoading(false);
      return;
    }

    const fetchIncident = async () => {
      try {
        const res: any = await apiFetch(`/api/incidents/${id}`);
        if (res.status === "success") {
          setIncident(res.data);
        } else {
          setError(res.error || "Incident not found");
        }
      } catch (err: any) {
        setError(err.message || "Unable to load incident details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchIncident();
  }, [id]);

  const reporterName =
    typeof incident?.reporter === "string"
      ? incident.reporter
      : incident?.reporter?.name || "Unknown";
  const reportDate = incident?.created_at
    ? new Date(incident.created_at)
    : null;
  const title = incident?.description
    ? incident.description.split(".")[0]
    : `Incident ${id?.slice(0, 8).toUpperCase()}`;

  const timeline = incident
    ? [
        {
          time:
            reportDate?.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }) || "--:--",
          action: "Incident reported",
          actor: reporterName,
          status: "created",
        },
        {
          time:
            reportDate?.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }) || "--:--",
          action:
            incident.status === "resolved"
              ? "Incident resolved"
              : incident.status === "assigned"
                ? "Investigation assigned"
                : "Awaiting verification",
          actor:
            incident.status === "resolved"
              ? "Safety team"
              : incident.status === "assigned"
                ? "Supervisor"
                : "Safety officer",
          status:
            incident.status === "resolved"
              ? "action"
              : incident.status === "assigned"
                ? "action"
                : "pending",
        },
      ]
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <Link
            href={`/incidents?role=${role}`}
            className="text-orange-400 hover:text-orange-300 text-sm mb-4 inline-block"
          >
            ← Back to Incidents
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-2">
                {id ? `INC-${id.slice(0, 8).toUpperCase()}` : "INC-UNKNOWN"}
              </p>
              <h2 className="text-3xl font-bold mb-2">
                {isLoading
                  ? "Loading incident..."
                  : error
                    ? "Incident details"
                    : title}
              </h2>
            </div>
            <span
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                incident?.severity === "critical"
                  ? "bg-red-900/30 text-red-400"
                  : "bg-orange-900/30 text-orange-400"
              }`}
            >
              {incident?.severity ? incident.severity.toUpperCase() : "N/A"}
            </span>
          </div>
        </div>

        {error ? (
          <div className="bg-red-900/20 border border-red-700 p-8 rounded-xl text-center">
            <p className="text-red-200">{error}</p>
          </div>
        ) : isLoading ? (
          <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-xl text-center">
            <p className="text-gray-300">Loading incident details...</p>
          </div>
        ) : (
          <>
            {incident?.severity === "critical" && (
              <div className="bg-red-900/30 border border-red-700 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle
                  className="text-red-500 shrink-0 mt-0.5"
                  size={20}
                />
                <div>
                  <h3 className="font-semibold text-red-400">
                    Critical Incident - Immediate Action Required
                  </h3>
                  <p className="text-sm text-red-200 mt-1">
                    This is a critical safety incident. Personnel in the
                    affected zone must be alerted immediately.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-6">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4">
                    Incident Description
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {incident.description}
                  </p>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-6">Incident Timeline</h3>
                  <div className="space-y-4">
                    {timeline.map((event, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              event.status === "created"
                                ? "bg-blue-500"
                                : event.status === "alert"
                                  ? "bg-red-500"
                                  : event.status === "action"
                                    ? "bg-orange-500"
                                    : "bg-yellow-500"
                            }`}
                          />
                          {idx < timeline.length - 1 && (
                            <div className="w-0.5 h-12 bg-neutral-700 mt-2" />
                          )}
                        </div>
                        <div className="pb-4">
                          <p className="font-semibold">{event.action}</p>
                          <p className="text-sm text-gray-400 mt-1">
                            {event.actor} • {event.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
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
                    <p className="text-xs text-gray-400 mb-1">Date & Time</p>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-blue-400" />
                      <p className="font-semibold">
                        {reportDate
                          ? `${reportDate.toLocaleDateString()} at ${reportDate.toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}`
                          : "Unknown"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 mb-1">Status</p>
                    <span className="inline-block px-3 py-1 bg-yellow-900/30 text-yellow-400 rounded text-xs font-semibold">
                      {incident.status.replace("-", " ").toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                  <h3 className="font-bold mb-4">Reporter</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center font-bold">
                      {reporterName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{reporterName}</p>
                      {typeof incident.reporter === "object" &&
                        incident.reporter.role && (
                          <p className="text-xs text-gray-400">
                            {incident.reporter.role}
                          </p>
                        )}
                    </div>
                  </div>
                </div>

                {incident.assignedTo && (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                    <h3 className="font-bold mb-4">Assigned To</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold">
                        {incident.assignedTo.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {incident.assignedTo.name}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {(role === "safety_officer" ||
                  role === "admin" ||
                  role === "authority") && (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-3">
                    <h3 className="font-bold mb-4">Actions</h3>
                    <button className="w-full px-4 py-2 bg-green-900/30 text-green-400 border border-green-700 rounded hover:bg-green-900/50 transition font-semibold text-sm">
                      Approve
                    </button>
                    <button className="w-full px-4 py-2 bg-blue-900/30 text-blue-400 border border-blue-700 rounded hover:bg-blue-900/50 transition font-semibold text-sm">
                      Request Review
                    </button>
                    <button className="w-full px-4 py-2 bg-orange-900/30 text-orange-400 border border-orange-700 rounded hover:bg-orange-900/50 transition font-semibold text-sm">
                      Escalate
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
