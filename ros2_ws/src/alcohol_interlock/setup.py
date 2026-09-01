from setuptools import setup

package_name = 'alcohol_interlock'

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
    description='Alcohol-presence detection and vehicle interlock prototype',
    license='Apache-2.0',
    tests_require=['pytest'],
    entry_points={
        'console_scripts': [
            'alcohol_interlock_node = alcohol_interlock.alcohol_interlock_node:main'
        ],
    },
)