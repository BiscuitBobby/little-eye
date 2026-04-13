import { NextRequest, NextResponse } from 'next/server'
import { deviceStore } from '@/lib/device-store'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.deviceId || !body.title || !body.message) {
      return NextResponse.json({ error: 'deviceId, title, and message are required' }, { status: 400 })
    }

    const notif = deviceStore.addNotification(body)
    return NextResponse.json({ success: true, notification: notif })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
