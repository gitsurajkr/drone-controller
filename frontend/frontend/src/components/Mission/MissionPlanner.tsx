// src/components/Mission/MissionPlanner.tsx
import React, { useState, useCallback } from 'react';
import { DroneMap } from '../Map/DroneMap';
import { Plus, Save, Trash2, Upload, Play } from 'lucide-react';
import type { TelemetryData, Waypoint, Mission } from '../../types';

interface MissionPlannerProps {
  telemetry: TelemetryData;
}

const COMMAND_TYPES = [
  { value: 'WAYPOINT', label: 'Navigate to Waypoint' },
  { value: 'TAKEOFF', label: 'Takeoff' },
  { value: 'LAND', label: 'Land' },
  { value: 'RTL', label: 'Return to Launch' },
  { value: 'LOITER_UNLIM', label: 'Loiter Unlimited' },
  { value: 'LOITER_TIME', label: 'Loiter for Time' },
];

export const MissionPlanner: React.FC<MissionPlannerProps> = ({ telemetry }) => {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [selectedWaypoint, setSelectedWaypoint] = useState<string | null>(null);
  const [missionName, setMissionName] = useState('');

  const addWaypoint = useCallback((lat: number, lon: number) => {
    const newWaypoint: Waypoint = {
      id: `wp_${Date.now()}`,
      lat,
      lon,
      alt: 100, // Default altitude
      command: 'WAYPOINT',
      autocontinue: true,
    };
    setWaypoints(prev => [...prev, newWaypoint]);
  }, []);

  const updateWaypoint = useCallback((id: string, updates: Partial<Waypoint>) => {
    setWaypoints(prev => prev.map(wp => 
      wp.id === id ? { ...wp, ...updates } : wp
    ));
  }, []);

  const deleteWaypoint = useCallback((id: string) => {
    setWaypoints(prev => prev.filter(wp => wp.id !== id));
    if (selectedWaypoint === id) {
      setSelectedWaypoint(null);
    }
  }, [selectedWaypoint]);

  const moveWaypoint = useCallback((id: string, direction: 'up' | 'down') => {
    setWaypoints(prev => {
      const index = prev.findIndex(wp => wp.id === id);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newWaypoints = [...prev];
      [newWaypoints[index], newWaypoints[newIndex]] = [newWaypoints[newIndex], newWaypoints[index]];
      return newWaypoints;
    });
  }, []);

  const saveMission = useCallback(() => {
    const mission: Mission = {
      id: `mission_${Date.now()}`,
      name: missionName || 'Untitled Mission',
      waypoints,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Save to localStorage (in a real app, this would be sent to the backend)
    const savedMissions = JSON.parse(localStorage.getItem('drone_missions') || '[]');
    savedMissions.push(mission);
    localStorage.setItem('drone_missions', JSON.stringify(savedMissions));
    
    alert('Mission saved successfully!');
  }, [missionName, waypoints]);

  const clearMission = useCallback(() => {
    if (confirm('Are you sure you want to clear the current mission?')) {
      setWaypoints([]);
      setSelectedWaypoint(null);
      setMissionName('');
    }
  }, []);

  return (
    <div className="h-full flex">
      {/* Mission Planning Panel */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Mission Planner</h2>
          
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Mission name..."
              value={missionName}
              onChange={(e) => setMissionName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <div className="flex space-x-2">
              <button
                onClick={saveMission}
                disabled={waypoints.length === 0}
                className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </button>
              
              <button
                onClick={clearMission}
                className="flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Waypoints List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Waypoints ({waypoints.length})</h3>
              <button className="text-blue-600 hover:text-blue-800">
                <Plus className="h-5 w-5" />
              </button>
            </div>
            
            {waypoints.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No waypoints yet</p>
                <p className="text-sm mt-1">Click on the map to add waypoints</p>
              </div>
            ) : (
              <div className="space-y-2">
                {waypoints.map((waypoint, index) => (
                  <div
                    key={waypoint.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedWaypoint === waypoint.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedWaypoint(waypoint.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">WP {index + 1}</span>
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveWaypoint(waypoint.id, 'up');
                          }}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          ↑
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveWaypoint(waypoint.id, 'down');
                          }}
                          disabled={index === waypoints.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          ↓
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteWaypoint(waypoint.id);
                          }}
                          className="p-1 text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>Lat: {waypoint.lat.toFixed(6)}</div>
                      <div>Lon: {waypoint.lon.toFixed(6)}</div>
                      <div>Alt: {waypoint.alt}m</div>
                      <div>Cmd: {waypoint.command}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Waypoint Details */}
        {selectedWaypoint && (
          <div className="border-t border-gray-200 p-4">
            {(() => {
              const waypoint = waypoints.find(wp => wp.id === selectedWaypoint);
              if (!waypoint) return null;
              
              return (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Waypoint Details</h4>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Latitude</label>
                      <input
                        type="number"
                        step="0.000001"
                        value={waypoint.lat}
                        onChange={(e) => updateWaypoint(waypoint.id, { lat: parseFloat(e.target.value) })}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Longitude</label>
                      <input
                        type="number"
                        step="0.000001"
                        value={waypoint.lon}
                        onChange={(e) => updateWaypoint(waypoint.id, { lon: parseFloat(e.target.value) })}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Altitude (m)</label>
                    <input
                      type="number"
                      value={waypoint.alt}
                      onChange={(e) => updateWaypoint(waypoint.id, { alt: parseFloat(e.target.value) })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Command</label>
                    <select
                      value={waypoint.command}
                      onChange={(e) => updateWaypoint(waypoint.id, { command: e.target.value })}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    >
                      {COMMAND_TYPES.map(cmd => (
                        <option key={cmd.value} value={cmd.value}>
                          {cmd.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Mission Actions */}
        <div className="border-t border-gray-200 p-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              disabled={waypoints.length === 0}
              className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Play className="h-4 w-4 mr-1" />
              Start Mission
            </button>
            
            <button className="flex items-center justify-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
              <Upload className="h-4 w-4 mr-1" />
              Upload
            </button>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1">
        <DroneMap
          telemetry={telemetry}
          waypoints={waypoints}
          onMapClick={addWaypoint}
        />
      </div>
    </div>
  );
};