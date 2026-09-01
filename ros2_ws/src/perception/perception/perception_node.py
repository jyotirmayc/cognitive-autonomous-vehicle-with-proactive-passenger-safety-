import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from std_msgs.msg import String
import json
import time
import random

class PerceptionNode(Node):
    def __init__(self):
        super().__init__('perception_node')
        
        # Subscribe to raw image data
        self.image_sub = self.create_subscription(
            Image,
            '/camera/image_raw',
            self.image_callback,
            10
        )
        
        # Publish detected objects as JSON string for prototype simplicity
        # Later this can be replaced with a custom ROS message (e.g. ObjectArray)
        self.objects_pub = self.create_publisher(String, '/perception/objects', 10)
        
        # Publisher for free space (could also be occupancy grid or JSON)
        self.free_space_pub = self.create_publisher(String, '/perception/free_space', 10)
        
        self.get_logger().info("Perception Node Started. Awaiting images...")

        # For tracking mock IDs
        self.mock_id_counter = 1

    def image_callback(self, msg):
        # In a real implementation:
        # 1. Convert ROS Image to OpenCV CV2 format (cv_bridge)
        # 2. Run YOLO inference: results = model(cv_image)
        # 3. Extract bounding boxes, classes, and confidences
        # 4. Map 2D boxes to 3D distance/position (using camera intrinsics / depth / LiDAR fusion later)
        
        # For now, we simulate detecting a few dynamic objects based on receiving an image.
        self.get_logger().debug("Received image, running perception...")
        
        # Simulate processing delay
        # time.sleep(0.05) 
        
        objects_list = []
        
        # Simulate finding 1 or 2 objects
        num_objects = random.randint(1, 2)
        classes = ["motorcycle", "pedestrian", "car", "auto-rickshaw", "cow"]
        
        for i in range(num_objects):
            obj = {
                "object_id": self.mock_id_counter,
                "class": random.choice(classes),
                "x": round(random.uniform(2.0, 15.0), 2),  # meters ahead
                "y": round(random.uniform(-4.0, 4.0), 2),  # meters lateral
                "distance": 0.0, # Calculated below
                "velocity": [round(random.uniform(-1.0, 5.0), 2), 0.0],
                "heading": 0.0,
                "confidence": round(random.uniform(0.70, 0.99), 2),
                "timestamp": self.get_clock().now().nanoseconds / 1e9,
                "source": "camera"
            }
            # Simple euclidean distance
            obj["distance"] = round((obj["x"]**2 + obj["y"]**2)**0.5, 2)
            
            objects_list.append(obj)
            self.mock_id_counter += 1
            if self.mock_id_counter > 1000:
                self.mock_id_counter = 1

        # Publish the objects
        out_msg = String()
        out_msg.data = json.dumps(objects_list)
        self.objects_pub.publish(out_msg)
        
        # Publish a mock free-space corridor (e.g. left and right bounds)
        free_space = {
            "corridor_width": 4.5,
            "drivable_distance": 20.0,
            "status": "CLEAR"
        }
        fs_msg = String()
        fs_msg.data = json.dumps(free_space)
        self.free_space_pub.publish(fs_msg)

def main(args=None):
    rclpy.init(args=args)
    node = PerceptionNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
