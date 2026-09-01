import React from 'react';
import { Activity, Server, Cpu, HardDrive, Wifi, ShieldAlert } from 'lucide-react';

const SystemMonitorScreen = () => {
  return (
    <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
      
      {/* Top Stats */}
      <div className="grid grid-cols-4 gap-4 shrink-0">
        <div className="bg-surface border border-border rounded p-4 flex flex-col">
          <span className="text-xs text-slate-400 tracking-wider mb-2">ROS 2 CORE</span>
          <span className="text-2xl font-mono text-positive font-bold">CONNECTED</span>
          <span className="text-[10px] text-slate-500 mt-1">Domain ID: 42</span>
        </div>
        <div className="bg-surface border border-border rounded p-4 flex flex-col">
          <span className="text-xs text-slate-400 tracking-wider mb-2">ACTIVE NODES</span>
          <span className="text-2xl font-mono text-white font-bold">18</span>
          <span className="text-[10px] text-slate-500 mt-1">Topics: 34 | Services: 11</span>
        </div>
        <div className="bg-surface border border-border rounded p-4 flex flex-col">
          <span className="text-xs text-slate-400 tracking-wider mb-2">MSG RATE</span>
          <span className="text-2xl font-mono text-white font-bold">486</span>
          <span className="text-[10px] text-slate-500 mt-1">messages / sec</span>
        </div>
        <div className="bg-surface border border-border rounded p-4 flex flex-col">
          <span className="text-xs text-slate-400 tracking-wider mb-2">LATENCY</span>
          <span className="text-2xl font-mono text-white font-bold">12 <span className="text-sm">ms</span></span>
          <span className="text-[10px] text-slate-500 mt-1">ROSbridge Websocket</span>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        
        {/* Hardware Health */}
        <div className="flex-1 bg-surface border border-border rounded p-4 flex flex-col">
          <h3 className="text-sm text-slate-400 tracking-wider mb-4 border-b border-border pb-2">HARDWARE HEALTH</h3>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
              <div className="flex items-center gap-3">
                <Cpu className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono text-slate-300">ESP32 BRIDGE</span>
              </div>
              <span className="px-2 py-0.5 bg-positive/10 text-positive text-[10px] rounded border border-positive/30">ONLINE</span>
            </div>
            
            <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono text-slate-300">MOTOR DRIVER (PWM)</span>
              </div>
              <span className="px-2 py-0.5 bg-positive/10 text-positive text-[10px] rounded border border-positive/30">ONLINE</span>
            </div>

            <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
              <div className="flex items-center gap-3">
                <HardDrive className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono text-slate-300">STEERING ACTUATOR</span>
              </div>
              <span className="px-2 py-0.5 bg-positive/10 text-positive text-[10px] rounded border border-positive/30">ONLINE</span>
            </div>

            <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-4 h-4 text-warning" />
                <span className="text-xs font-mono text-slate-300">EMERGENCY RELAY</span>
              </div>
              <span className="px-2 py-0.5 bg-warning/10 text-warning text-[10px] rounded border border-warning/30">ARMED</span>
            </div>
          </div>
        </div>

        {/* ROS Graph Mockup */}
        <div className="flex-[2] bg-surface border border-border rounded p-4 flex flex-col">
          <h3 className="text-sm text-slate-400 tracking-wider mb-4 border-b border-border pb-2">ROS 2 GRAPH TOPOLOGY</h3>
          <div className="flex-1 border border-border/50 bg-[#0b1120] rounded flex items-center justify-center relative overflow-hidden p-4">
            {/* Simple CSS-based Graph Mockup */}
            <div className="flex w-full h-full justify-between items-center px-8">
              {/* Sensors */}
              <div className="flex flex-col gap-4">
                <div className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-xs font-mono text-slate-300">/camera_node</div>
                <div className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-xs font-mono text-slate-300">/lidar_node</div>
                <div className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-xs font-mono text-slate-300">/gas_sensor</div>
              </div>
              
              {/* Middle Layer */}
              <div className="flex flex-col gap-4">
                <div className="px-3 py-2 bg-primary/20 border border-primary/50 rounded text-xs font-mono text-primary">/perception_node</div>
                <div className="px-3 py-2 bg-primary/20 border border-primary/50 rounded text-xs font-mono text-primary">/world_model</div>
                <div className="px-3 py-2 bg-warning/20 border border-warning/50 rounded text-xs font-mono text-warning">/safety_manager</div>
              </div>

              {/* Outputs */}
              <div className="flex flex-col gap-4">
                <div className="px-3 py-2 bg-positive/20 border border-positive/50 rounded text-xs font-mono text-positive">/local_planner</div>
                <div className="px-3 py-2 bg-critical/20 border border-critical/50 rounded text-xs font-mono text-critical">/vehicle_control</div>
              </div>
            </div>
            {/* Connecting lines mocked via SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
              <path d="M 150 100 C 250 100, 250 150, 350 150" stroke="#334155" strokeWidth="2" fill="none" />
              <path d="M 150 200 C 250 200, 250 150, 350 150" stroke="#334155" strokeWidth="2" fill="none" />
              <path d="M 150 300 C 250 300, 250 250, 350 250" stroke="#334155" strokeWidth="2" fill="none" />
              
              <path d="M 500 150 C 600 150, 600 100, 700 100" stroke="#38bdf8" strokeWidth="2" strokeDasharray="5,5" fill="none" />
              <path d="M 500 250 C 600 250, 600 300, 700 300" stroke="#f59e0b" strokeWidth="2" fill="none" />
            </svg>
          </div>
        </div>

      </div>

      {/* Event Stream */}
      <div className="bg-surface border border-border rounded p-4 h-48 flex flex-col shrink-0">
        <h3 className="text-sm text-slate-400 tracking-wider mb-3 border-b border-border pb-2">SYSTEM EVENT STREAM</h3>
        <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-1 font-mono text-xs">
          <div className="flex gap-4 p-1 hover:bg-slate-800 rounded">
            <span className="text-slate-500">21:06:38.112</span>
            <span className="text-primary w-24">SAFETY</span>
            <span className="text-slate-300">Door lock maintained due to approaching hazard.</span>
          </div>
          <div className="flex gap-4 p-1 hover:bg-slate-800 rounded">
            <span className="text-slate-500">21:06:37.405</span>
            <span className="text-warning w-24">PLANNER</span>
            <span className="text-warning">Local path replanned. Trajectory deviation detected.</span>
          </div>
          <div className="flex gap-4 p-1 hover:bg-slate-800 rounded">
            <span className="text-slate-500">21:06:37.102</span>
            <span className="text-primary w-24">RISK</span>
            <span className="text-slate-300">TTC reduced to 2.8 s.</span>
          </div>
          <div className="flex gap-4 p-1 hover:bg-slate-800 rounded">
            <span className="text-slate-500">21:06:36.884</span>
            <span className="text-primary w-24">PREDICTION</span>
            <span className="text-slate-300">M03 merge probability elevated to 60%.</span>
          </div>
          <div className="flex gap-4 p-1 hover:bg-slate-800 rounded">
            <span className="text-slate-500">21:06:35.001</span>
            <span className="text-positive w-24">PERCEPTION</span>
            <span className="text-slate-300">Motorcycle M03 detected at 8.4m.</span>
          </div>
          <div className="flex gap-4 p-1 hover:bg-slate-800 rounded">
            <span className="text-slate-500">21:06:32.441</span>
            <span className="text-slate-400 w-24">INFO</span>
            <span className="text-slate-400">Global path generated successfully (184.2m).</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SystemMonitorScreen;
