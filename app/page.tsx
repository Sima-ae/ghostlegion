'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Header from './components/Header';
import PublicSidebar from './components/PublicSidebar';
import LocationCard from './components/LocationCard';
import EvacuationPlansPage from './components/EvacuationPlansPage';
import CommunityPage from './components/CommunityPage';
import ResourcesPage from './components/ResourcesPage';
import AlertsPage from './components/AlertsPage';
import EmergencyChecklistPage from './emergency-checklist/page';
import { Location } from './types';

// Dynamically import MapComponent to prevent SSR issues
const MapComponent = dynamic(() => import('./components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] bg-gray-200 rounded-lg flex items-center justify-center">
      <div className="text-gray-500 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <div>Map is loading...</div>
      </div>
    </div>
  )
});

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('map');
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

  // Filter locations based on authentication status
  const filteredLocations = locations; // No need to filter here since API handles it

  // Admin users can access both public and admin areas

  const renderContent = () => {
    switch (activeTab) {
      case 'map':
        if (isLoadingLocations) {
          return (
            <div className="h-full min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-gray-500 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <div>Loading locations...</div>
              </div>
            </div>
          );
        }
        return (
          <div className="h-full">
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
          <div className="h-full">
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
    <div className="min-h-screen bg-gray-50 w-full flex flex-col">
      <Header />
      <div className="flex flex-col lg:flex-row flex-1 w-full">
        <PublicSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 w-full overflow-y-auto min-w-0">
          {renderContent()}
        </main>
      </div>
      <footer className="w-full bg-gray-800 text-white py-4">
        <div className="text-center">
          <p className="text-sm font-bold">Ghost Legion © 2026</p>
        </div>
      </footer>
    </div>
  );
}
