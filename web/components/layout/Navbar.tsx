"use client";
import { Bell, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function Navbar() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "worker";

  return (
    <div className="flex justify-between items-center p-4 border-b border-neutral-800 bg-neutral-900">
      <h1 className="font-semibold text-lg">{role.toUpperCase()} Dashboard</h1>

      <div className="flex items-center gap-6">
        <div className="relative cursor-pointer hover:bg-neutral-800 p-2 rounded-lg transition">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>

        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center font-bold cursor-pointer hover:bg-orange-600 transition">
          R
        </div>

        <Link
          href="/settings"
          className="hover:bg-neutral-800 p-2 rounded-lg transition"
        >
          <Settings size={20} />
        </Link>

        <Link
          href="/login"
          className="hover:bg-neutral-800 p-2 rounded-lg transition"
        >
          <LogOut size={20} />
        </Link>
      </div>
    </div>
  );
}
