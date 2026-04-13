import requests
import time
import json
import random

BASE_URL = "http://localhost:3000/api"
DEVICE_ID = "nexus-6p-test"
DEVICE_NAME = "Nexus 6P (Simulated)"

def ping():
    print(f"[*] Pinging as {DEVICE_NAME}...")
    try:
        res = requests.post(f"{BASE_URL}/device/ping", json={
            "id": DEVICE_ID,
            "name": DEVICE_NAME,
            "type": "phone",
            "battery": random.randint(10, 100),
            "signal": random.randint(1, 5)
        })
        return res.json()
    except Exception as e:
        print(f"[!] Ping failed: {e}")
        return None

def check_commands():
    try:
        res = requests.get(f"{BASE_URL}/device/command?deviceId={DEVICE_ID}")
        commands = res.json().get("commands", [])
        for cmd in commands:
            print(f"[+] Received command: {cmd['command']}")
            execute_command(cmd)
    except Exception as e:
        print(f"[!] Command check failed: {e}")

def execute_command(cmd):
    # Simulate execution
    output = f"Simulated output for: {cmd['command']}\n"
    if "df" in cmd['command']:
        output += "Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1       100G   20G   80G  20% /"
    elif "uptime" in cmd['command']:
        output += "15:42:01 up 14 days,  2:34,  1 user,  load average: 0.08, 0.03, 0.01"
    else:
        output += f"Success: {cmd['command']} executed."
    
    # Send output back
    try:
        requests.post(f"{BASE_URL}/device/command/output", json={
            "deviceId": DEVICE_ID,
            "commandId": cmd['id'],
            "output": output
        })
        print(f"[>] Sent output for {cmd['id']}")
    except Exception as e:
        print(f"[!] Failed to send output: {e}")

def send_random_notification():
    if random.random() > 0.8: # 20% chance
        notifs = [
            {"title": "System Update", "message": "A new OTA update is available.", "type": "info"},
            {"title": "High CPU", "message": "System temperature is rising.", "type": "warning"},
            {"title": "App Crash", "message": "System UI has stopped working.", "type": "error"}
        ]
        n = random.choice(notifs)
        print(f"[*] Sending notification: {n['title']}")
        try:
            requests.post(f"{BASE_URL}/device/notification", json={
                "deviceId": DEVICE_ID,
                **n
            })
        except Exception as e:
            print(f"[!] Failed to send notification: {e}")

if __name__ == "__main__":
    print(f"--- Little Eye Device Simulator ---")
    print(f"Target: {BASE_URL}")
    print(f"Device: {DEVICE_ID}")
    print(f"Press Ctrl+C to stop.")
    
    while True:
        ping()
        check_commands()
        send_random_notification()
        time.sleep(5) # Poll every 5 seconds
