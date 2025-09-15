// src/pages/SetupPage.tsx
import React, { useState } from 'react';
import { Settings, Target, Wifi, Database } from 'lucide-react';
import { useDroneData } from '../hooks/useDroneData';

export const SetupPage: React.FC = () => {
  const { telemetry, sendCommand } = useDroneData();
  const [activeSection, setActiveSection] = useState('connection');

  const sections = [
    { id: 'connection', label: 'Connection', icon: Wifi },
    { id: 'calibration', label: 'Calibration', icon: Target },
    { id: 'parameters', label: 'Parameters', icon: Settings },
    { id: 'logs', label: 'Logs', icon: Database },
  ];

  const handleCalibration = async (type: string) => {
    const success = await sendCommand('calibrate', { type });
    if (success) {
      alert(`${type} calibration started`);
    }
  };

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 border-r border-gray-200">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Setup & Configuration</h2>
          <nav className="space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeSection === 'connection' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Connection Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">Vehicle Connection</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Connection Type</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option>Serial</option>
                      <option>TCP</option>
                      <option>UDP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Port/Address</label>
                    <input
                      type="text"
                      placeholder="/dev/ttyUSB0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Baud Rate</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option>57600</option>
                      <option>115200</option>
                      <option>921600</option>
                    </select>
                  </div>
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Connect
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">Connection Status</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Status:</span>
                    <span className={`font-medium ${telemetry.state?.armed ? 'text-green-600' : 'text-red-600'}`}>
                      {telemetry.state?.armed ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Vehicle Type:</span>
                    <span className="font-medium">Copter</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Firmware:</span>
                    <span className="font-medium">ArduCopter 4.3.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Flight Mode:</span>
                    <span className="font-medium">{telemetry.state?.mode || 'UNKNOWN'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'calibration' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Sensor Calibration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">Accelerometer</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Calibrate the accelerometer for accurate attitude estimation.
                </p>
                <button
                  onClick={() => handleCalibration('accelerometer')}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Calibrate Accelerometer
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">Compass</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Calibrate the compass for accurate heading information.
                </p>
                <button
                  onClick={() => handleCalibration('compass')}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Calibrate Compass
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">Radio</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Calibrate the radio control inputs and failsafe settings.
                </p>
                <button
                  onClick={() => handleCalibration('radio')}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Calibrate Radio
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">ESC</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Calibrate the Electronic Speed Controllers.
                </p>
                <button
                  onClick={() => handleCalibration('esc')}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Calibrate ESC
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">Gimbal</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Calibrate the camera gimbal settings.
                </p>
                <button
                  onClick={() => handleCalibration('gimbal')}
                  className="w-full px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                >
                  Calibrate Gimbal
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">Pressure</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Calibrate the barometric pressure sensor.
                </p>
                <button
                  onClick={() => handleCalibration('pressure')}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Calibrate Pressure
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'parameters' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Vehicle Parameters</h3>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Parameter List</h4>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                    Refresh
                  </button>
                  <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                    Save to File
                  </button>
                  <button className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700">
                    Load from File
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search parameters..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="border border-gray-200 rounded-md">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-medium text-gray-900">
                  Common Parameters
                </div>
                <div className="divide-y divide-gray-200">
                  {[
                    { name: 'ANGLE_MAX', value: '4500', description: 'Maximum lean angle in centidegrees' },
                    { name: 'RTL_ALT', value: '1500', description: 'RTL altitude in centimeters' },
                    { name: 'LAND_SPEED', value: '50', description: 'Landing speed in cm/s' },
                    { name: 'WPNAV_SPEED', value: '500', description: 'Waypoint navigation speed in cm/s' },
                  ].map((param, index) => (
                    <div key={index} className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{param.name}</div>
                          <div className="text-sm text-gray-600">{param.description}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={param.value}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <button className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
                            Set
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'logs' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Flight Logs</h3>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Available Logs</h4>
                <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                  Refresh
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-md">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 grid grid-cols-4 gap-4 font-medium text-gray-900">
                  <div>Date</div>
                  <div>Duration</div>
                  <div>Size</div>
                  <div>Actions</div>
                </div>
                <div className="divide-y divide-gray-200">
                  {[
                    { date: '2025-09-14 10:30:15', duration: '15:42', size: '2.3 MB' },
                    { date: '2025-09-14 09:15:22', duration: '08:15', size: '1.8 MB' },
                    { date: '2025-09-13 16:45:30', duration: '22:18', size: '4.1 MB' },
                  ].map((log, index) => (
                    <div key={index} className="px-4 py-3 grid grid-cols-4 gap-4 items-center">
                      <div className="text-sm text-gray-900">{log.date}</div>
                      <div className="text-sm text-gray-600">{log.duration}</div>
                      <div className="text-sm text-gray-600">{log.size}</div>
                      <div className="flex space-x-2">
                        <button className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">
                          Download
                        </button>
                        <button className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
                          View
                        </button>
                        <button className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};