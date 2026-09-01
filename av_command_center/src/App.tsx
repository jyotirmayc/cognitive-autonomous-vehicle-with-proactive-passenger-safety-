import React, { useState } from 'react';
import { 
  Activity, Map, ShieldAlert, Crosshair, MapPin, 
  Settings, Terminal, Radio, Battery, Video, Thermometer, UserCheck
} from 'lucide-react';
import MapVisualization from './MapVisualization';
import PerceptionPanel from './PerceptionPanel';
import RiskEnginePanel from './RiskEnginePanel';
import SafetyManagerPanel from './SafetyManagerPanel';
import SystemMonitorScreen from './SystemMonitorScreen';
import ScenarioSelectorScreen from './ScenarioSelectorScreen';
import { useTelemetry } from './TelemetryContext';

const Header = () => (
  <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-4 shrink-0">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded bg-primary/20 border border-primary flex items-center justify-center">
        <Activity className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h1 className="text-sm font-bold tracking-wider text-white">COGNITIVE AUTONOMOUS VEHICLE</h1>
        <h2 className="text-xs text-slate-400 uppercase tracking-widest">AI-Driven Mobility & Safety</h2>
      </div>
    </div>
    
    <div className="flex flex-col items-center">
      <span className="text-xs text-slate-400 tracking-widest">MISSION</span>
      <span className="text-sm font-mono text-primary font-bold">AUTONOMOUS NAVIGATION</span>
    </div>

    <div className="flex items-center gap-6">
      <div className="flex flex-col items-end">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-positive animate-pulse"></div>
          <span className="text-xs font-mono text-positive">SYSTEM ONLINE</span>
        </div>
        <span className="text-xs text-slate-400">ROS 2: CONNECTED | SIMULATION</span>
      </div>
      <div className="flex gap-4 text-xs font-mono text-slate-400">
        <div>CPU: <span className="text-white">42%</span></div>
        <div>RAM: <span className="text-white">18%</span></div>
        <div>FPS: <span className="text-white">24</span></div>
      </div>
    </div>
  </header>
);

const SidebarItem = ({ icon: Icon, label, active = false, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-l-2 ${
      active 
        ? 'border-primary bg-primary/10 text-primary' 
        : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="tracking-wide">{label}</span>
  </button>
);

const Sidebar = () => (
  <aside className="w-64 bg-surface border-r border-border flex flex-col shrink-0">
    <div className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto">
      <SidebarItem icon={Activity} label="OVERVIEW" active />
      <SidebarItem icon={Map} label="MAP & NAVIGATION" />
      <SidebarItem icon={Video} label="PERCEPTION" />
      <SidebarItem icon={Crosshair} label="PLANNING" />
      <SidebarItem icon={ShieldAlert} label="SAFETY" />
      <SidebarItem icon={UserCheck} label="OCCUPANT" />
      <SidebarItem icon={Battery} label="VEHICLE" />
      <SidebarItem icon={Radio} label="SENSORS" />
      <SidebarItem icon={Terminal} label="ROS / SYSTEM" />
      <SidebarItem icon={MapPin} label="SCENARIOS" />
    </div>
    <div className="p-4 border-t border-border">
      <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-mono border border-slate-600 rounded text-slate-300 transition-colors">
        PRESENTATION MODE
      </button>
    </div>
  </aside>
);

const TelemetryCard = ({ title, children, value, unit, status = 'normal' }: any) => {
  const statusColors = {
    normal: 'text-white',
    warning: 'text-warning',
    critical: 'text-critical',
    positive: 'text-positive'
  };
  
  return (
    <div className="bg-surface border border-border rounded flex flex-col p-4 relative overflow-hidden">
      <div className="text-xs text-slate-400 tracking-wider mb-2">{title}</div>
      {value !== undefined ? (
        <div className="flex items-baseline gap-1 mt-auto">
          <span className={`text-2xl font-mono font-bold ${statusColors[status as keyof typeof statusColors]}`}>{value}</span>
          {unit && <span className="text-xs text-slate-500 font-mono">{unit}</span>}
        </div>
      ) : (
        children
      )}
    </div>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const { speed, steering, startDemo, isDemoActive } = useTelemetry();

  return (
    <div className="h-screen w-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar */}
        <aside className="w-64 bg-surface border-r border-border flex flex-col shrink-0">
          <div className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto">
            <SidebarItem icon={Activity} label="OVERVIEW" active={activeTab === 'OVERVIEW'} onClick={() => setActiveTab('OVERVIEW')} />
            <SidebarItem icon={Map} label="MAP & NAVIGATION" active={activeTab === 'MAP & NAVIGATION'} onClick={() => setActiveTab('MAP & NAVIGATION')} />
            <SidebarItem icon={Video} label="PERCEPTION" active={activeTab === 'PERCEPTION'} onClick={() => setActiveTab('PERCEPTION')} />
            <SidebarItem icon={Crosshair} label="PLANNING" active={activeTab === 'PLANNING'} onClick={() => setActiveTab('PLANNING')} />
            <SidebarItem icon={ShieldAlert} label="SAFETY" active={activeTab === 'SAFETY'} onClick={() => setActiveTab('SAFETY')} />
            <SidebarItem icon={UserCheck} label="OCCUPANT" active={activeTab === 'OCCUPANT'} onClick={() => setActiveTab('OCCUPANT')} />
            <SidebarItem icon={Battery} label="VEHICLE" active={activeTab === 'VEHICLE'} onClick={() => setActiveTab('VEHICLE')} />
            <SidebarItem icon={Radio} label="SENSORS" active={activeTab === 'SENSORS'} onClick={() => setActiveTab('SENSORS')} />
            <SidebarItem icon={Terminal} label="ROS / SYSTEM" active={activeTab === 'ROS / SYSTEM'} onClick={() => setActiveTab('ROS / SYSTEM')} />
            <SidebarItem icon={MapPin} label="SCENARIOS" active={activeTab === 'SCENARIOS'} onClick={() => setActiveTab('SCENARIOS')} />
          </div>
          <div className="p-4 border-t border-border">
            <button 
              onClick={startDemo}
              disabled={isDemoActive}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-mono border border-slate-600 rounded text-slate-300 transition-colors disabled:opacity-50"
            >
              {isDemoActive ? "DEMO RUNNING..." : "PRESENTATION MODE"}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        {activeTab === 'OVERVIEW' && (
          <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
            
            {/* Mission Strip */}
            <div className="bg-surface border border-border rounded flex items-center justify-between p-3 shrink-0">
              <div className="flex items-center gap-8">
                <div>
                  <span className="text-xs text-slate-500 block">START</span>
                  <span className="text-sm text-white font-mono">Campus Gate</span>
                </div>
                <div className="text-primary font-bold">→</div>
                <div>
                  <span className="text-xs text-slate-500 block">DESTINATION</span>
                  <span className="text-sm text-white font-mono">Engineering Block</span>
                </div>
              </div>
              <div className="flex gap-8">
                <div>
                  <span className="text-xs text-slate-500 block">STATUS</span>
                  <span className="text-sm text-primary font-bold font-mono">NAVIGATING</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">DISTANCE</span>
                  <span className="text-sm text-white font-mono">184 m</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">ETA</span>
                  <span className="text-sm text-white font-mono">02:34</span>
                </div>
              </div>
            </div>

            {/* Main Grid */}
            <div className="flex-1 flex gap-4 min-h-0">
              
              {/* LEFT: Map Area (60%) */}
              <div className="flex-[3] bg-surface border border-border rounded relative overflow-hidden">
                <MapVisualization />
              </div>

              {/* RIGHT: Telemetry Panels (40%) */}
              <div className="flex-[2] flex flex-col gap-4 overflow-y-auto pr-2">
                
                {/* Vehicle State */}
                <div className="grid grid-cols-2 gap-4 shrink-0">
                  <TelemetryCard title="SPEED" value={speed} unit="m/s" status="normal" />
                  <TelemetryCard title="STEERING" value={steering} unit="°" status="normal" />
                </div>

                <PerceptionPanel />
                
                <RiskEnginePanel />

                <SafetyManagerPanel />

              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'ROS / SYSTEM' && <SystemMonitorScreen />}
        {activeTab === 'SCENARIOS' && <ScenarioSelectorScreen />}
        
        {/* Fallback for un-implemented tabs */}
        {!['OVERVIEW', 'ROS / SYSTEM', 'SCENARIOS'].includes(activeTab) && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Activity className="w-16 h-16 text-slate-600 mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-mono text-slate-400 mb-2">MODULE DOCKED</h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                The {activeTab} subsystem is currently running in the background. Return to the OVERVIEW screen to see aggregated telemetry.
              </p>
              <button 
                onClick={() => setActiveTab('OVERVIEW')}
                className="mt-6 px-6 py-2 bg-primary/10 text-primary border border-primary/30 rounded font-mono text-xs hover:bg-primary/20 transition-colors"
              >
                RETURN TO OVERVIEW
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
