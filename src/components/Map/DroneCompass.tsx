// src/components/Map/DroneCompass.tsx
import React from 'react';
import { Navigation } from 'lucide-react';

interface DroneCompassProps {
  heading: number;
  size?: number;
  showLabel?: boolean;
}

export const DroneCompass: React.FC<DroneCompassProps> = ({ 
  heading, 
  size = 100, 
  showLabel = true 
}) => {
  const radius = size / 2;
  const centerX = radius;
  const centerY = radius;
  const innerRadius = radius * 0.75;
  const outerRadius = radius * 0.9;

  // Calculate needle position
  const needleLength = radius * 0.7;
  const needleX = centerX + needleLength * Math.sin((heading * Math.PI) / 180);
  const needleY = centerY - needleLength * Math.cos((heading * Math.PI) / 180);

  // Compass rose marks (every 30 degrees)
  const compassMarks = [];
  for (let i = 0; i < 12; i++) {
    const angle = i * 30;
    const radian = (angle * Math.PI) / 180;
    const startX = centerX + innerRadius * Math.sin(radian);
    const startY = centerY - innerRadius * Math.cos(radian);
    const endX = centerX + outerRadius * Math.sin(radian);
    const endY = centerY - outerRadius * Math.cos(radian);
    
    const isCardinal = angle % 90 === 0;
    
    compassMarks.push(
      <line
        key={i}
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke={isCardinal ? "#06b6d4" : "#64748b"}
        strokeWidth={isCardinal ? 2 : 1}
        style={{
          filter: isCardinal ? "drop-shadow(0 0 2px #06b6d4)" : "none"
        }}
      />
    );
  }

  // Cardinal direction labels
  const labels = [
    { text: 'N', x: centerX, y: centerY - innerRadius + 15, color: '#ef4444' },
    { text: 'E', x: centerX + innerRadius - 8, y: centerY + 5, color: '#06b6d4' },
    { text: 'S', x: centerX, y: centerY + innerRadius - 5, color: '#06b6d4' },
    { text: 'W', x: centerX - innerRadius + 8, y: centerY + 5, color: '#06b6d4' },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="absolute inset-0">
          {/* Outer ring with gradient */}
          <defs>
            <radialGradient id="compassGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1f2937" stopOpacity="0.9" />
              <stop offset="80%" stopColor="#111827" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#000000" stopOpacity="1" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Outer circle with futuristic glow */}
          <circle
            cx={centerX}
            cy={centerY}
            r={outerRadius}
            fill="url(#compassGradient)"
            stroke="#06b6d4"
            strokeWidth="2"
            style={{ filter: "drop-shadow(0 0 8px rgba(6, 182, 212, 0.5))" }}
          />
          
          {/* Secondary ring */}
          <circle
            cx={centerX}
            cy={centerY}
            r={innerRadius}
            fill="none"
            stroke="#334155"
            strokeWidth="1"
            strokeDasharray="5,5"
            opacity="0.6"
          />
          
          {/* Inner circle with tech pattern */}
          <circle
            cx={centerX}
            cy={centerY}
            r={innerRadius * 0.3}
            fill="#1e293b"
            stroke="#475569"
            strokeWidth="1"
          />
          
          {/* Compass marks */}
          {compassMarks}
          
          {/* Cardinal direction labels */}
          {labels.map((label, index) => (
            <text
              key={index}
              x={label.x}
              y={label.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs font-bold font-mono"
              fill={label.color}
              style={{ filter: `drop-shadow(0 0 3px ${label.color})` }}
            >
              {label.text}
            </text>
          ))}
          
          {/* Heading needle with glow */}
          <line
            x1={centerX}
            y1={centerY}
            x2={needleX}
            y2={needleY}
            stroke="#06b6d4"
            strokeWidth="3"
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 4px #06b6d4)" }}
          />
          
          {/* Center dot with pulse effect */}
          <circle
            cx={centerX}
            cy={centerY}
            r="4"
            fill="#06b6d4"
            style={{ filter: "drop-shadow(0 0 6px #06b6d4)" }}
          >
            <animate
              attributeName="r"
              values="3;5;3"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          
          {/* Target crosshair */}
          <g opacity="0.7">
            <line x1={centerX - 8} y1={centerY} x2={centerX + 8} y2={centerY} stroke="#06b6d4" strokeWidth="1" />
            <line x1={centerX} y1={centerY - 8} x2={centerX} y2={centerY + 8} stroke="#06b6d4" strokeWidth="1" />
          </g>
          
          {/* Drone icon at needle tip with futuristic styling */}
          <g transform={`translate(${needleX - 8}, ${needleY - 8}) rotate(${heading}, 8, 8)`}>
            <Navigation 
              size={16} 
              className="fill-cyan-400 stroke-cyan-300" 
              style={{ filter: "drop-shadow(0 0 3px #06b6d4)" }}
            />
          </g>
        </svg>
        
        {/* Tactical grid overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent" />
        </div>
      </div>
      
      {showLabel && (
        <div className="mt-3 text-center bg-gray-900/80 backdrop-blur-sm border border-cyan-400/30 rounded-lg px-3 py-2">
          <div className="text-sm font-bold font-mono text-cyan-400">
            {heading.toFixed(0)}°
          </div>
          <div className="text-xs text-cyan-400/70">
            HEADING
          </div>
        </div>
      )}
    </div>
  );
};