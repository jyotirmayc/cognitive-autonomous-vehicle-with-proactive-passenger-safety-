# Dashboard Architecture Migration Plan

## 1. Current Architecture
- **Frontend Stack**: Vanilla HTML5, CSS (Bootstrap 5 via CDN), Vanilla JavaScript.
- **Data Layer**: Direct `roslibjs` integration in `app.js` connecting to `ws://localhost:9090`.
- **Component Hierarchy**: Monolithic `index.html` structure with simple Bootstrap Grid cards.
- **Visuals**: Light theme, basic text-based telemetry, static layout, no map/spatial visualization.
- **Backend/Sim**: The backend is abstracted to either a real ROS 2 graph via `rosbridge_server`, or the `standalone_demo.py` WebSocket mock server we built.

## 2. Target Architecture
- **Frontend Stack**: React 18, TypeScript, Vite, Tailwind CSS.
- **UI Components**: Headless UI / custom atomic components (Cards, Badges, Modals), Lucide React (technical icons).
- **Visualization**: HTML5 Canvas / SVG for map rendering, Recharts for telemetry analytics.
- **Data Layer**: Centralized Context API or Zustand store managing WebSocket state and abstracting ROS/Simulator connections.
- **Styling**: "Dark Command Center" theme. Glassmorphism, tight typography (mono-spaced numbers), restrained semantic coloring (Green/Amber/Red/Cyan).

## 3. Data Flow & Telemetry Schema
The frontend will manage a normalized global state object. Whether data comes from `roslibjs` or the standalone Python simulator, it will be mapped to this schema:

```typescript
interface TelemetryState {
  mission: {
    status: 'ACTIVE' | 'EN_ROUTE' | 'IDLE';
    origin: string;
    destination: string;
    progress: number; // 0-100
  };
  vehicle: {
    speed: number;
    steering: number;
    battery: number;
  };
  navigation: {
    global_path: Point2D[];
    local_path: Point2D[];
    costmap: CostmapGrid;
  };
  perception: {
    tracked_objects: TrackedObject[];
  };
  safety: {
    manager_state: 'NORMAL' | 'WARNING' | 'EMERGENCY' | 'CRITICAL';
    driver: 'NORMAL' | 'DROWSY' | 'UNRESPONSIVE';
    alcohol: 'CLEAR' | 'DRIVE_DISABLED';
    gas: 'SAFE' | 'LEAK_DETECTED';
    door: 'LOCKED' | 'UNLOCKED';
    cabin: 'NORMAL' | 'CRITICAL';
  };
  system: {
    ros_connected: boolean;
    hardware_mode: 'SIMULATION' | 'LIVE_HARDWARE';
    latency_ms: number;
  };
  event_log: SystemEvent[];
}
```

## 4. Component Hierarchy
```text
App
 ├── Header (Mission Status, Connection Health, Toggles)
 ├── Sidebar (Navigation Menu)
 └── MainLayout
      ├── OverviewScreen (Default Command Center)
      │    ├── MapVisualizationPanel (60% width - Global/Local/Costmap/Objects)
      │    ├── PerceptionPanel (Camera sim, Object Tracking Table)
      │    ├── SafetyManagerPanel (Central status + subsystem nodes)
      │    └── VehicleTelemetryPanel (Gauges, speeds)
      ├── NavigationScreen (Full screen map)
      ├── SafetyScreen (Detailed risk matrix and state machines)
      └── AnalyticsScreen (Recharts telemetry graphs)
```

## 5. ROS 2 Integration Plan
The React application will include a `useROS` custom hook.
- When `SYSTEM MODE` is set to `LIVE_HARDWARE` or `ROS_SIM`, it will mount `roslibjs`, connect to `ws://localhost:9090`, and map incoming topics (`/safe_cmd_vel`, `/world_state`, etc.) to the `TelemetryState`.
- When set to `DEMO`, it will use an internal deterministic tick-loop to simulate a compelling, repeatable 60-second narrative (moving on a map, detecting a motorcycle, driver falling asleep, etc.) for judges.

## 6. Implementation Phases
*   **Phase 1**: Initialize Vite/React project, setup Tailwind, create base layout (Sidebar, Header, Dark Theme).
*   **Phase 2**: Implement the `TelemetryState` provider and the `MapVisualizationPanel` (Canvas-based ego vehicle, obstacles, path rendering).
*   **Phase 3**: Build Perception, Risk Engine, and Vehicle Telemetry cards.
*   **Phase 4**: Build the Central Safety Manager UI and integrate the existing subsystems (Driver, Gas, Alcohol).
*   **Phase 5**: Build the professional Event Stream and Analytics pages.
*   **Phase 6**: Wire up the "SIH Presentation Demo Mode" deterministic data simulator and finalize responsive polish.
