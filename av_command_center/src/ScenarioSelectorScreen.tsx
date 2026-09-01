import React from 'react';
import { Play, RotateCcw, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { useTelemetry } from './TelemetryContext';

const scenarios = [
  { id: 1, name: "Full Pipeline Demo", desc: "Showcases perception, prediction, local planner evasion, and driver drowsiness hardware override in a 35s loop.", type: "nominal" },
  { id: 2, name: "Motorcycle Door Hazard", desc: "Motorcycle passes close to the vehicle; door safety engages.", type: "hazard" },
  { id: 3, name: "Drunk Driver Prevented", desc: "Alcohol interlock detects BAC > 0.05 and blocks drive mode.", type: "critical" },
  { id: 4, name: "Driver Asleep (Emergency)", desc: "Driver drowsiness escalates; system pulls over to shoulder.", type: "critical" },
  { id: 5, name: "Gas Leak (Hardware Kill)", desc: "CNG leak detected; engine cut and windows rolled down.", type: "critical" },
  { id: 6, name: "Sudden Cattle Crossing", desc: "Large animal enters the road; emergency braking applied.", type: "hazard" },
];

const ScenarioSelectorScreen = () => {
  const { startDemo, isDemoActive } = useTelemetry();

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto max-w-5xl mx-auto w-full">
      
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-mono text-white mb-2">SCENARIO TESTING SUITE</h2>
          <p className="text-sm text-slate-400">Select an edge-case scenario to inject into the digital twin simulation.</p>
        </div>
        <div className="px-4 py-2 bg-slate-800 border border-slate-600 rounded flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-warning animate-pulse"></div>
          <span className="text-xs font-mono text-warning tracking-wider">SIMULATION MODE ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {scenarios.map((s) => (
          <div key={s.id} className="bg-surface border border-border hover:border-slate-500 transition-colors rounded p-4 flex flex-col group cursor-pointer">
            <div className="flex justify-between items-start mb-2">
              <span className="text-lg font-mono text-white group-hover:text-primary transition-colors">
                {String(s.id).padStart(2, '0')}. {s.name}
              </span>
              {s.type === 'nominal' && <CheckCircle2 className="w-5 h-5 text-positive" />}
              {s.type === 'hazard' && <AlertOctagon className="w-5 h-5 text-warning" />}
              {s.type === 'critical' && <AlertOctagon className="w-5 h-5 text-critical" />}
            </div>
            <p className="text-sm text-slate-400 mb-6">{s.desc}</p>
            
            <div className="mt-auto flex gap-2">
              <button 
                onClick={s.id === 1 ? startDemo : () => alert('Scenario currently being built for Phase 7!')}
                disabled={isDemoActive}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded text-xs font-bold tracking-wider transition-colors disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                {isDemoActive && s.id === 1 ? 'RUNNING...' : 'EXECUTE'}
              </button>
              <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded text-xs font-bold transition-colors">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 border border-critical/30 bg-critical/5 rounded flex items-start gap-4">
        <AlertOctagon className="w-6 h-6 text-critical shrink-0 mt-1" />
        <div>
          <h4 className="text-sm font-bold text-critical mb-1">SAFETY OVERRIDE WARNING</h4>
          <p className="text-xs text-slate-400">
            Injecting critical scenarios (e.g., Gas Leak, Driver Asleep) will trigger the Central Safety Manager's hardware override protocol. If you are connected to live hardware via the ESP32 bridge, physical relays will actuate. Ensure the vehicle is in a safe test environment.
          </p>
        </div>
      </div>

    </div>
  );
};

export default ScenarioSelectorScreen;
