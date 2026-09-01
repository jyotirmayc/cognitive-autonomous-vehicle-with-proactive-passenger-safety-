import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from geometry_msgs.msg import Twist
import json
import math

class AdaptivePlannerNode(Node):
    def __init__(self):
        super().__init__('adaptive_planner_node')
        
        # Subscriptions
        self.world_state_sub = self.create_subscription(
            String,
            '/world_state',
            self.world_state_callback,
            10
        )
        
        # Publisher for the selected path / state logic
        self.planned_path_pub = self.create_publisher(String, '/planner/planned_path', 10)
        
        # Publisher for standard cmd_vel (intercepted by Safety Manager later)
        self.cmd_vel_pub = self.create_publisher(Twist, '/planner/cmd_vel', 10)
        
        self.get_logger().info("Adaptive Path Planner Node Started.")

        # Configuration thresholds
        self.CRITICAL_TTC = 2.0  # seconds
        self.WARNING_TTC = 4.0   # seconds
        self.MAX_SPEED = 5.0     # m/s

    def calculate_ttc(self, obj):
        # Conceptual calculation: TTC = distance / relative_velocity
        # Assuming ego velocity is handled or object velocity is relative for this prototype
        dist = obj.get("distance", 999.0)
        vel_x = obj.get("velocity", [0.0, 0.0])[0]
        
        # If object is moving away or stationary relative to us, TTC is infinite
        # For prototype simplicity, let's assume vel_x is closing velocity
        closing_velocity = -vel_x  # simplistic assumption for mock
        
        if closing_velocity <= 0.01:
            return float('inf')
            
        return dist / closing_velocity

    def evaluate_risk(self, tracked_objects):
        min_ttc = float('inf')
        closest_obj = None
        
        for obj in tracked_objects:
            ttc = self.calculate_ttc(obj)
            if ttc < min_ttc:
                min_ttc = ttc
                closest_obj = obj
                
        return min_ttc, closest_obj

    def world_state_callback(self, msg):
        try:
            world_state = json.loads(msg.data)
        except json.JSONDecodeError:
            self.get_logger().error("Failed to decode world_state JSON")
            return
            
        tracked_objects = world_state.get("tracked_objects", [])
        
        # Step 1: Risk Evaluation (Internalized from a Risk Engine for now)
        min_ttc, closest_obj = self.evaluate_risk(tracked_objects)
        
        # Step 2: State Determination (GO, SLOW, STOP, etc.)
        planner_state = "GO"
        target_speed = self.MAX_SPEED
        
        if min_ttc < self.CRITICAL_TTC:
            planner_state = "STOP"
            target_speed = 0.0
            self.get_logger().warn(f"EMERGENCY BRAKE! Collision imminent (TTC: {min_ttc:.2f}s)")
        elif min_ttc < self.WARNING_TTC:
            planner_state = "SLOW"
            target_speed = self.MAX_SPEED * 0.4
            self.get_logger().info(f"Slowing down. Obstacle ahead (TTC: {min_ttc:.2f}s)")
        else:
            # Free space planning / GO
            planner_state = "GO"
            target_speed = self.MAX_SPEED

        # Step 3: Candidate Path Generation & Selection (Stubbed)
        # In a full implementation, we'd generate spline paths avoiding the obstacle.
        selected_path = {
            "state": planner_state,
            "target_speed": target_speed,
            "min_ttc_observed": min_ttc,
            "steering_angle": 0.0 # Straight for now
        }
        
        # Publish JSON path intent
        path_msg = String()
        path_msg.data = json.dumps(selected_path)
        self.planned_path_pub.publish(path_msg)
        
        # Publish Twist command
        twist = Twist()
        twist.linear.x = float(target_speed)
        twist.angular.z = 0.0
        self.cmd_vel_pub.publish(twist)

def main(args=None):
    rclpy.init(args=args)
    node = AdaptivePlannerNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
