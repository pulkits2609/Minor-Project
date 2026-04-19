/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { AlertCircle, Plus, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function ReportIncidentPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "worker";

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    zone: "Zone A",
    severity: "medium",
    type: "safety-hazard",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        title: "",
        description: "",
        zone: "Zone A",
        severity: "medium",
        type: "safety-hazard",
      });
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* HEADER */}
        <div>
          <Link
            href={`/dashboard/${role}?role=${role}`}
            className="text-orange-400 hover:text-orange-300 text-sm mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h2 className="text-3xl font-bold mb-2">Report Incident</h2>
          <p className="text-gray-400">
            Report a safety concern or hazard immediately
          </p>
        </div>

        {submitted ? (
          <div className="bg-green-900/20 border border-green-700 p-8 rounded-xl text-center">
            <div className="text-4xl mb-4">✓</div>
            <h3 className="text-2xl font-bold text-green-400 mb-2">
              Incident Reported
            </h3>
            <p className="text-gray-400">
              Your incident report has been submitted. Reference:{" "}
              <span className="font-semibold text-white">
                INC-{Math.random().toString(36).substring(7).toUpperCase()}
              </span>
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 space-y-6"
          >
            {/* INCIDENT TYPE */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Incident Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="safety-hazard">Safety Hazard</option>
                <option value="equipment-malfunction">
                  Equipment Malfunction
                </option>
                <option value="near-miss">Near Miss</option>
                <option value="injury">Injury</option>
                <option value="environmental">Environmental Issue</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* TITLE */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Incident Title *
              </label>
              <input
                type="text"
                name="title"
                placeholder="Brief description of the incident"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Detailed Description *
              </label>
              <textarea
                name="description"
                placeholder="Provide detailed information about the incident..."
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              />
            </div>

            {/* ZONE & SEVERITY */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Zone *
                </label>
                <select
                  name="zone"
                  value={formData.zone}
                  onChange={handleChange}
                  required
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="Zone A">Zone A</option>
                  <option value="Zone B">Zone B</option>
                  <option value="Zone C">Zone C</option>
                  <option value="Zone D">Zone D</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Severity *
                </label>
                <select
                  name="severity"
                  value={formData.severity}
                  onChange={handleChange}
                  required
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            {/* SUBMIT */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition"
              >
                Submit Incident Report
              </button>
              <Link href={`/dashboard/${role}?role=${role}`}>
                <button
                  type="button"
                  className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </Link>
            </div>

            <p className="text-xs text-gray-400 text-center">
              Your report is confidential and will be reviewed by the safety
              team.
            </p>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
