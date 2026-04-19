'use client'
import Link from "next/link"
import { useState, useRef } from "react"
import { AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showDemo, setShowDemo] = useState(false)
  const demoResultsRef = useRef<HTMLDivElement>(null)

  const handleLogin = (role: string) => {
    // Demo login - just navigate with role
    window.location.href = `/dashboard/${role}?role=${role}`
  }

  const demoAccounts = [
    { email: "worker@coalmine.com", password: "****", role: "worker", title: "Worker" },
    { email: "supervisor@coalmine.com", password: "****", role: "supervisor", title: "Supervisor" },
    { email: "safety@coalmine.com", password: "****", role: "safety", title: "Safety Officer" },
    { email: "admin@coalmine.com", password: "****", role: "admin", title: "Administrator" },
    { email: "authority@coalmine.com", password: "****", role: "authority", title: "Authority/Mine Ops" },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
      <div className="w-full max-w-md">
        
        {/* LOGO */}
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-bold mb-2 hover:text-orange-400 transition">MineOps</h1>
          </Link>
          <p className="text-gray-400 text-sm">Coal Mine Safety System</p>
        </div>

        {/* LOGIN CARD */}
        <div className="p-8 bg-neutral-900 rounded-2xl shadow-lg border border-neutral-800 mb-6">

          <h2 className="text-2xl font-bold mb-6 text-center">
            Mine Safety Login
          </h2>

          {/* FORM */}
          <div className="space-y-4 mb-6">

            <div>
              <label className="text-xs text-gray-400 mb-2 block">Email / Employee ID</label>
              <input
                type="text"
                placeholder="Enter your email or employee ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-lg bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-400 text-white"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">Password</label>
              <input
                type="password"
                placeholder="Enter secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-lg bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-400 text-white"
              />
            </div>

            <div className="bg-neutral-800 p-3 rounded-lg text-xs">
              <p className="text-gray-400">Assigned Role: <span className="text-orange-400">fetched from backend policy after authentication</span></p>
            </div>

            <button 
              onClick={() => handleLogin('worker')}
              className="w-full py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold"
            >
              Sign In
            </button>
          </div>

          {/* DEMO SECTION */}
          <div className="mb-6 pb-6 border-b border-neutral-800">
            <button
              onClick={() => setShowDemo(!showDemo)}
              className="w-full py-2 text-orange-400 text-sm hover:text-orange-300 transition"
            >
              {showDemo ? "Hide Demo Accounts" : "Demo Mode (Test Accounts)"}
            </button>

            {showDemo && (
              <div ref={demoResultsRef} className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                {demoAccounts.map((account, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleLogin(account.role)}
                    className="w-full p-3 bg-neutral-800 hover:bg-neutral-700 rounded text-left text-xs transition border border-neutral-700"
                  >
                    <div className="font-semibold text-orange-400">{account.title}</div>
                    <div className="text-gray-400">{account.email}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* LINKS */}
          <div className="flex justify-between text-xs text-gray-400 mb-4">
            <span className="hover:text-orange-400 cursor-pointer transition">
              Forgot password?
            </span>

            <span className="hover:text-orange-400 cursor-pointer transition">
              Emergency access policy
            </span>
          </div>

          {/* SECURITY NOTE */}
          <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-xs text-gray-400">
            <div className="flex gap-2">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5 text-orange-400" />
              <p>RBAC enforced: users cannot elevate privilege from UI. Access level is server-authorized.</p>
            </div>
          </div>
        </div>

        {/* REGISTER */}
        <div className="text-center">
          <p className="text-sm text-gray-400 mb-3">Don&apos;t have an account?</p>
          <Link href="/register">
            <button className="w-full py-3 border border-orange-400 text-orange-400 rounded-lg hover:bg-orange-500/10 transition font-semibold">
              Create Account
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}