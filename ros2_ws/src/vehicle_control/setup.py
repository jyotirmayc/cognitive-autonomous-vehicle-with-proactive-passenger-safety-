from setuptools import setup

package_name = 'vehicle_control'

setup(
    name=package_name,
    version='0.0.1',
    packages=[package_name],
    data_files=[
        ('share/ament_index/resource_index/packages',
            ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml']),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='Dev',
    maintainer_email='dev@example.com',
    description='High-level ROS 2 to Arduino Vehicle Control Interface',
    license='Apache-2.0',
    tests_require=['pytest'],
    entry_points={
        'console_scripts': [
            'vehicle_control_node = vehicle_control.vehicle_control_node:main'
        ],
    },
)