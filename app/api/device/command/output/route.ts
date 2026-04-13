import { NextRequest, NextResponse } from 'next/server'
import { deviceStore } from '@/lib/device-store'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.deviceId || !body.commandId || body.output === undefined) {
      return NextResponse.json({ error: 'deviceId, commandId, and output are required' }, { status: 400 })
    }

    const success = deviceStore.updateCommandOutput(body.deviceId, body.commandId, body.output)
    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: 'Command not found' }, { status: 404 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
