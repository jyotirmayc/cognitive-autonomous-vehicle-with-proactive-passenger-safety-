import rclpy
from rclpy.node import Node
from sensor_msgs.msg import LaserScan
import math
import random

class LidarMockNode(Node):
    def __init__(self):
        super().__init__('lidar_mock_node')
        self.scan_pub = self.create_publisher(LaserScan, '/scan', 10)
        self.timer = self.create_timer(0.1, self.timer_callback) # 10 Hz
        self.get_logger().info("LiDAR Mock Node Started.")

    def timer_callback(self):
        msg = LaserScan()
        msg.header.stamp = self.get_clock().now().to_msg()
        msg.header.frame_id = 'base_laser'
        
        # Standard 2D LiDAR profile (e.g. RPLidar A1/A2 or similar)
        msg.angle_min = -math.pi
        msg.angle_max = math.pi
        msg.angle_increment = math.pi / 180.0 # 1 degree resolution
        msg.time_increment = 0.0
        msg.scan_time = 0.1
        msg.range_min = 0.15
        msg.range_max = 12.0

        num_ranges = int((msg.angle_max - msg.angle_min) / msg.angle_increment)
        
        # Simulate an environment with random obstacles at 5m
        msg.ranges = []
        msg.intensities = []
        for i in range(num_ranges):
            # Base distance 5m, random noise +/- 0.1m
            dist = 5.0 + random.uniform(-0.1, 0.1)
            msg.ranges.append(dist)
            msg.intensities.append(100.0)

        self.scan_pub.publish(msg)

def main(args=None):
    rclpy.init(args=args)
    node = LidarMockNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
