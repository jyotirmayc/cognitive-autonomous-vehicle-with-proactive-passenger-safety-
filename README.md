

  
  <h1>Cognitive Autonomous Vehicle (Hardware Platform)</h1>
  <h3>Drive-by-Wire & IoT Edge Safety Architecture</h3>
  <p>A physical, hardware-in-the-loop autonomous vehicle prototype built for the Smart India Hackathon.</p>
</div>

---

## 🚀 Overview

This repository contains the firmware, control software, and digital-twin interface for our **Cognitive Autonomous Vehicle**. While many autonomous vehicle projects focus purely on software simulation, this is fundamentally a **hardware-first robotics project**. 

We have engineered a physical drive-by-wire prototype governed by an independent **Central Safety Manager**. This architecture ensures that critical safety protocols (e.g., driver drowsiness, gas leaks, alcohol detection) can physically actuate relays to cut motor power or steer the vehicle to safety—even if the primary AI perception pipeline fails or hallucinates.

### 🌟 Key Hardware Features
- **Drive-by-Wire Actuation:** PWM-controlled L298N motor drivers and steering servos for physical vehicle maneuvering.
- **Physical Edge-Safety Overrides:** Hardware emergency relays capable of cutting engine power instantly upon receiving a `/hardware/engine_cut` signal.
- **IoT Sensor Suite:** 
  - **MQ Series Gas Sensors:** Live monitoring of CNG/LPG leaks and CO2 levels in the cabin.
  - **Alcohol Interlock:** Physical breathalyzer integration preventing drive-mode engagement.
  - **mmWave Radar:** Proximity detection for locking doors when hazards approach.
- **Wireless Telemetry:** Custom ESP32 WebSocket firmware bridging the physical microcontroller to the central ROS 2 / Python control server with sub-20ms latency.

## 🏗️ Hardware Architecture

The physical vehicle operates on a distributed edge-computing model:

1. **The Edge Microcontrollers ( Arduino UNO Q)**
   - Responsible for direct hardware actuation (Motors, Relays, Servos).
   - Constantly streams analog sensor data (Gas, Alcohol, Temperature) up to the compute unit.
   - Listens for highest-priority interrupt signals from the Safety Manager.
   - Runs the heavy AI Perception models (YOLOv8) and the Local Planner (TEB).
   - Houses the **Central Safety Manager**, which evaluates risk and commands the microcontrollers.
2. **The Digital Twin Command Center (React)**
   - A live telemetry dashboard used to monitor the physical hardware health (PWM status, Relay armed state, Sensor readings) during the SIH presentation.

## 💻 Tech Stack
*   **Hardware & Firmware:** Arduimo UNO Q, C++ (Arduino Core), L298N Motor Controllers, MQ-X Sensors, 5V Relays, mmWave Sensors,MPU6050, DHT11, GPS, YDLidar.
*   **Control Server:** Python 3, Asyncio, WebSockets.
*   **Digital Twin UI:** React 18, Vite, Tailwind CSS v4, HTML5 Canvas.


## 🧪 Hardware Safety Scenarios (SIH Demo)

Our physical prototype is designed to demonstrate hardware responses to extreme edge cases:

1.  **Drunk Driver Interlock:** Blowing into the physical alcohol sensor instantly triggers a hardware lock, cutting the L298N motor driver PWM signal.
2.  **Driver Asleep (Emergency Pull-Over):** When the camera detects drowsiness, the steering actuator physically turns the wheels to guide the chassis to the shoulder.
3.  **Gas Leak Engine Cut:** If the MQ sensor detects an LPG leak, the physical 5V emergency relay is tripped, immediately killing engine power and rolling down the windows.

---
*Built with ❤️ for the Smart India Hackathon.*
