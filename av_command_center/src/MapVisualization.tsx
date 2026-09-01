import React, { useEffect, useRef } from 'react';

const MapVisualization = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 0.02;
      const width = canvas.width;
      const height = canvas.height;
      
      // Center of the canvas (Ego vehicle position)
      const cx = width / 2;
      const cy = height * 0.75; // Vehicle is closer to bottom

      // 1. Clear background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Costmap Grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      const gridSize = 40;
      // Scroll grid to simulate movement
      const offset = (time * 20) % gridSize;
      
      ctx.beginPath();
      for (let x = 0; x <= width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += gridSize) {
        ctx.moveTo(0, y + offset);
        ctx.lineTo(width, y + offset);
      }
      ctx.stroke();

      // 3. Draw Global Path (Cyan dashed line)
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.bezierCurveTo(cx, cy - 150, cx + 100, cy - 250, cx + 50, 0);
      ctx.stroke();
      ctx.setLineDash([]); // Reset

      // 4. Draw Local Planner Candidates
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      // Candidate 1 (left)
      ctx.moveTo(cx, cy);
      ctx.quadraticCurveTo(cx - 30, cy - 80, cx - 40, cy - 160);
      // Candidate 2 (right)
      ctx.moveTo(cx, cy);
      ctx.quadraticCurveTo(cx + 40, cy - 80, cx + 60, cy - 150);
      ctx.stroke();

      // 5. Draw Selected Local Trajectory
      ctx.strokeStyle = '#22c55e'; // Green safe path
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.quadraticCurveTo(cx + 10, cy - 100, cx + 30, cy - 200);
      ctx.stroke();

      // 6. Draw Risk Zones / Costmap Obstacle Blobs
      const obstacleX = cx - 40;
      const obstacleY = cy - 160;
      
      const gradient = ctx.createRadialGradient(obstacleX, obstacleY, 0, obstacleX, obstacleY, 60);
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)'); // Critical red center
      gradient.addColorStop(0.5, 'rgba(245, 158, 11, 0.2)'); // Amber warning
      gradient.addColorStop(1, 'rgba(15, 23, 42, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(obstacleX, obstacleY, 60, 0, Math.PI * 2);
      ctx.fill();

      // 7. Draw Tracked Object (Motorcycle M03)
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(obstacleX - 10, obstacleY - 20, 20, 40);
      
      // Object Vector/Predicted trajectory
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(obstacleX, obstacleY);
      ctx.lineTo(obstacleX + 30, obstacleY + 40);
      ctx.stroke();

      // Object Label
      ctx.fillStyle = 'white';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText('M03 (Motorcycle)', obstacleX + 15, obstacleY - 5);
      ctx.fillText('v: 4.2 m/s', obstacleX + 15, obstacleY + 7);

      // 8. Draw Simulated LiDAR Point Cloud
      ctx.fillStyle = '#94a3b8';
      for(let i=0; i<50; i++) {
         const px = obstacleX + (Math.random() - 0.5) * 80;
         const py = obstacleY + (Math.random() - 0.5) * 80;
         ctx.fillRect(px, py, 2, 2);
      }

      // 9. Draw Ego Vehicle
      ctx.save();
      ctx.translate(cx, cy);
      // Slight steer animation based on selected path
      ctx.rotate(0.05 * Math.sin(time)); 
      
      // Car Body
      ctx.fillStyle = '#38bdf8'; // Cyan
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 15;
      ctx.fillRect(-12, -25, 24, 50);
      
      // Car direction indicator
      ctx.fillStyle = 'white';
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.moveTo(0, -15);
      ctx.lineTo(6, -5);
      ctx.lineTo(-6, -5);
      ctx.fill();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    // Start render loop
    render();

    // Handle resize
    const handleResize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial sizing

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full block"></canvas>
      
      {/* Map Overlays */}
      <div className="absolute top-4 left-4 flex gap-2">
        <span className="px-2 py-1 bg-slate-900/80 border border-slate-700 rounded text-[10px] font-mono text-slate-300 backdrop-blur">
          GLOBAL PLANNER: Nav2
        </span>
        <span className="px-2 py-1 bg-primary/20 border border-primary/50 rounded text-[10px] font-mono text-primary backdrop-blur">
          LOCAL: Adaptive TEB
        </span>
      </div>
      
      <div className="absolute bottom-4 left-4">
        <span className="px-2 py-1 bg-slate-900/80 border border-slate-700 rounded text-[10px] font-mono text-slate-400 backdrop-blur flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-critical animate-pulse"></div>
          M03 TTC: 2.8s
        </span>
      </div>
      
      <div className="absolute bottom-4 right-4 flex flex-col gap-1 items-end">
        <div className="text-[10px] font-mono text-slate-500">SCALE: 1 GRID = 2M</div>
        <div className="text-[10px] font-mono text-slate-500">MODE: 2D COSTMAP</div>
      </div>
    </div>
  );
};

export default MapVisualization;
