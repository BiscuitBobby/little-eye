"use client"

import { Smartphone } from "lucide-react"
import { MOCK_PHONES, type Phone } from "./device-dashboard"

interface PhoneDeviceListProps {
  selectedPhone: Phone | null
  onSelectPhone: (phone: Phone) => void
}

export function PhoneDeviceList({ selectedPhone, onSelectPhone }: PhoneDeviceListProps) {
  return (
    <div className="w-80 flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Devices</h2>
        <p className="text-sm text-gray-400">Select a phone to manage</p>
      </div>

      <div className="flex flex-col gap-2">
        {MOCK_PHONES.map((phone) => (
          <button
            key={phone.id}
            onClick={() => onSelectPhone(phone)}
            className={`p-4 rounded-lg text-left transition-all ${
              selectedPhone?.id === phone.id
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "bg-gray-900 text-gray-200 hover:bg-gray-800 border border-gray-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{phone.name}</p>
                  <p className="text-xs opacity-75 truncate">{phone.model}</p>
                </div>
              </div>
              <div
                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  phone.status === "online" ? "bg-green-500" : "bg-red-500"
                }`}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
