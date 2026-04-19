/* eslint-disable @typescript-eslint/no-explicit-any */
import Sidebar from "./Sidebar"
import Navbar from "./Navbar"

export default function DashboardLayout({ children }: any) {
  return (
    <div className="flex h-screen bg-neutral-950 text-white">
      
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />
        
        <main className="p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}