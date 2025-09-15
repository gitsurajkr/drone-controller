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
    
    compassMarks.push(
      <line
        key={i}
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke="#6b7280"
        strokeWidth={angle % 90 === 0 ? 2 : 1}
      />
    );
  }

  // Cardinal direction labels
  const labels = [
    { text: 'N', x: centerX, y: centerY - innerRadius + 15 },
    { text: 'E', x: centerX + innerRadius - 8, y: centerY + 5 },
    { text: 'S', x: centerX, y: centerY + innerRadius - 5 },
    { text: 'W', x: centerX - innerRadius + 8, y: centerY + 5 },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="absolute inset-0">
          {/* Outer circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={outerRadius}
            fill="white"
            stroke="#374151"
            strokeWidth="2"
          />
          
          {/* Inner circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={innerRadius * 0.3}
            fill="#f3f4f6"
            stroke="#6b7280"
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
              className="text-xs font-bold fill-gray-700"
            >
              {label.text}
            </text>
          ))}
          
          {/* Heading needle */}
          <line
            x1={centerX}
            y1={centerY}
            x2={needleX}
            y2={needleY}
            stroke="#dc2626"
            strokeWidth="3"
            strokeLinecap="round"
          />
          
          {/* Center dot */}
          <circle
            cx={centerX}
            cy={centerY}
            r="3"
            fill="#dc2626"
          />
          
          {/* Drone icon at needle tip */}
          <g transform={`translate(${needleX - 8}, ${needleY - 8}) rotate(${heading}, 8, 8)`}>
            <Navigation 
              size={16} 
              className="fill-blue-600 stroke-blue-800" 
            />
          </g>
        </svg>
      </div>
      
      {showLabel && (
        <div className="mt-2 text-center">
          <div className="text-sm font-medium text-gray-700">
            {heading.toFixed(0)}°
          </div>
          <div className="text-xs text-gray-500">
            Heading
          </div>
        </div>
      )}
    </div>
  );
};