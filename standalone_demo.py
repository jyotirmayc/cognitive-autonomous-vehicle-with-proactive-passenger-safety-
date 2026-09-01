import asyncio
import websockets
import json
import time
import threading

# Global state to simulate the "Brain"
state = {
    "/safe_cmd_vel": {"linear": {"x": 2.5, "y": 0, "z": 0}, "angular": {"x": 0, "y": 0, "z": 0}},
    "/driver_state": {"data": "NORMAL"},
    "/alcohol_interlock_state": {"data": "DRIVE_ENABLED"},
    "/gas_state": {"data": json.dumps({"status": "SAFE"})},
    "/door_state": {"data": "UNLOCKED"},
    "/cabin_state": {"data": json.dumps({"status": "NORMAL"})},
    "/world_state": {"data": json.dumps({"tracked_objects": [1, 2, 3]})},
}

# Keep track of connected clients (the dashboard)
connected_clients = set()

def create_ros_message(topic, msg_content):
    """Formats a message exactly how roslibjs expects it from rosbridge."""
    return json.dumps({
        "op": "publish",
        "topic": topic,
        "msg": msg_content
    })

async def broadcast_state():
    """Continuously broadcast the current state to the dashboard at 10Hz."""
    while True:
        if connected_clients:
            for topic, msg_content in state.items():
                msg = create_ros_message(topic, msg_content)
                # Send to all clients
                for ws in list(connected_clients):
                    try:
                        await ws.send(msg)
                    except websockets.exceptions.ConnectionClosed:
                        connected_clients.remove(ws)
            
            # Process any hardware logs in the queue
            while hardware_logs_queue:
                log_msg = hardware_logs_queue.pop(0)
                for ws in list(connected_clients):
                    try:
                        await ws.send(log_msg)
                    except websockets.exceptions.ConnectionClosed:
                        connected_clients.remove(ws)
                        
        await asyncio.sleep(0.1)

async def handler(websocket):
    """Handle incoming connections from the dashboard."""
    print("\n[+] Dashboard Connected!")
    connected_clients.add(websocket)
    try:
        async for message in websocket:
            # We ignore incoming subscribe requests for this mock, 
            # we just blast all topics to everyone connected.
            pass
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        print("\n[-] Dashboard Disconnected.")
        if websocket in connected_clients:
            connected_clients.remove(websocket)

async def main_server():
    """Main async entrypoint for the websocket server."""
    async with websockets.serve(handler, "localhost", 9090):
        # Run the broadcast loop infinitely while the server is active
        await broadcast_state()

def run_server():
    """Run the WebSocket server in an asyncio event loop."""
    asyncio.run(main_server())

# A simple queue for hardware logs that the broadcast loop will empty
hardware_logs_queue = []

def send_hardware_log(log_msg):
    """Helper to push a hardware command to the dashboard via the broadcast loop."""
    if "/hardware/hazards_cmd" in log_msg:
        msg = create_ros_message("/hardware/hazards_cmd", {"data": True})
    elif "/hardware/engine_cut" in log_msg:
        msg = create_ros_message("/hardware/engine_cut", {"data": True})
    elif "/hardware/windows_cmd" in log_msg:
        msg = create_ros_message("/hardware/windows_cmd", {"data": "OPEN_ALL"})
    else:
        return
        
    hardware_logs_queue.append(msg)

def interactive_menu():
    """CLI for the user to trigger scenarios during the pitch."""
    time.sleep(1) # Wait for server to boot
    print("\n=======================================================")
    print("  STANDALONE SIMULATOR READY (NO ROS 2 REQUIRED)")
    print("=======================================================")
    print("1. Open 'dashboard/index.html' in your web browser.")
    print("2. Wait for it to say 'Connected' in the top right.")
    print("3. Use the menu below to trigger live scenarios.\n")
    
    while True:
        print("\n--- Scenarios ---")
        print("1. Reset to Normal Driving")
        print("2. Scenario 1: Drunk Driver Prevented")
        print("3. Scenario 2: Driver Asleep (Emergency Pull-over)")
        print("4. Scenario 3: Gas Leak (Hardware Kill)")
        
        choice = input("Select a scenario: ")
        
        if choice == '1':
            print("Resetting to normal...")
            state["/safe_cmd_vel"]["linear"]["x"] = 2.5
            state["/safe_cmd_vel"]["angular"]["z"] = 0.0
            state["/driver_state"]["data"] = "NORMAL"
            state["/alcohol_interlock_state"]["data"] = "DRIVE_ENABLED"
            state["/gas_state"]["data"] = json.dumps({"status": "SAFE"})
            
        elif choice == '2':
            print("Injecting Alcohol... System blocking drive mode.")
            state["/alcohol_interlock_state"]["data"] = "DRIVE_DISABLED"
            state["/safe_cmd_vel"]["linear"]["x"] = 0.0
            state["/safe_cmd_vel"]["angular"]["z"] = 0.0
            
        elif choice == '3':
            print("Driver falling asleep...")
            state["/driver_state"]["data"] = "DROWSY"
            time.sleep(2)
            print("State escalated to EMERGENCY! Initiating Pull-over...")
            state["/driver_state"]["data"] = "EMERGENCY"
            
            # Simulate the emergency parking maneuver
            state["/safe_cmd_vel"]["linear"]["x"] = 1.0
            state["/safe_cmd_vel"]["angular"]["z"] = -0.5
            send_hardware_log("/hardware/hazards_cmd")
            time.sleep(3)
            print("Straightening out...")
            state["/safe_cmd_vel"]["linear"]["x"] = 0.5
            state["/safe_cmd_vel"]["angular"]["z"] = 0.0
            time.sleep(3)
            print("Safely parked.")
            state["/safe_cmd_vel"]["linear"]["x"] = 0.0
            
        elif choice == '4':
            print("CATASTROPHIC GAS LEAK INJECTED!")
            state["/gas_state"]["data"] = json.dumps({"status": "LEAK_DETECTED"})
            state["/safe_cmd_vel"]["linear"]["x"] = 0.0
            state["/safe_cmd_vel"]["angular"]["z"] = 0.0
            send_hardware_log("/hardware/engine_cut")
            send_hardware_log("/hardware/windows_cmd")
            send_hardware_log("/hardware/hazards_cmd")
            print("Engine Cut and Windows Rolled Down.")
            
        else:
            print("Invalid choice.")

if __name__ == '__main__':
    # Run the WebSocket server in a background thread
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    
    # Run the interactive menu in the main thread
    interactive_menu()
