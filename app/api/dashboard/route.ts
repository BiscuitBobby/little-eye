import { NextRequest, NextResponse } from 'next/server'
import { deviceStore } from '@/lib/device-store'

export async function GET(req: NextRequest) {
  const devices = deviceStore.getDevices()
  const notifications = deviceStore.getAllNotifications()
  const commands = deviceStore.getAllCommandOutputs()

  return NextResponse.json({
    devices,
    notifications,
    commands
  })
}
