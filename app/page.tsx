'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import Header from './components/Header';
import PublicSidebar from './components/PublicSidebar';
import EvacuationPlansPage from './components/EvacuationPlansPage';
import CommunityPage from './components/CommunityPage';
import ResourcesPage from './components/ResourcesPage';
import AlertsPage from './components/AlertsPage';
import EmergencyChecklistPage from './emergency-checklist/page';
import { Location } from './types';
import { MAP_FOCUS_EVENT, hasStoredMapFocus } from './lib/map-focus';

// Dynamically import MapComponent to prevent SSR issues
const MapComponent = dynamic(() => import('./components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="gl-map-root bg-gray-200 flex items-center justify-center">
      <div className="text-gray-500 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <div>Map is loading...</div>
      </div>
    </div>
  )
});

export default function Home() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('map');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);

  // Load locations from API
  const loadLocations = async () => {
    try {
      setIsLoadingLocations(true);
      const response = await fetch('/api/locations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (response.ok) {
        const locationsData = await response.json();
        setLocations(Array.isArray(locationsData) ? locationsData : []);
      } else {
        console.error('Failed to load locations:', response.status);
        setLocations([]);
      }
    } catch (error) {
      console.error('Failed to load locations:', error);
      setLocations([]);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  // Load locations when component mounts or session changes
  useEffect(() => {
    loadLocations();
  }, [session]);

  useEffect(() => {
    const showMap = () => setActiveTab('map');
    if (hasStoredMapFocus()) showMap();
    window.addEventListener(MAP_FOCUS_EVENT, showMap);
    return () => window.removeEventListener(MAP_FOCUS_EVENT, showMap);
  }, []);

  // Filter locations based on authentication status
  const filteredLocations = locations; // No need to filter here since API handles it

  // Admin users can access both public and admin areas

  const renderContent = () => {
    switch (activeTab) {
      case 'map':
        if (isLoadingLocations) {
          return (
            <div className="gl-map-root bg-gray-200 flex items-center justify-center">
              <div className="text-gray-500 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <div>Loading locations...</div>
              </div>
            </div>
          );
        }
        return (
          <div className="gl-map-root">
            <MapComponent 
              locations={filteredLocations}
              selectedLocation={selectedLocation}
              onLocationSelect={setSelectedLocation}
            />
          </div>
        );
      
      case 'emergency-checklist':
        return <EmergencyChecklistPage />;
      
      case 'evacuation':
        return <EvacuationPlansPage />;
      
      case 'community':
        return <CommunityPage />;
      
      case 'resources':
        return <ResourcesPage />;
      
      case 'alerts':
        return <AlertsPage />;
      
      default:
        return (
          <div className="gl-map-root">
            <MapComponent 
              locations={filteredLocations}
              selectedLocation={selectedLocation}
              onLocationSelect={setSelectedLocation}
            />
          </div>
        );
    }
  };

  return (
    <div className="h-dvh max-h-dvh max-w-full bg-gray-50 w-full flex flex-col overflow-hidden overscroll-none">
      <Header
        menuOpen={sidebarOpen}
        onMenuToggle={() => setSidebarOpen((open) => !open)}
      />
      <div className="flex flex-1 min-h-0 w-full relative">
        <PublicSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          mobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
        />
        <main
          className={`flex-1 w-full min-w-0 min-h-0 flex flex-col ${
            activeTab === 'map' ? 'overflow-hidden' : 'overflow-y-auto'
          }`}
        >
          {renderContent()}
        </main>
      </div>
      {activeTab !== 'map' ? (
        <footer className="w-full bg-gray-800 text-white py-2.5 flex-shrink-0">
          <div className="text-center px-3">
            <p className="text-xs sm:text-sm font-bold">Ghost Legion © 2026</p>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
