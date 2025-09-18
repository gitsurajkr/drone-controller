// src/pages/MissionPlanPage.tsx
import React from 'react';
import { MissionPlanner } from '../components/Mission/MissionPlanner';
import { useDroneData } from '../hooks/useDroneData';

export const MissionPlanPage: React.FC = () => {
  const { telemetry } = useDroneData();

  return (
    <div className="h-full">
      <MissionPlanner telemetry={telemetry} />
    </div>
  );
};