"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Send, ArrowLeft } from "lucide-react"
import { MOCK_NOTIFICATIONS, type Phone } from "./device-dashboard"

interface PhoneDetailsPanelProps {
  phone: Phone
  onBack: () => void
}

export function PhoneDetailsPanel({ phone, onBack }: PhoneDetailsPanelProps) {
  const [command, setCommand] = useState("")
  const [commandHistory, setCommandHistory] = useState<string[]>([])

  const handleSendCommand = () => {
    if (command.trim()) {
      const timestamp = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      setCommandHistory([`[${timestamp}] ${command}`, ...commandHistory])
      setCommand("")
    }
  }

  const notifications = MOCK_NOTIFICATIONS[phone.id] || []

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">{phone.name}</h1>
          <p className="text-gray-400 text-sm mt-1">
            {phone.model} • {phone.status === "online" ? "🟢 Online" : "🔴 Offline"}
          </p>
        </div>
      </div>

      {/* Notifications and Commands Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications Panel */}
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            <CardDescription>Recent phone events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg text-sm border-l-4 ${
                      notification.type === "error"
                        ? "border-red-500 bg-red-500/10 text-red-200"
                        : notification.type === "warning"
                          ? "border-yellow-500 bg-yellow-500/10 text-yellow-200"
                          : "border-blue-500 bg-blue-500/10 text-blue-200"
                    }`}
                  >
                    <p className="font-medium">{notification.message}</p>
                    <p className="text-xs opacity-75 mt-1">{notification.timestamp}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No notifications</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Remote Commands Panel */}
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Send className="w-5 h-5" />
              Remote Commands
            </CardTitle>
            <CardDescription>Send commands to this device</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter command..."
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendCommand()}
                className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
              />
              <Button
                onClick={handleSendCommand}
                disabled={!command.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Send
              </Button>
            </div>

            {/* Command History */}
            <div className="bg-black/30 rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-xs text-green-400 border border-gray-800">
              {commandHistory.length > 0 ? (
                <div className="space-y-1">
                  {commandHistory.map((cmd, idx) => (
                    <div key={idx} className="text-green-400">
                      {cmd}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No commands sent yet. Try: "power on", "update", "restart"</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
