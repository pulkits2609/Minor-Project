/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function SidebarSkeleton() {
  return (
    <div
      className="h-screen bg-neutral-950 border-r border-white/[0.06]"
      style={{ width: "260px", minWidth: "260px" }}
    />
  );
}

function NavbarSkeleton() {
  return (
    <div
      className="border-b border-white/[0.06] bg-neutral-950/85"
      style={{ height: "64px" }}
    />
  );
}

export default function DashboardLayout({ children }: any) {
  return (
    <div className="flex h-screen bg-neutral-950 text-white overflow-hidden">
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />
      </Suspense>

      <div className="flex-1 flex flex-col min-w-0">
        <Suspense fallback={<NavbarSkeleton />}>
          <Navbar />
        </Suspense>

        <main
          className="flex-1 overflow-y-auto relative"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(249,115,22,0.05) 0%, transparent 60%), #0a0a0a",
          }}
        >
          <div className="absolute inset-0 bg-dot-pattern opacity-40 pointer-events-none" />
          <div className="relative z-10 p-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
