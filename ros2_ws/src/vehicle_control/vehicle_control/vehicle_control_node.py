import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
import serial
import json
import time

class VehicleControlNode(Node):
    def __init__(self):
        super().__init__('vehicle_control_node')
        
        # Subscribe to the final safe command velocity from the Safety Manager
        self.cmd_vel_sub = self.create_subscription(
            Twist,
            '/safe_cmd_vel',
            self.cmd_vel_callback,
            10
        )
        
        # In a real deployment, the port would be /dev/ttyUSB0 or /dev/ttyACM0 for Arduino UNO
        self.serial_port = self.declare_parameter('serial_port', 'COM3').value
        self.baud_rate = self.declare_parameter('baud_rate', 115200).value
        
        self.ser = None
        self.connect_serial()
        
        self.get_logger().info(f"Vehicle Control Node Started. Target port: {self.serial_port}")

    def connect_serial(self):
        try:
            # Mock connection attempt
            # self.ser = serial.Serial(self.serial_port, self.baud_rate, timeout=1)
            self.get_logger().info("Running in Mock Serial mode. (Hardware disconnected)")
        except Exception as e:
            self.get_logger().warn(f"Could not open serial port: {e}. Running in mock mode.")

    def cmd_vel_callback(self, msg):
        linear_x = msg.linear.x
        angular_z = msg.angular.z
        
        # Construct command string or JSON for Arduino
        # E.g. {"v": 2.5, "w": 0.0}
        cmd_dict = {
            "v": round(linear_x, 2),
            "w": round(angular_z, 2)
        }
        cmd_str = json.dumps(cmd_dict) + "\n"
        
        if self.ser and self.ser.is_open:
            try:
                self.ser.write(cmd_str.encode('utf-8'))
            except Exception as e:
                self.get_logger().error(f"Serial write error: {e}")
        else:
            # Log the mock command
            self.get_logger().debug(f"Mock Serial TX: {cmd_str.strip()}")

def main(args=None):
    rclpy.init(args=args)
    node = VehicleControlNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
