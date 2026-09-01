import rclpy
from rclpy.node import Node
from std_msgs.msg import Float32, String, Bool
import json

class GasSafetyNode(Node):
    def __init__(self):
        super().__init__('gas_safety_node')
        
        # Subscribe to gas sensor data (e.g., LPG/CNG levels from MQ-2/MQ-4)
        self.gas_sub = self.create_subscription(
            Float32,
            '/sensors/gas_level',
            self.gas_callback,
            10
        )
        
        # Publishers for state and direct hardware override commands
        self.state_pub = self.create_publisher(String, '/gas_state', 10)
        self.windows_cmd_pub = self.create_publisher(String, '/hardware/windows_cmd', 10)
        self.engine_cut_pub = self.create_publisher(Bool, '/hardware/engine_cut', 10)
        self.hazards_cmd_pub = self.create_publisher(Bool, '/hardware/hazards_cmd', 10)
        
        # Configurable explosion/toxicity threshold
        self.declare_parameter('gas_danger_threshold', 15.0) # Percentage or PPM equivalent
        self.threshold = self.get_parameter('gas_danger_threshold').value
        
        self.current_gas_level = 0.0
        self.emergency_triggered = False
        
        # Check state continuously
        self.timer = self.create_timer(0.5, self.evaluate_gas_safety)
        
        self.get_logger().info("Gas Leak Safety Subsystem Started.")

    def gas_callback(self, msg):
        self.current_gas_level = msg.data

    def evaluate_gas_safety(self):
        status = "SAFE"
        
        if self.current_gas_level >= self.threshold:
            status = "LEAK_DETECTED"
            
            if not self.emergency_triggered:
                self.trigger_emergency_protocols()
                self.emergency_triggered = True
        else:
            # If gas levels drop back to normal (e.g. after airing out)
            if self.emergency_triggered:
                self.get_logger().info("Gas levels returned to safe parameters.")
                self.emergency_triggered = False
                
        # Publish overall state
        state_dict = {
            "status": status,
            "gas_level": self.current_gas_level,
            "threshold": self.threshold,
            "emergency_active": self.emergency_triggered
        }
        
        msg = String()
        msg.data = json.dumps(state_dict)
        self.state_pub.publish(msg)

    def trigger_emergency_protocols(self):
        self.get_logger().fatal(f"CRITICAL GAS LEAK DETECTED: {self.current_gas_level:.2f} >= {self.threshold:.2f}")
        self.get_logger().fatal("INITIATING EMERGENCY PROTOCOLS: Cutting engine, rolling down windows, flashing hazards.")
        
        # 1. Roll down windows to vent gas
        win_msg = String()
        win_msg.data = "OPEN_ALL"
        self.windows_cmd_pub.publish(win_msg)
        
        # 2. Cut main engine/power to prevent spark explosion
        engine_msg = Bool()
        engine_msg.data = True # True = Cut power
        self.engine_cut_pub.publish(engine_msg)
        
        # 3. Flash hazards
        hazards_msg = Bool()
        hazards_msg.data = True
        self.hazards_cmd_pub.publish(hazards_msg)

def main(args=None):
    rclpy.init(args=args)
    node = GasSafetyNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
