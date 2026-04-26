"use client";
export const dynamic = 'force-dynamic';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Lock, Bell, User } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

export function SettingsContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "worker";

  const [activeTab, setActiveTab] = useState("account");
  const [settings] = useState({
    email: "user@coalmine.com",
    notifications: true,
    emailAlerts: true,
    twoFactor: true,
  });

  const tabs = [
    { id: "account", label: "Account Settings", icon: <User size={18} /> },
    { id: "security", label: "Security", icon: <Lock size={18} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div>
          <h2 className="text-3xl font-bold mb-2">Settings</h2>
          <p className="text-gray-400">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {/* SIDEBAR TABS */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 h-fit">
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === tab.id
                      ? "bg-orange-600 text-white"
                      : "text-gray-400 hover:bg-neutral-800"
                  }`}
                >
                  {tab.icon}
                  <span className="font-semibold text-sm">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* CONTENT */}
          <div className="col-span-3 space-y-4">
            {/* ACCOUNT SETTINGS */}
            {activeTab === "account" && (
              <div className="space-y-6">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-6">
                    Profile Information
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        defaultValue="Rahul Das"
                        className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        defaultValue={settings.email}
                        className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Employee ID
                      </label>
                      <input
                        type="text"
                        defaultValue="EMP-001"
                        disabled
                        className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Role
                      </label>
                      <input
                        type="text"
                        defaultValue={
                          role.charAt(0).toUpperCase() + role.slice(1)
                        }
                        disabled
                        className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg opacity-50 capitalize"
                      />
                    </div>

                    <button className="w-full py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition mt-4">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY SETTINGS */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-6">Security Settings</h3>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg">
                      <div>
                        <p className="font-semibold mb-1">
                          Two-Factor Authentication
                        </p>
                        <p className="text-sm text-gray-400">
                          Add an extra layer of security
                        </p>
                      </div>
                      <button
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                          settings.twoFactor
                            ? "bg-green-600 text-white"
                            : "bg-neutral-700 text-gray-300"
                        }`}
                      >
                        {settings.twoFactor ? "Enabled" : "Disabled"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg">
                      <div>
                        <p className="font-semibold mb-1">Password</p>
                        <p className="text-sm text-gray-400">
                          Change your password
                        </p>
                      </div>
                      <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold text-sm transition">
                        Change
                      </button>
                    </div>

                    <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
                      <p className="font-semibold mb-2">Danger Zone</p>
                      <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold text-sm transition">
                        Logout All Sessions
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATION SETTINGS */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-6">
                    Notification Preferences
                  </h3>

                  <div className="space-y-4">
                    {[
                      {
                        label: "Critical Alerts",
                        desc: "Immediate notification for critical safety alerts",
                      },
                      {
                        label: "Incident Reports",
                        desc: "Notifications when incidents are reported",
                      },
                      {
                        label: "Task Updates",
                        desc: "Updates on assigned tasks",
                      },
                      {
                        label: "System Maintenance",
                        desc: "Scheduled maintenance notifications",
                      },
                      {
                        label: "Weekly Reports",
                        desc: "Weekly summary reports",
                      },
                      {
                        label: "Email Notifications",
                        desc: "Receive notifications via email",
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg"
                      >
                        <div>
                          <p className="font-semibold">{item.label}</p>
                          <p className="text-sm text-gray-400">{item.desc}</p>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked={
                            idx < 4 || (idx === 5 && settings.emailAlerts)
                          }
                          className="w-5 h-5 rounded cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div>Loading settings...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
  