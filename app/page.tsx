import { MeshGradientSVG } from "@/components/mesh-gradient-svg"
import { DeviceDashboard } from "@/components/device-dashboard"
import { Activity, Shield } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#07070a] flex flex-col relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Subtle radial gradients for depth */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/10 blur-[120px]" />
        
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.85] mix-blend-screen">
          <div className="w-full max-w-2xl transform scale-125 md:scale-150 transition-transform duration-1000 ease-in-out">
            <MeshGradientSVG />
          </div>
        </div>
      </div>


      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-8 relative z-10">
        <DeviceDashboard />
      </main>
      
      {/* Footer Status Bar */}
      <footer className="relative z-20 flex items-center justify-between px-6 py-3 border-t border-white/5 bg-black/40 backdrop-blur-md text-xs text-gray-400 font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-500" />
            Network: Stable
          </span>
          <span className="hidden md:inline">Latency: 24ms</span>
        </div>
        <div>
          Last Sync: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </div>
      </footer>
    </div>
  )
}
