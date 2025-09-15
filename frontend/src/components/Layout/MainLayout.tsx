// src/components/Layout/MainLayout.tsx
import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { FlightDataPage } from '../../pages/FlightDataPage';
import { useDroneData } from '../../hooks/useDroneData';

interface MainLayoutProps {
  children?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = () => {
  const { status, isConnected } = useDroneData();
  const [activeTab, setActiveTab] = useState('flight-data');

  const renderContent = () => {
    switch (activeTab) {
      case 'flight-data':
        return <FlightDataPage />;
      case 'map-view':
        return <FlightDataPage mapFocus={true} />;
      case 'instruments':
        return <FlightDataPage instrumentsFocus={true} />;
      case 'data-logs':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Data Logs</h1>
            <div className="bg-white rounded-lg p-6 shadow">
              <p className="text-gray-600">Historical telemetry data and flight logs will be displayed here.</p>
            </div>
          </div>
        );
      case 'system-health':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">System Health</h1>
            <div className="bg-white rounded-lg p-6 shadow">
              <p className="text-gray-600">System diagnostics and health monitoring will be displayed here.</p>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Flight Analytics</h1>
            <div className="bg-white rounded-lg p-6 shadow">
              <p className="text-gray-600">Flight performance analytics and trends will be displayed here.</p>
            </div>
          </div>
        );
      default:
        return <FlightDataPage />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header status={status} isConnected={isConnected} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};