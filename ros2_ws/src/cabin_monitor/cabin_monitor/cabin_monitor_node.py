import rclpy
from rclpy.node import Node
from std_msgs.msg import Float32, Bool, String
import json

class CabinMonitorNode(Node):
    def __init__(self):
        super().__init__('cabin_monitor_node')
        
        # Subscriptions to mock sensors (from Phase 1)
        self.temp_sub = self.create_subscription(Float32, '/sensors/cabin_temp', self.temp_callback, 10)
        self.co2_sub = self.create_subscription(Float32, '/sensors/co2_level', self.co2_callback, 10)
        self.occ_sub = self.create_subscription(Bool, '/sensors/occupancy', self.occ_callback, 10)
        
        # Publisher for cabin state
        self.state_pub = self.create_publisher(String, '/cabin_state', 10)
        
        # Configurable thresholds
        self.declare_parameter('max_safe_temp', 35.0) # Celsius
        self.declare_parameter('min_safe_temp', 5.0)  # Celsius
        self.declare_parameter('max_safe_co2', 1000.0) # ppm
        
        self.MAX_TEMP = self.get_parameter('max_safe_temp').value
        self.MIN_TEMP = self.get_parameter('min_safe_temp').value
        self.MAX_CO2 = self.get_parameter('max_safe_co2').value
        
        # Internal state
        self.current_temp = 25.0
        self.current_co2 = 400.0
        self.is_occupied = False
        
        # Evaluation loop
        self.timer = self.create_timer(1.0, self.evaluate_cabin_safety)
        
        self.get_logger().info("Cabin Monitor Node Started.")

    def temp_callback(self, msg):
        self.current_temp = msg.data

    def co2_callback(self, msg):
        self.current_co2 = msg.data

    def occ_callback(self, msg):
        self.is_occupied = msg.data

    def evaluate_cabin_safety(self):
        status = "NORMAL"
        alerts = []
        
        # We primarily care about extreme conditions if the cabin is OCCUPIED
        if self.is_occupied:
            if self.current_temp > self.MAX_TEMP:
                status = "CRITICAL"
                alerts.append(f"High Temp: {self.current_temp:.1f}C")
            elif self.current_temp < self.MIN_TEMP:
                status = "CRITICAL"
                alerts.append(f"Low Temp: {self.current_temp:.1f}C")
                
            if self.current_co2 > self.MAX_CO2:
                status = "WARNING" if self.current_co2 < 2000 else "CRITICAL"
                alerts.append(f"High CO2: {self.current_co2:.1f}ppm")
                
            if status == "CRITICAL":
                self.get_logger().error(f"CABIN EMERGENCY: {', '.join(alerts)}. Occupant entrapment risk!")
            elif status == "WARNING":
                self.get_logger().warn(f"CABIN WARNING: {', '.join(alerts)}")
        
        state_dict = {
            "status": status,
            "occupied": self.is_occupied,
            "temperature": self.current_temp,
            "co2_ppm": self.current_co2,
            "alerts": alerts
        }
        
        msg = String()
        msg.data = json.dumps(state_dict)
        self.state_pub.publish(msg)

def main(args=None):
    rclpy.init(args=args)
    node = CabinMonitorNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
