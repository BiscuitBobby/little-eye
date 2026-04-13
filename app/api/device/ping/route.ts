import { NextRequest, NextResponse } from 'next/server'
import { deviceStore } from '@/lib/device-store'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) {
      return NextResponse.json({ error: 'Device ID is required' }, { status: 400 })
    }

    const device = deviceStore.ping(body)
    return NextResponse.json({ success: true, device })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
