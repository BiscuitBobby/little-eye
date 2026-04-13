"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Bell, Send, Smartphone, Laptop, Tablet, Watch, Wifi, Zap, Battery, Terminal, Copy, AlertTriangle, AlertCircle, Info, Trash2, Shield, Activity } from "lucide-react"

interface Device {
  id: string
  name: string
  type: "phone" | "laptop" | "tablet" | "smartwatch"
  status: "online" | "offline"
  battery?: number
  signal?: number
}

interface Notification {
  id: string
  title: string
  message: string
  time: string
  type: "info" | "warning" | "error"
}

interface CommandOutput {
  id: string
  command: string
  output: string
  timestamp: string
  status: "success" | "error"
}

export function DeviceDashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [notifications, setNotifications] = useState<Record<string, Notification[]>>({});
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [commandInput, setCommandInput] = useState("")
  const [commandOutputs, setCommandOutputs] = useState<Record<string, CommandOutput[]>>({})
  const [isLoading, setIsLoading] = useState(true);

  // Poll for dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/dashboard');
        const data = await res.json();
        setDevices(data.devices);
        setNotifications(data.notifications);
        
        // Map backend Command to frontend CommandOutput
        const mappedCommands: Record<string, CommandOutput[]> = {};
        Object.keys(data.commands).forEach(deviceId => {
          mappedCommands[deviceId] = data.commands[deviceId].map((c: any) => ({
            id: c.id,
            command: c.command,
            output: c.output || (c.status === 'sent' ? 'Waiting for output...' : 'Command pending...'),
            timestamp: c.timestamp,
            status: c.status === 'executed' ? 'success' : 'error'
          }));
        });
        setCommandOutputs(mappedCommands);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: Device["status"]) => {
    return status === "online"
      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
      : "bg-red-500/20 border-red-500/50 text-red-300"
  }

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "warning":
        return { bg: "bg-yellow-500/10 border-yellow-500/30", text: "text-yellow-300", icon: <AlertTriangle className="w-4 h-4 text-yellow-500" /> }
      case "error":
        return { bg: "bg-red-500/10 border-red-500/30", text: "text-red-300", icon: <AlertCircle className="w-4 h-4 text-red-500" /> }
      default:
        return { bg: "bg-cyan-500/10 border-cyan-500/30", text: "text-cyan-300", icon: <Info className="w-4 h-4 text-cyan-500" /> }
    }
  }

  const getDeviceIcon = (type: Device["type"], className = "w-5 h-5 text-white") => {
    switch (type) {
      case "laptop": return <Laptop className={className} />
      case "tablet": return <Tablet className={className} />
      case "smartwatch": return <Watch className={className} />
      case "phone":
      default: return <Smartphone className={className} />
    }
  }

  const getBatteryColor = (level: number) => {
    if (level > 60) return "from-emerald-400 to-emerald-500"
    if (level > 20) return "from-amber-400 to-amber-500"
    return "from-red-400 to-red-500"
  }

  const clearTerminal = () => {
    if(!selectedDevice) return
    setCommandOutputs((prev) => ({
      ...prev,
      [selectedDevice.id]: [],
    }))
  }

  const quickCommands = ["df -h", "ps aux", "uptime"]


  const handleSendCommand = async () => {
    if (!commandInput.trim() || !selectedDevice) return

    const cmdText = commandInput;
    setCommandInput("")

    try {
      const res = await fetch('/api/device/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: selectedDevice.id, command: cmdText }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to send command');
      }
      
      // We don't need to manually update state here, 
      // the polling will pick up the new command and its eventual output.
    } catch (error) {
      console.error('Error sending command:', error);
    }
  }

  return (
    <div className="w-full max-w-6xl">
      {/* Device Grid */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-6 tracking-tight">
          Connected Devices
        </h1>
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {devices.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 bg-cyan-500/20 rounded-full animate-ping opacity-20" />
                <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                  <Activity className="w-8 h-8 text-cyan-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Scanning for Devices</h3>
              <p className="text-gray-400 max-w-xs mx-auto">Connecting your first device will activate the dashboard.</p>
            </div>
          ) : (
            devices.map((device) => {
              const notifCount = (notifications[device.id] || []).length;
              return (
              <motion.button
                key={device.id}
                onClick={() => setSelectedDevice(device)}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-5 rounded-xl border transition-all duration-300 text-left backdrop-blur-sm shadow-sm group ${
                  selectedDevice?.id === device.id
                    ? "bg-cyan-900/20 border-cyan-400/50 shadow-lg shadow-cyan-500/10"
                    : "bg-white/3 border-white/5 hover:border-white/20 hover:bg-white/5"
                }`}
              >
                {/* Notification Badge Badge */}
                {notifCount > 0 && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full shadow-lg border-2 border-[#0f0f13] z-10">
                    {notifCount}
                  </div>
                )}
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/5 shadow-inner group-hover:scale-110 transition-transform">
                    {getDeviceIcon(device.type as any, "w-5 h-5 text-white/90")}
                  </div>
                  <div className="flex items-center gap-2">
                    {device.status === "online" && (
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                    )}
                    <div
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border tracking-wide uppercase ${getStatusColor(
                        device.status
                      )}`}
                    >
                      {device.status === "online" ? "Online" : "Offline"}
                    </div>
                  </div>
                </div>

                <h3 className="font-semibold text-white mb-3 line-clamp-2">
                  {device.name}
                </h3>

                {device.battery !== undefined && (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-gray-400">
                      <span>Battery</span>
                      <span className="text-white font-medium">{device.battery}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden shadow-inner flex">
                      <div
                        className={`h-full bg-gradient-to-r rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)] ${getBatteryColor(device.battery)}`}
                        style={{ width: `${device.battery}%` }}
                      />
                    </div>
                  </div>
                )}

                {device.signal !== undefined && (
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">Signal</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(level => (
                        <div 
                          key={level} 
                          className={`w-1 h-3 rounded-full ${level <= device.signal! ? 'bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.5)]' : 'bg-white/10'}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </motion.button>
              )
            })
          )}
        </motion.div>
      </div>

      {/* Panel - Detail View */}
      <AnimatePresence>
        {selectedDevice && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative bg-gradient-to-br from-white/3 to-white/1 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/20">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl relative">
                  {getDeviceIcon(selectedDevice.type, "w-6 h-6 text-cyan-400")}
                  {selectedDevice.status === 'online' && (
                    <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#15151a] shadow-sm transform translate-x-1/3 -translate-y-1/3" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                    {selectedDevice.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mt-1">
                     <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${selectedDevice.status === 'online' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {selectedDevice.status.toUpperCase()}
                     </span>
                     <span className="capitalize">{selectedDevice.type}</span>
                     {selectedDevice.battery !== undefined && (
                       <span className="flex items-center gap-1">
                          <Battery className="w-3.5 h-3.5" /> {selectedDevice.battery}%
                       </span>
                     )}
                  </div>
                </div>
              </div>
              <motion.button
                onClick={() => setSelectedDevice(null)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </motion.button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              {/* Notifications Section */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-semibold text-white">Notifications</h3>
                </div>

                <div className="space-y-3 overflow-y-auto pr-2 flex-1 scrollbar-thin">
                  {(notifications[selectedDevice.id] || []).length > 0 ? (
                    notifications[selectedDevice.id].map((notif) => {
                      const style = getNotificationColor(notif.type);
                      return (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 rounded-xl border ${style.bg} backdrop-blur-sm flex-shrink-0 relative overflow-hidden`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 shadow-sm">{style.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className={`font-semibold ${style.text}`}>{notif.title}</h4>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/20 text-gray-400 border border-white/5 opacity-80">{notif.time}</span>
                            </div>
                            <p className="text-sm text-gray-300 leading-snug">{notif.message}</p>
                          </div>
                        </div>
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-current opacity-20" style={{ color: "inherit" }} />
                      </motion.div>
                    )})
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No notifications</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Commands Section */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <Terminal className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-semibold text-white">Commands</h3>
                </div>

                <div className="flex flex-col flex-1 gap-4">
                  {/* Shell Output */}
                  <div className="flex-1 bg-[#0a0a0f] border border-white/10 rounded-xl overflow-hidden flex flex-col shadow-inner relative">
                    
                    {/* MacOS Style Terminal Header */}
                    <div className="bg-[#1a1b23] px-4 py-2.5 border-b border-white/5 flex items-center justify-between flex-shrink-0 select-none">
                      <div className="flex gap-2 items-center">
                        <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors cursor-pointer" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition-colors cursor-pointer" />
                      </div>
                      <span className="text-xs font-mono text-gray-400 absolute left-1/2 -translate-x-1/2 font-semibold">
                        admin@{selectedDevice.name.toLowerCase().replace(/\s+/g, '-')}: ~
                      </span>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={clearTerminal}
                          className="p-1.5 hover:bg-white/10 rounded-md transition-colors group" 
                          title="Clear Output"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-gray-500 group-hover:text-red-400" />
                        </button>
                        <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors" title="Copy Output">
                          <Copy className="w-3.5 h-3.5 text-gray-500 hover:text-gray-300" />
                        </button>
                      </div>
                    </div>

                    <div className="overflow-y-auto flex-1 scrollbar-thin">
                      {(commandOutputs[selectedDevice.id] || []).length > 0 ? (
                        <div className="space-y-4 p-4">
                          {commandOutputs[selectedDevice.id].map((cmd) => (
                            <motion.div
                              key={cmd.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="space-y-2"
                            >
                              <div className="flex items-baseline gap-2">
                                <span className="text-cyan-400 font-mono text-sm">$</span>
                                <span className="text-white font-mono text-sm">{cmd.command}</span>
                                <span
                                  className={`text-xs font-mono ml-auto ${
                                    cmd.status === "success"
                                      ? "text-emerald-400"
                                      : "text-red-400"
                                  }`}
                                >
                                  {cmd.timestamp}
                                </span>
                              </div>
                              <pre className="text-gray-300 font-mono text-xs whitespace-pre-wrap overflow-x-auto bg-black/40 p-3 rounded-lg border border-white/5 mt-1">
                                {cmd.output}
                              </pre>
                            </motion.div>
                          ))}
                          {/* Blinking Cursor Indicator */}
                          <div className="flex items-center gap-2 mt-4 text-cyan-400 font-mono text-sm opacity-80">
                             <span>$</span>
                             <div className="w-2.5 h-5 bg-cyan-400 animate-typing-cursor" />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-600 h-full flex flex-col items-center justify-center">
                          <Terminal className="w-10 h-10 mb-3 opacity-20" />
                          <p className="text-sm font-mono">Ready for input.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Command Input */}
                  <div className="space-y-3 flex-shrink-0">
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                      {quickCommands.map(cmd => (
                        <button
                          key={cmd}
                          onClick={() => setCommandInput(cmd)}
                          className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-gray-400 hover:bg-white/10 hover:text-white transition-colors whitespace-nowrap"
                        >
                          {cmd}
                        </button>
                      ))}
                    </div>
                    <div className="relative flex gap-2">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500 font-mono text-sm pointer-events-none">$</div>
                      <input
                        type="text"
                        value={commandInput}
                        onChange={(e) => setCommandInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleSendCommand()
                          }
                        }}
                        placeholder="Enter command..."
                        className="flex-1 pl-8 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-600 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition-all shadow-inner"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSendCommand}
                        disabled={selectedDevice.status === "offline" || !commandInput.trim()}
                        className="p-3 rounded-xl bg-cyan-600 border border-cyan-500 text-white shadow-lg shadow-cyan-900/30 hover:bg-cyan-500 hover:border-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        <Send className="w-4 h-4 ml-0.5" />
                      </motion.button>
                    </div>

                    <div className="text-xs text-gray-500 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" />
                      Press Enter to execute. Commands sent over secure channel.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
