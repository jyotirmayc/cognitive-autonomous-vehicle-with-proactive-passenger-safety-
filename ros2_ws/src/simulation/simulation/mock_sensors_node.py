import rclpy
from rclpy.node import Node
from std_msgs.msg import Float32, Bool, String
from sensor_msgs.msg import Image, Imu, NavSatFix

class MockSensorsNode(Node):
    def __init__(self):
        super().__init__('mock_sensors_node')
        
        # Autonomous Driving Sensors
        self.camera_pub = self.create_publisher(Image, '/camera/image_raw', 10)
        self.imu_pub = self.create_publisher(Imu, '/imu/data', 10)
        self.gps_pub = self.create_publisher(NavSatFix, '/gps/fix', 10)
        
        # Occupant / Safety Sensors
        self.temp_pub = self.create_publisher(Float32, '/sensors/cabin_temp', 10)
        self.co2_pub = self.create_publisher(Float32, '/sensors/co2_level', 10)
        self.gas_pub = self.create_publisher(Float32, '/sensors/lpg_gas', 10)
        self.alcohol_pub = self.create_publisher(Float32, '/sensors/alcohol', 10)
        self.occupancy_pub = self.create_publisher(Bool, '/sensors/occupancy', 10)
        self.driver_cam_pub = self.create_publisher(String, '/sensors/driver_state_mock', 10)

        # Timer for publishing at 10 Hz
        self.timer = self.create_timer(0.1, self.timer_callback)
        self.get_logger().info("Mock Sensors Node Started.")

    def timer_callback(self):
        # Publish mock temperature (e.g., 24.5 C)
        temp_msg = Float32()
        temp_msg.data = 24.5
        self.temp_pub.publish(temp_msg)

        # Publish mock CO2 (e.g., 400 ppm)
        co2_msg = Float32()
        co2_msg.data = 400.0
        self.co2_pub.publish(co2_msg)

        # Publish mock Gas level (e.g., 0.0 - safe)
        gas_msg = Float32()
        gas_msg.data = 0.0
        self.gas_pub.publish(gas_msg)
        
        # Publish mock alcohol level (e.g., 0.0 mg/L)
        alc_msg = Float32()
        alc_msg.data = 0.0
        self.alcohol_pub.publish(alc_msg)
        
        # Publish mock occupancy (True = present)
        occ_msg = Bool()
        occ_msg.data = True
        self.occupancy_pub.publish(occ_msg)
        
        # Publish mock driver state (e.g., NORMAL)
        ds_msg = String()
        ds_msg.data = "NORMAL"
        self.driver_cam_pub.publish(ds_msg)
        
def main(args=None):
    rclpy.init(args=args)
    node = MockSensorsNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
