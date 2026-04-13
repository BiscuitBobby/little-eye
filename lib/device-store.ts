// Simple in-memory storage for device interaction
// In a real app, this would be a database

export interface Device {
  id: string
  name: string
  type: string
  status: 'online' | 'offline'
  battery?: number
  signal?: number
  lastSeen: number
}

export interface Notification {
  id: string
  deviceId: string
  title: string
  message: string
  time: string
  type: 'info' | 'warning' | 'error'
}

export interface Command {
  id: string
  deviceId: string
  command: string
  status: 'pending' | 'sent' | 'executed'
  output?: string
  timestamp: string
}

class DeviceStore {
  private devices: Map<string, Device> = new Map()
  private notifications: Map<string, Notification[]> = new Map()
  private commands: Map<string, Command[]> = new Map()

  constructor() {
    // Optional: Add some initial mock data for visualization
    // However, the goal is for devices to ping and register themselves.
  }

  ping(device: Partial<Device> & { id: string }) {
    const existing = this.devices.get(device.id)
    const updatedDevice: Device = {
      id: device.id,
      name: device.name || existing?.name || 'Unknown Device',
      type: device.type || existing?.type || 'phone',
      status: 'online',
      battery: device.battery ?? existing?.battery,
      signal: device.signal ?? existing?.signal,
      lastSeen: Date.now(),
    }
    this.devices.set(device.id, updatedDevice)
    return updatedDevice
  }

  getDevices() {
    // Mark devices as offline if not seen in the last 15 seconds
    const now = Date.now()
    const devicesList = Array.from(this.devices.values()).map(d => {
      if (now - d.lastSeen > 15000) {
        return { ...d, status: 'offline' as const }
      }
      return d
    })
    return devicesList
  }

  addNotification(notif: Omit<Notification, 'id' | 'time'>) {
    const id = `n${Date.now()}`
    const time = 'Just now'
    const fullNotif: Notification = { ...notif, id, time }
    
    if (!this.notifications.has(notif.deviceId)) {
      this.notifications.set(notif.deviceId, [])
    }
    this.notifications.get(notif.deviceId)?.unshift(fullNotif)
    return fullNotif
  }

  getNotifications(deviceId: string) {
    return this.notifications.get(deviceId) || []
  }

  getAllNotifications() {
    const all: Record<string, Notification[]> = {}
    this.notifications.forEach((notifs, id) => {
      all[id] = notifs
    })
    return all
  }

  addCommand(deviceId: string, commandText: string) {
    const cmd: Command = {
      id: `cmd${Date.now()}`,
      deviceId,
      command: commandText,
      status: 'pending',
      timestamp: 'Now',
    }
    if (!this.commands.has(deviceId)) {
      this.commands.set(deviceId, [])
    }
    this.commands.get(deviceId)?.unshift(cmd)
    return cmd
  }

  getPendingCommands(deviceId: string) {
    const cmds = this.commands.get(deviceId) || []
    const pending = cmds.filter(c => c.status === 'pending')
    // Mark as sent when fetched
    pending.forEach(c => c.status = 'sent')
    return pending
  }

  updateCommandOutput(deviceId: string, commandId: string, output: string) {
    const cmds = this.commands.get(deviceId) || []
    const cmd = cmds.find(c => c.id === commandId)
    if (cmd) {
      cmd.output = output
      cmd.status = 'executed'
      cmd.timestamp = 'Just now'
      return true
    }
    return false
  }

  getCommandOutputs(deviceId: string) {
    return this.commands.get(deviceId) || []
  }

  getAllCommandOutputs() {
    const all: Record<string, Command[]> = {}
    this.commands.forEach((cmds, id) => {
      all[id] = cmds
    })
    return all
  }
}

// Singleton instance
export const deviceStore = new DeviceStore()
