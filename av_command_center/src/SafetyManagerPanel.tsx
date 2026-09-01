import React from 'react';
import { ShieldCheck, UserX, AlertTriangle, Wind, Lock, Users } from 'lucide-react';
import { useTelemetry } from './TelemetryContext';

const SafetyManagerPanel = () => {
  const { driverState, drowsinessScore, gasState, doorState, hardwareCut } = useTelemetry();

  const isCritical = driverState === 'EMERGENCY' || gasState === 'LEAK_DETECTED' || hardwareCut;
  const isWarning = driverState === 'WARNING' || doorState === 'LOCKED';

  return (
    <div className="flex flex-col gap-4">
      {/* Central Safety Manager - The Boss */}
      <div className={`bg-surface border ${isCritical ? 'border-critical' : isWarning ? 'border-warning' : 'border-border'} rounded p-4 relative overflow-hidden transition-colors`}>
        <div className={`absolute top-0 left-0 w-1 h-full ${isCritical ? 'bg-critical animate-pulse' : isWarning ? 'bg-warning' : 'bg-positive'}`}></div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs text-slate-400 tracking-wider font-bold">CENTRAL SAFETY MANAGER</span>
          <span className={`px-2 py-1 ${isCritical ? 'bg-critical/10 text-critical border-critical/30' : isWarning ? 'bg-warning/10 text-warning border-warning/30' : 'bg-positive/10 text-positive border-positive/30'} border rounded text-[10px] font-bold tracking-wider flex items-center gap-1`}>
            {isCritical ? 'SYSTEM OVERRIDE' : isWarning ? 'ELEVATED RISK' : 'SYSTEM NOMINAL'}
          </span>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          <div className="flex flex-col items-center p-2 bg-slate-800/50 rounded border border-border/50">
            <span className="text-[10px] text-slate-500 mb-1">EXTERNAL</span>
            <span className="text-xs font-mono text-positive">LOW</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-slate-800/50 rounded border border-border/50">
            <span className="text-[10px] text-slate-500 mb-1">DRIVER</span>
            <span className={`text-xs font-mono ${driverState === 'EMERGENCY' ? 'text-critical' : driverState === 'WARNING' ? 'text-warning' : 'text-positive'}`}>{driverState}</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-slate-800/50 rounded border border-border/50">
            <span className="text-[10px] text-slate-500 mb-1">OCCUPANT</span>
            <span className="text-xs font-mono text-positive">LOW</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-slate-800/50 rounded border border-border/50">
            <span className="text-[10px] text-slate-500 mb-1">VEHICLE</span>
            <span className={`text-xs font-mono ${gasState === 'LEAK_DETECTED' ? 'text-critical' : 'text-positive'}`}>{gasState === 'LEAK_DETECTED' ? 'CRITICAL' : 'LOW'}</span>
          </div>
        </div>
      </div>

      {/* Subsystem Grid */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* Driver Monitoring */}
        <div className={`bg-surface border ${driverState !== 'NORMAL' ? 'border-warning' : 'border-border'} rounded p-3 flex flex-col justify-between transition-colors`}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] text-slate-400 tracking-wider">DRIVER MONITOR</span>
            <UserX className="w-3 h-3 text-slate-500" />
          </div>
          <div className="mb-2">
            <span className={`text-sm font-mono font-bold ${driverState === 'EMERGENCY' ? 'text-critical' : driverState === 'WARNING' ? 'text-warning' : 'text-positive'}`}>{driverState}</span>
            <span className="text-[10px] text-slate-500 block">Drowsiness: {drowsinessScore}</span>
          </div>
          <div className="flex gap-1">
            <span className={`flex-1 text-center py-0.5 text-[8px] rounded border ${driverState === 'EMERGENCY' ? 'bg-critical/10 text-critical border-critical/20' : 'bg-positive/10 text-positive border-positive/20'}`}>{driverState === 'EMERGENCY' ? 'EYES CLOSED' : 'EYES OPEN'}</span>
          </div>
        </div>

        {/* Alcohol Interlock */}
        <div className="bg-surface border border-border rounded p-3 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] text-slate-400 tracking-wider">ALCOHOL INTERLOCK</span>
            <AlertTriangle className="w-3 h-3 text-slate-500" />
          </div>
          <div className="mb-2">
            <span className="text-sm font-mono text-positive font-bold">CLEAR</span>
            <span className="text-[10px] text-slate-500 block">Drive Authorized</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
            <div className="bg-positive h-full w-[5%]"></div>
          </div>
        </div>

        {/* Gas / Cabin Safety */}
        <div className={`bg-surface border ${gasState === 'LEAK_DETECTED' ? 'border-critical' : 'border-border'} rounded p-3 flex flex-col justify-between transition-colors`}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] text-slate-400 tracking-wider">CABIN & GAS</span>
            <Wind className="w-3 h-3 text-slate-500" />
          </div>
          <div className="grid grid-cols-2 gap-2 mb-1">
            <div>
              <span className="text-[10px] text-slate-500 block">LPG/CNG</span>
              <span className={`text-xs font-mono ${gasState === 'LEAK_DETECTED' ? 'text-critical animate-pulse' : 'text-positive'}`}>{gasState}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">CO2</span>
              <span className="text-xs font-mono text-slate-300">742 ppm</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-500">Temp: <span className="text-slate-300">24.2°C</span></span>
        </div>

        {/* Door Safety */}
        <div className={`bg-surface border ${doorState === 'LOCKED' ? 'border-warning' : 'border-border'} rounded p-3 flex flex-col justify-between transition-colors`}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] text-slate-400 tracking-wider">DOOR SAFETY</span>
            <Lock className="w-3 h-3 text-slate-500" />
          </div>
          <div className="mb-2">
            <span className={`text-sm font-mono font-bold ${doorState === 'LOCKED' ? 'text-warning' : 'text-positive'}`}>{doorState}</span>
            <span className={`text-[10px] block ${doorState === 'LOCKED' ? 'text-warning' : 'text-slate-500'}`}>{doorState === 'LOCKED' ? 'Hazard Approaching' : 'Safe to exit'}</span>
          </div>
          <div className="flex items-center gap-2">
            {doorState === 'LOCKED' && <div className="w-2 h-2 rounded-full bg-warning animate-pulse"></div>}
            <span className="text-[10px] text-slate-400">mmWave Radar Active</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SafetyManagerPanel;
