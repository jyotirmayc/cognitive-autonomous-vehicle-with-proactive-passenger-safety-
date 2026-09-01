import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from std_srvs.srv import Trigger
import json

class DoorSafetyNode(Node):
    def __init__(self):
        super().__init__('door_safety_node')
        
        # Subscribe to world state for tracked objects (simulating radar data)
        self.world_state_sub = self.create_subscription(
            String,
            '/world_state',
            self.world_state_callback,
            10
        )
        
        # Service to request door opening
        self.door_open_srv = self.create_service(
            Trigger,
            '/request_door_open',
            self.door_open_callback
        )
        
        # Publisher to broadcast the current door lock status (LOCKED / UNLOCKED)
        self.door_state_pub = self.create_publisher(String, '/door_state', 10)
        
        self.tracked_objects = []
        self.DOOR_SAFE_TTC_THRESHOLD = 3.0 # seconds
        self.DOOR_SAFE_DIST_THRESHOLD = 1.5 # meters lateral proximity
        
        # Publish current state periodically
        self.timer = self.create_timer(1.0, self.publish_state)
        self.current_state = "LOCKED" # Default safe state
        
        self.get_logger().info("mmWave Door Safety Node Started.")

    def world_state_callback(self, msg):
        try:
            world_state = json.loads(msg.data)
            self.tracked_objects = world_state.get("tracked_objects", [])
        except json.JSONDecodeError:
            pass

    def calculate_ttc(self, obj):
        # Calculate time-to-collision for objects passing the vehicle laterally
        # Assuming y is lateral distance and x is longitudinal distance
        dist_x = obj.get("x", 999.0)
        vel_x = obj.get("velocity", [0.0, 0.0])[0]
        
        closing_velocity = -vel_x
        if closing_velocity <= 0.01:
            return float('inf')
        return dist_x / closing_velocity

    def check_door_safety(self):
        # Evaluate if any object is approaching dangerously close to the doors
        for obj in self.tracked_objects:
            # Only care about objects close to the side of the car
            lateral_dist = abs(obj.get("y", 99.0))
            if lateral_dist < self.DOOR_SAFE_DIST_THRESHOLD:
                ttc = self.calculate_ttc(obj)
                if ttc < self.DOOR_SAFE_TTC_THRESHOLD:
                    return False, f"HAZARD DETECTED: {obj.get('class')} approaching (TTC: {ttc:.1f}s)"
        return True, "Environment safe. Door Unlocked."

    def door_open_callback(self, request, response):
        self.get_logger().info("Received door open request.")
        
        is_safe, message = self.check_door_safety()
        
        if is_safe:
            self.current_state = "UNLOCKED"
            response.success = True
            response.message = message
            self.get_logger().info(f"DOOR UNLOCKED: {message}")
        else:
            self.current_state = "LOCKED"
            response.success = False
            response.message = message
            self.get_logger().warn(f"DOOR LOCKED: {message}")
            
        self.publish_state()
        return response

    def publish_state(self):
        msg = String()
        msg.data = self.current_state
        self.door_state_pub.publish(msg)

def main(args=None):
    rclpy.init(args=args)
    node = DoorSafetyNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
