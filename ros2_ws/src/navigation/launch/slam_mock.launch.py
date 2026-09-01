import os
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        # 1. Mock LiDAR Publisher
        Node(
            package='navigation',
            executable='lidar_mock_node',
            name='lidar_mock_node',
            output='screen'
        ),
        
        # 2. TF Broadcaster (base_link -> base_laser)
        Node(
            package='navigation',
            executable='tf_broadcaster_node',
            name='tf_broadcaster_node',
            output='screen'
        ),
        
        # 3. (Placeholder) SLAM Toolbox
        # In a full ROS 2 environment with slam_toolbox installed, you would include:
        # IncludeLaunchDescription(
        #     PythonLaunchDescriptionSource([os.path.join(
        #         get_package_share_directory('slam_toolbox'), 'launch', 'online_async_launch.py'
        #     )])
        # )
        
        # 4. (Placeholder) Nav2 Bringup
        # IncludeLaunchDescription(
        #     PythonLaunchDescriptionSource([os.path.join(
        #         get_package_share_directory('nav2_bringup'), 'launch', 'navigation_launch.py'
        #     )])
        # )
    ])
