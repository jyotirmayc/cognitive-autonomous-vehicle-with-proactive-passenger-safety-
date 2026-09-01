import rclpy
from rclpy.node import Node
from std_msgs.msg import Float32, String
from std_srvs.srv import Trigger

class AlcoholInterlockNode(Node):
    def __init__(self):
        super().__init__('alcohol_interlock_node')
        
        # Prototype threshold (configurable via ROS parameters)
        # Disclaimer: "Alcohol-presence detection and vehicle interlock prototype. 
        # NOT a certified intoxication detection device."
        self.declare_parameter('alcohol_threshold', 0.05) # e.g. mg/L or abstract unit
        self.threshold = self.get_parameter('alcohol_threshold').value
        
        self.current_reading = 0.0
        self.drive_mode_enabled = False
        
        self.alcohol_sub = self.create_subscription(
            Float32,
            '/sensors/alcohol',
            self.alcohol_callback,
            10
        )
        
        self.state_pub = self.create_publisher(String, '/alcohol_interlock_state', 10)
        
        self.drive_srv = self.create_service(
            Trigger,
            '/engage_drive_mode',
            self.engage_drive_callback
        )
        
        self.timer = self.create_timer(1.0, self.publish_state)
        
        self.get_logger().info("Experimental Alcohol Interlock Prototype Started.")
        self.get_logger().info(f"Configured threshold: {self.threshold}")

    def alcohol_callback(self, msg):
        self.current_reading = msg.data
        
        # Dynamic check - if reading spikes while driving, we may want to flag it
        # but the primary check is before engaging drive mode.
        if self.current_reading > self.threshold and self.drive_mode_enabled:
            self.get_logger().warn(f"Alcohol detected during operation! Level: {self.current_reading:.3f}")
            # Safety Manager will catch this state broadcast and react appropriately
            self.drive_mode_enabled = False

    def engage_drive_callback(self, request, response):
        self.get_logger().info("Received request to engage DRIVE mode.")
        
        if self.current_reading <= self.threshold:
            self.drive_mode_enabled = True
            response.success = True
            response.message = "Alcohol check passed. Drive mode ENABLED."
            self.get_logger().info(response.message)
        else:
            self.drive_mode_enabled = False
            response.success = False
            response.message = f"ALCOHOL DETECTED ({self.current_reading:.3f} > {self.threshold}). Drive mode DISABLED."
            self.get_logger().error(response.message)
            
        self.publish_state()
        return response

    def publish_state(self):
        state_str = "DRIVE_ENABLED" if self.drive_mode_enabled else "DRIVE_DISABLED"
        
        # Publish the state so the Central Safety Manager can override controls if needed
        msg = String()
        msg.data = state_str
        self.state_pub.publish(msg)

def main(args=None):
    rclpy.init(args=args)
    node = AlcoholInterlockNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
