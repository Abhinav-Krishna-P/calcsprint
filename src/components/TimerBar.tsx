import React from "react";

interface TimerBarProps {
  progress: number; // 0 to 100 (percentage remaining)
  color?: string;
}

export const TimerBar: React.FC<TimerBarProps> = ({ progress, color }) => {
  // Use warning red if progress is less than 25%, else use success green or custom color
  const barColor = color 
    ? color 
    : progress < 25 
      ? "bg-app-error" 
      : "bg-app-success";

  return (
    <div className="w-full h-1.5 bg-app-outline-variant/30">
      <div 
        className={`h-full transition-all duration-100 ease-linear ${barColor}`}
        style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
      />
    </div>
  );
};
export default TimerBar;
