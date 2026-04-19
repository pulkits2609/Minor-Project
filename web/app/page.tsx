import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-8 py-5 border-b border-neutral-800">
        <h1 className="text-xl font-bold">MineOps</h1>

        <Link href="/login">
          <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition">
            Login
          </button>
        </Link>
      </nav>

      {/* HERO */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Coal Mine Safety <br /> & Productivity System
        </h1>

        <p className="text-gray-400 max-w-xl mb-8">
          Real-time monitoring, incident reporting, and role-based control for
          safer and smarter mining operations.
        </p>

        <div className="flex gap-4">
          <Link href="/login">
            <button className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition font-semibold">
              Get Started
            </button>
          </Link>

          <Link href="/login?demo=true">
            <button className="px-6 py-3 border border-orange-500 text-orange-500 hover:bg-orange-500/10 rounded-xl transition font-semibold">
              Demo Mode
            </button>
          </Link>
        </div>

        {/* QUICK ACCESS */}
        <div className="mt-12 grid grid-cols-5 gap-6 max-w-4xl">
          <Link href="/login?role=worker">
            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-orange-600/50 transition cursor-pointer text-center">
              <div className="text-2xl mb-2">👷</div>
              <p className="text-sm font-semibold">Worker Portal</p>
            </div>
          </Link>
          <Link href="/login?role=supervisor">
            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-orange-600/50 transition cursor-pointer text-center">
              <div className="text-2xl mb-2">👔</div>
              <p className="text-sm font-semibold">Supervisor</p>
            </div>
          </Link>
          <Link href="/login?role=safety">
            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-orange-600/50 transition cursor-pointer text-center">
              <div className="text-2xl mb-2">🛡️</div>
              <p className="text-sm font-semibold">Safety Officer</p>
            </div>
          </Link>
          <Link href="/login?role=admin">
            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-orange-600/50 transition cursor-pointer text-center">
              <div className="text-2xl mb-2">⚙️</div>
              <p className="text-sm font-semibold">Administrator</p>
            </div>
          </Link>
          <Link href="/login?role=authority">
            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-orange-600/50 transition cursor-pointer text-center">
              <div className="text-2xl mb-2">🏛️</div>
              <p className="text-sm font-semibold">Authority</p>
            </div>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center text-gray-500 py-4 border-t border-neutral-800">
        © 2026 MineOps - Coal Mine Safety System
      </footer>
    </div>
  );
}
