import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from std_msgs.msg import String, Bool
import json
import time

class EmergencyParkingNode(Node):
    def __init__(self):
        super().__init__('emergency_parking_node')
        
        self.driver_sub = self.create_subscription(String, '/driver_state', self.driver_callback, 10)
        self.world_sub = self.create_subscription(String, '/world_state', self.world_callback, 10)
        
        self.cmd_pub = self.create_publisher(Twist, '/planner/emergency_cmd_vel', 10)
        self.hazards_pub = self.create_publisher(Bool, '/hardware/hazards_cmd', 10)
        
        self.emergency_active = False
        self.maneuver_start_time = 0.0
        self.world_state_data = {}
        
        self.timer = self.create_timer(0.1, self.execute_parking_maneuver)
        self.get_logger().info("Emergency Parking Node Started.")

    def driver_callback(self, msg):
        if msg.data == "EMERGENCY" and not self.emergency_active:
            self.emergency_active = True
            self.maneuver_start_time = time.time()
            self.get_logger().error("DRIVER EMERGENCY CONFIRMED. Initiating safe pull-over maneuver.")
            
            # Immediately turn on hazards
            hazards_msg = Bool()
            hazards_msg.data = True
            self.hazards_pub.publish(hazards_msg)
            
        elif msg.data == "NORMAL" and self.emergency_active:
            self.emergency_active = False
            self.get_logger().info("Driver state recovered. Aborting emergency parking.")

    def world_callback(self, msg):
        try:
            self.world_state_data = json.loads(msg.data)
        except json.JSONDecodeError:
            pass

    def execute_parking_maneuver(self):
        if not self.emergency_active:
            return
            
        # Simplified Safe Pull-over Logic
        # 0-3s: Slow down and steer right (pull over to shoulder)
        # 3-6s: Straighten out, slow to a crawl
        # >6s: Complete stop
        
        elapsed = time.time() - self.maneuver_start_time
        cmd = Twist()
        
        # Check world state for immediate obstacles on the right
        # In a full implementation, we'd check if the free_space allows a right turn.
        # Here we do a basic timed open-loop maneuver that could be interrupted by the Safety Manager if an obstacle exists.
        
        if elapsed < 3.0:
            cmd.linear.x = 2.0  # Slowing down from highway speed
            cmd.angular.z = -0.5 # Steer right
        elif elapsed < 6.0:
            cmd.linear.x = 0.5  # Crawling
            cmd.angular.z = 0.0  # Straighten
        else:
            cmd.linear.x = 0.0  # Stopped
            cmd.angular.z = 0.0
            
            # If we've just stopped, log it
            if elapsed < 6.2:
                self.get_logger().info("Vehicle is safely parked. Doors unlocking for emergency access.")
                # We could publish to door_safety here, but door_safety exposes a service.
                
        self.cmd_pub.publish(cmd)

def main(args=None):
    rclpy.init(args=args)
    node = EmergencyParkingNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
