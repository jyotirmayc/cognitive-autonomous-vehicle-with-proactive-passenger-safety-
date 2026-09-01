import React from 'react';
import { useTelemetry } from './TelemetryContext';

const RiskEnginePanel = () => {
  const { riskScore, ttc, decision } = useTelemetry();
  
  const isElevated = parseFloat(riskScore) > 0.4;

  return (
    <div className="bg-surface border border-border rounded flex flex-col p-4 flex-1 transition-colors">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs text-slate-400 tracking-wider">RISK ENGINE & PREDICTION</span>
        <span className={`px-2 py-1 ${isElevated ? 'bg-warning/10 text-warning border-warning/30' : 'bg-positive/10 text-positive border-positive/30'} border rounded text-[10px] font-bold tracking-wider`}>
          {isElevated ? 'ELEVATED RISK' : 'NOMINAL RISK'}
        </span>
      </div>

      <div className="flex gap-4">
        {/* Behavior Prediction */}
        <div className="flex-1 border border-border rounded p-3 bg-slate-800/20">
          <span className="text-[10px] text-slate-500 block mb-2">BEHAVIOR PREDICTION [M03]</span>
          
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs text-slate-400 w-12">Merge</span>
            <div className="flex-1 h-1.5 bg-slate-800 rounded overflow-hidden">
              <div className={`h-full ${isElevated ? 'bg-warning w-[60%]' : 'bg-positive w-[10%]'}`}></div>
            </div>
            <span className={`text-[10px] font-mono ${isElevated ? 'text-warning' : 'text-slate-400'}`}>{isElevated ? '60%' : '10%'}</span>
          </div>
          
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs text-slate-400 w-12">Continue</span>
            <div className="flex-1 h-1.5 bg-slate-800 rounded overflow-hidden">
              <div className={`h-full bg-slate-500 ${isElevated ? 'w-[25%]' : 'w-[80%]'}`}></div>
            </div>
            <span className="text-[10px] font-mono text-slate-400">{isElevated ? '25%' : '80%'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 w-12">Stop</span>
            <div className="flex-1 h-1.5 bg-slate-800 rounded overflow-hidden">
              <div className="h-full bg-slate-500 w-[15%]"></div>
            </div>
            <span className="text-[10px] font-mono text-slate-400">10%</span>
          </div>
        </div>

        {/* Risk Scores */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-slate-500 block">TTC (TIME TO COLLISION)</span>
            <span className={`text-lg font-mono font-bold ${isElevated ? 'text-warning' : 'text-positive'}`}>{ttc}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block">RISK SCORE</span>
            <span className="text-lg text-white font-mono font-bold">{riskScore}</span>
          </div>
        </div>
      </div>

      {/* Autonomous Decision */}
      <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
        <div>
          <span className="text-[10px] text-slate-500 block mb-1">AUTONOMOUS DECISION</span>
          <span className="text-xs text-slate-300">
            {decision === 'CRUISE' ? 'Maintaining safe trajectory.' : 
             decision === 'SLOW' ? 'Motorcycle predicted to merge. Slowing.' : 
             decision === 'EMERGENCY PULL-OVER' ? 'Driver incapacitated. Pulling over.' :
             'Hardware Kill Engaged!'}
          </span>
        </div>
        <div className={`px-3 py-1.5 ${decision === 'CRUISE' ? 'bg-positive text-background' : decision === 'HARDWARE KILL' ? 'bg-critical text-white animate-pulse' : 'bg-warning text-background'} font-bold text-xs rounded`}>
          {decision}
        </div>
      </div>
    </div>
  );
};

export default RiskEnginePanel;
