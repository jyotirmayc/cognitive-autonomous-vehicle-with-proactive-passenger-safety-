import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from std_msgs.msg import String
import json

class SafetyManagerNode(Node):
    def __init__(self):
        super().__init__('safety_manager_node')
        
        # Subscriptions to all safety subsystems
        self.planner_sub = self.create_subscription(Twist, '/planner/cmd_vel', self.planner_callback, 10)
        self.driver_sub = self.create_subscription(String, '/driver_state', self.driver_callback, 10)
        self.alcohol_sub = self.create_subscription(String, '/alcohol_interlock_state', self.alcohol_callback, 10)
        self.gas_sub = self.create_subscription(String, '/gas_state', self.gas_callback, 10)
        self.emergency_sub = self.create_subscription(Twist, '/planner/emergency_cmd_vel', self.emergency_callback, 10)
        
        # Publisher for the final, hardware-bound command
        self.safe_cmd_pub = self.create_publisher(Twist, '/safe_cmd_vel', 10)
        
        # Current state of all subsystems
        self.current_planner_cmd = Twist()
        self.emergency_planner_cmd = Twist()
        self.driver_state = "NORMAL"
        self.alcohol_state = "DRIVE_ENABLED" # Assume safe default unless interlock triggers
        self.gas_status = "SAFE"
        
        # Evaluation loop (high frequency to ensure rapid overrides)
        self.timer = self.create_timer(0.05, self.evaluate_safety) # 20 Hz
        
        self.get_logger().info("Central Safety Manager Started.")

    def planner_callback(self, msg):
        self.current_planner_cmd = msg
        
    def driver_callback(self, msg):
        self.driver_state = msg.data
        
    def alcohol_callback(self, msg):
        self.alcohol_state = msg.data
        
    def gas_callback(self, msg):
        try:
            gas_data = json.loads(msg.data)
            self.gas_status = gas_data.get("status", "SAFE")
        except json.JSONDecodeError:
            pass
            
    def emergency_callback(self, msg):
        self.emergency_planner_cmd = msg

    def evaluate_safety(self):
        # Default: pass the planner's intent through directly
        safe_cmd = Twist()
        safe_cmd.linear.x = self.current_planner_cmd.linear.x
        safe_cmd.angular.z = self.current_planner_cmd.angular.z
        
        override_reason = None
        
        # Priority 1: Gas Explosion/Toxicity Risk
        if self.gas_status == "LEAK_DETECTED":
            override_reason = "GAS LEAK"
            safe_cmd.linear.x = 0.0
            safe_cmd.angular.z = 0.0
            
        # Priority 2: Alcohol Interlock Active
        elif self.alcohol_state == "DRIVE_DISABLED":
            override_reason = "ALCOHOL INTERLOCK"
            safe_cmd.linear.x = 0.0
            safe_cmd.angular.z = 0.0
            
        # Priority 3: Driver Unresponsive
        elif self.driver_state == "EMERGENCY":
            override_reason = "DRIVER UNRESPONSIVE - EMERGENCY PARKING"
            # Instead of stopping, we pass through the emergency parking node's pull-over commands
            safe_cmd.linear.x = self.emergency_planner_cmd.linear.x
            safe_cmd.angular.z = self.emergency_planner_cmd.angular.z
            
        # Log overrides
        if override_reason:
            # We don't want to flood the console, but in a real system we'd log state transitions
            if self.current_planner_cmd.linear.x != 0.0 or self.current_planner_cmd.angular.z != 0.0:
                self.get_logger().warn(f"SAFETY OVERRIDE ACTIVE ({override_reason}).")
                
        # Publish the final, vetted command to the vehicle control layer
        self.safe_cmd_pub.publish(safe_cmd)

def main(args=None):
    rclpy.init(args=args)
    node = SafetyManagerNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
