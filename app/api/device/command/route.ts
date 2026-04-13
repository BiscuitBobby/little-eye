import { NextRequest, NextResponse } from 'next/server'
import { deviceStore } from '@/lib/device-store'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const deviceId = searchParams.get('deviceId')

  if (!deviceId) {
    return NextResponse.json({ error: 'deviceId is required' }, { status: 400 })
  }

  const commands = deviceStore.getPendingCommands(deviceId)
  return NextResponse.json({ commands })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.deviceId || !body.command) {
      return NextResponse.json({ error: 'deviceId and command are required' }, { status: 400 })
    }

    const command = deviceStore.addCommand(body.deviceId, body.command)
    return NextResponse.json({ success: true, command })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
