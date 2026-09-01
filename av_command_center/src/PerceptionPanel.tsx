import React from 'react';

const PerceptionPanel = () => {
  return (
    <div className="bg-surface border border-border rounded flex flex-col p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs text-slate-400 tracking-wider">AI PERCEPTION</span>
        <div className="flex gap-2 text-[10px] font-mono">
          <span className="px-1.5 py-0.5 bg-positive/10 text-positive rounded">CAM: ONLINE</span>
          <span className="px-1.5 py-0.5 bg-positive/10 text-positive rounded">LIDAR: ONLINE</span>
          <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded">RADAR: SIM</span>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <div>
          <span className="text-[10px] text-slate-500 block">MODEL</span>
          <span className="text-xs text-white font-mono">YOLOv8</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block">INFERENCE</span>
          <span className="text-xs text-white font-mono">41 ms</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block">TRACKED</span>
          <span className="text-xs text-white font-mono">3 Objects</span>
        </div>
      </div>

      {/* Object Table */}
      <div className="border border-border rounded overflow-hidden">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-800 text-slate-400 border-b border-border">
            <tr>
              <th className="p-2 font-normal">ID</th>
              <th className="p-2 font-normal">CLASS</th>
              <th className="p-2 font-normal">DIST</th>
              <th className="p-2 font-normal">SPEED</th>
              <th className="p-2 font-normal">STATUS</th>
            </tr>
          </thead>
          <tbody className="text-slate-300">
            <tr className="border-b border-border/50 bg-warning/5">
              <td className="p-2 text-warning">M03</td>
              <td className="p-2">Motorcycle</td>
              <td className="p-2">5.4 m</td>
              <td className="p-2">4.2 m/s</td>
              <td className="p-2 text-warning">APPROACHING</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="p-2 text-primary">V01</td>
              <td className="p-2">Car</td>
              <td className="p-2">12.2 m</td>
              <td className="p-2">8.1 m/s</td>
              <td className="p-2 text-slate-500">TRACKING</td>
            </tr>
            <tr>
              <td className="p-2 text-primary">P02</td>
              <td className="p-2">Pedestrian</td>
              <td className="p-2">7.1 m</td>
              <td className="p-2">0.8 m/s</td>
              <td className="p-2 text-slate-500">TRACKING</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PerceptionPanel;
