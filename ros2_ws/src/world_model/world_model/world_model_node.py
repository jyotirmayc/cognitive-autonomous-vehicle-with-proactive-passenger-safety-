import rclpy
from rclpy.node import Node
from std_msgs.msg import String
import json
import time

class WorldModelNode(Node):
    def __init__(self):
        super().__init__('world_model_node')
        
        # Subscriptions from perception
        self.objects_sub = self.create_subscription(
            String,
            '/perception/objects',
            self.objects_callback,
            10
        )
        
        self.free_space_sub = self.create_subscription(
            String,
            '/perception/free_space',
            self.free_space_callback,
            10
        )
        
        # Publisher for the unified world state
        self.world_state_pub = self.create_publisher(String, '/world_state', 10)
        
        # Internal state
        self.tracked_objects = {}  # dict mapping object_id -> object_data
        self.current_free_space = None
        self.ego_state = {
            "velocity": 0.0,
            "pose": {"x": 0.0, "y": 0.0, "theta": 0.0}
        }
        
        # Timer to publish world state at 10 Hz
        self.timer = self.create_timer(0.1, self.publish_world_state)
        
        # Stale object timeout (seconds)
        self.object_timeout = 1.0 
        
        self.get_logger().info("World Model Node Started.")

    def objects_callback(self, msg):
        try:
            detected_objects = json.loads(msg.data)
            current_time = time.time()
            
            for obj in detected_objects:
                obj_id = obj.get("object_id")
                if obj_id is not None:
                    obj["last_seen"] = current_time
                    self.tracked_objects[obj_id] = obj
                    
        except json.JSONDecodeError:
            self.get_logger().error("Failed to decode objects JSON")

    def free_space_callback(self, msg):
        try:
            self.current_free_space = json.loads(msg.data)
        except json.JSONDecodeError:
            self.get_logger().error("Failed to decode free_space JSON")

    def prune_stale_objects(self):
        current_time = time.time()
        stale_ids = [
            obj_id for obj_id, obj in self.tracked_objects.items()
            if (current_time - obj["last_seen"]) > self.object_timeout
        ]
        for obj_id in stale_ids:
            del self.tracked_objects[obj_id]

    def publish_world_state(self):
        # 1. Prune old objects
        self.prune_stale_objects()
        
        # 2. Construct unified world state
        world_state = {
            "timestamp": time.time(),
            "ego_vehicle": self.ego_state,
            "tracked_objects": list(self.tracked_objects.values()),
            "free_space": self.current_free_space
        }
        
        # 3. Publish
        out_msg = String()
        out_msg.data = json.dumps(world_state)
        self.world_state_pub.publish(out_msg)

def main(args=None):
    rclpy.init(args=args)
    node = WorldModelNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
