@echo off
echo ========================================================
echo   AI-DRIVEN COGNITIVE AUTONOMOUS VEHICLE - DEMO LAUNCH
echo ========================================================
echo.

:: Ensure we are in the correct directory
cd /d "%~dp0"
set WS_DIR=%~dp0ros2_ws\src

echo [1/4] Starting ROS 2 Web Bridge (For Dashboard)...
:: Assumes rosbridge_suite is installed. If not, the dashboard will just say "Error connecting"
start cmd /k "echo Starting ROS Bridge... && ros2 launch rosbridge_server rosbridge_websocket_launch.xml"
timeout /t 2 /nobreak > nul

echo [2/4] Waking up the AI Subsystems (12 Nodes)...
:: We use 'start /b' to run them in the background of this window, 
:: or 'start cmd /k' to open separate windows if you want to see the matrix-style logs.
:: For a clean demo, we will run the main ones in the background, but open a separate window for the Safety Manager.

start cmd /k "title SIMULATION & PERCEPTION && python %WS_DIR%\simulation\simulation\mock_sensors_node.py & python %WS_DIR%\perception\perception\perception_node.py"
start cmd /k "title WORLD MODEL & PLANNER && python %WS_DIR%\world_model\world_model\world_model_node.py & python %WS_DIR%\path_planner\path_planner\adaptive_planner_node.py"
start cmd /k "title SAFETY SUBSYSTEMS && python %WS_DIR%\driver_monitoring\driver_monitoring\driver_monitor_node.py & python %WS_DIR%\alcohol_interlock\alcohol_interlock\alcohol_interlock_node.py & python %WS_DIR%\gas_safety\gas_safety\gas_safety_node.py & python %WS_DIR%\door_safety\door_safety\door_safety_node.py"
start cmd /k "title EMERGENCY PARKING && python %WS_DIR%\emergency_parking\emergency_parking\emergency_parking_node.py"

:: Open the Master Safety Manager in its own prominent window so you can see the override logs
start cmd /k "title MASTER CENTRAL SAFETY MANAGER && color 0C && python %WS_DIR%\safety_manager\safety_manager\safety_manager_node.py"

timeout /t 3 /nobreak > nul

echo [3/4] Opening Web Dashboard...
start "" "%~dp0dashboard\index.html"

echo [4/4] Starting Scenario Runner...
echo.
echo The system is live. Opening the Digital Twin controller...
timeout /t 2 /nobreak > nul

:: Run the scenario runner in the main window
title SCENARIO RUNNER
python %~dp0scenarios\scenario_runner.py

pause
