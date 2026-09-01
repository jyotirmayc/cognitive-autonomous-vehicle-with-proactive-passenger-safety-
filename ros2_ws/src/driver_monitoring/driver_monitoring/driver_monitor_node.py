import rclpy
from rclpy.node import Node
from std_msgs.msg import String
import time

class DriverMonitorNode(Node):
    def __init__(self):
        super().__init__('driver_monitor_node')
        
        # Subscribe to raw interior camera analysis (e.g. from YOLO face/eye tracker)
        # Mock values: NORMAL, EYES_CLOSED, YAWNING, NOT_LOOKING
        self.raw_state_sub = self.create_subscription(
            String,
            '/sensors/driver_state_mock',
            self.raw_state_callback,
            10
        )
        
        # Publish the filtered, temporal driver safety state
        self.driver_state_pub = self.create_publisher(String, '/driver_state', 10)
        
        self.current_state = "NORMAL"
        self.abnormal_start_time = None
        
        # Temporal thresholds (seconds)
        self.WARNING_THRESHOLD = 2.0      # Level 1: Momentary distraction/drowsiness
        self.DROWSY_THRESHOLD = 5.0       # Level 2: Confirmed drowsiness
        self.UNRESPONSIVE_THRESHOLD = 10.0# Level 3: Unresponsive (triggers emergency park later)
        
        # 10 Hz State evaluation loop
        self.timer = self.create_timer(0.1, self.evaluate_state)
        
        self.get_logger().info("Driver Monitoring Node Started.")

    def raw_state_callback(self, msg):
        raw_status = msg.data.upper()
        
        if raw_status == "NORMAL":
            # Reset timer if driver is normal
            if self.abnormal_start_time is not None:
                self.get_logger().info("Driver resumed NORMAL state.")
                self.abnormal_start_time = None
                self.current_state = "NORMAL"
        else:
            # EYES_CLOSED, YAWNING, etc.
            if self.abnormal_start_time is None:
                self.abnormal_start_time = time.time()
                self.get_logger().debug(f"Detected abnormal driver behavior: {raw_status}")

    def evaluate_state(self):
        if self.abnormal_start_time is not None:
            duration = time.time() - self.abnormal_start_time
            
            if duration >= self.UNRESPONSIVE_THRESHOLD:
                if self.current_state != "EMERGENCY":
                    self.current_state = "EMERGENCY"
                    self.get_logger().error("Driver UNRESPONSIVE for >10s. EMERGENCY MODE TRIGGERED.")
            elif duration >= self.DROWSY_THRESHOLD:
                if self.current_state != "DROWSY":
                    self.current_state = "DROWSY"
                    self.get_logger().warn("Driver DROWSY for >5s. Triggering strong audio/visual alerts.")
            elif duration >= self.WARNING_THRESHOLD:
                if self.current_state != "WARNING":
                    self.current_state = "WARNING"
                    self.get_logger().info("Driver distracted/eyes closed. Issuing Level 1 WARNING.")
        else:
            self.current_state = "NORMAL"
            
        # Publish current state
        msg = String()
        msg.data = self.current_state
        self.driver_state_pub.publish(msg)

def main(args=None):
    rclpy.init(args=args)
    node = DriverMonitorNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
