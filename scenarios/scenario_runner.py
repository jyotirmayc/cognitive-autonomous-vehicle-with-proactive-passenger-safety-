import rclpy
from rclpy.node import Node
from std_msgs.msg import Float32, String
import time
import threading
import sys

class ScenarioRunnerNode(Node):
    def __init__(self):
        super().__init__('scenario_runner')
        
        # Publishers to override the default simulation values
        self.alcohol_pub = self.create_publisher(Float32, '/sensors/alcohol', 10)
        self.driver_mock_pub = self.create_publisher(String, '/sensors/driver_state_mock', 10)
        self.gas_pub = self.create_publisher(Float32, '/sensors/gas_level', 10)
        
        # Give ROS network time to discover publishers
        time.sleep(1.0)
        self.get_logger().info("Scenario Runner Initialized.")

    def run_scenario_1(self):
        self.get_logger().info("--- STARTING SCENARIO 1: DRUNK DRIVER ---")
        self.get_logger().info("Action: Injecting Blood Alcohol Content of 0.12 (Above 0.05 limit)")
        
        msg = Float32()
        msg.data = 0.12
        # Publish repeatedly for a few seconds to ensure latching
        for _ in range(5):
            self.alcohol_pub.publish(msg)
            time.sleep(0.5)
            
        self.get_logger().info("Result Expected: Dashboard should show DRIVE_DISABLED. Engage Drive Mode service will fail.")
        self.get_logger().info("--- END SCENARIO 1 ---")

    def run_scenario_2(self):
        self.get_logger().info("--- STARTING SCENARIO 2: DRIVER FALLS ASLEEP ---")
        self.get_logger().info("Action: Setting driver gaze tracker to 'DROWSY' continuously for 12 seconds.")
        
        msg = String()
        msg.data = "DROWSY"
        
        # 12 seconds > 10 second EMERGENCY threshold in Driver Monitor
        start_time = time.time()
        while time.time() - start_time < 12.0:
            self.driver_mock_pub.publish(msg)
            time.sleep(0.5)
            
        self.get_logger().info("Result Expected: Driver Monitor escalates NORMAL -> WARNING -> DROWSY -> EMERGENCY. Emergency Parking node takes over and publishes safe_cmd_vel.")
        
        # Reset
        self.get_logger().info("Action: Driver wakes up.")
        msg.data = "NORMAL"
        for _ in range(3):
            self.driver_mock_pub.publish(msg)
            time.sleep(0.5)
            
        self.get_logger().info("--- END SCENARIO 2 ---")

    def run_scenario_3(self):
        self.get_logger().info("--- STARTING SCENARIO 3: CATASTROPHIC GAS LEAK ---")
        self.get_logger().info("Action: Injecting CNG level of 25.0% (Above 15.0% limit)")
        
        msg = Float32()
        msg.data = 25.0
        
        for _ in range(5):
            self.gas_pub.publish(msg)
            time.sleep(0.5)
            
        self.get_logger().info("Result Expected: Gas Safety triggers immediately. Engine cut = True. Windows open. Safety Manager vetoes planner.")
        
        # Reset
        self.get_logger().info("Action: Gas clears out.")
        msg.data = 0.0
        for _ in range(3):
            self.gas_pub.publish(msg)
            time.sleep(0.5)
            
        self.get_logger().info("--- END SCENARIO 3 ---")


def menu():
    print("\n--- Digital Twin Scenario Runner ---")
    print("1. Scenario 1: Drunk Driver (Alcohol Interlock)")
    print("2. Scenario 2: Driver Asleep (Emergency Pull-over)")
    print("3. Scenario 3: Gas Leak (Hardware Kill)")
    print("4. Exit")
    choice = input("Select a scenario to inject: ")
    return choice

def main(args=None):
    rclpy.init(args=args)
    node = ScenarioRunnerNode()
    
    # Run the menu in a separate thread so ROS can spin if needed (though we're mostly just publishing)
    def run_menu():
        while True:
            choice = menu()
            if choice == '1':
                node.run_scenario_1()
            elif choice == '2':
                node.run_scenario_2()
            elif choice == '3':
                node.run_scenario_3()
            elif choice == '4':
                print("Exiting.")
                rclpy.shutdown()
                sys.exit(0)
            else:
                print("Invalid choice.")
                
    menu_thread = threading.Thread(target=run_menu)
    menu_thread.start()
    
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()

if __name__ == '__main__':
    main()
