'use client';

import { 
  Map, 
  Route, 
  MessageSquare, 
  AlertTriangle,
  Heart,
  Shield,
  BookOpen,
  Monitor,
  Truck,
  Utensils,
  Gavel,
  Cross,
  Syringe,
  Users,
  Building,
  Package,
  Sparkles,
  Home,
  Train,
  Lock,
  Unlock
} from 'lucide-react';
import { useState } from 'react';

interface PublicSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function PublicSidebar({ activeTab, onTabChange }: PublicSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const mainMenuItems = [
    { id: 'map', label: 'Map', icon: Map, isPublic: true },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, isPublic: true },
    { id: 'community', label: 'Community', icon: MessageSquare, isPublic: true },
    { id: 'emergency-checklist', label: 'Emergency Checklist', icon: AlertTriangle, isPublic: true },
    { id: 'evacuation', label: 'Evacuation Plans', icon: Route, isPublic: true },
    
    { id: 'resources', label: 'Resources', icon: Package, isPublic: true },
    
  ];

  const communitySpaces = [
    { id: 'join', label: '- Join Us Today -', icon: MessageSquare, isPublic: true },

    { id: 'security', label: 'Security and Defense', icon: Shield, isPublic: false },
    { id: 'shelter', label: 'Shelter and Housing', icon: Home, isPublic: false },
    { id: 'food-water', label: 'Food and Water Supply', icon: Utensils, isPublic: false },
    { id: 'medical', label: 'Medical Assistance', icon: Cross, isPublic: false },
    { id: 'medicines', label: 'Medicines Supply', icon: Syringe, isPublic: false },
    { id: 'sanitation', label: 'Sanitation and Cleanliness', icon: Sparkles, isPublic: false },
    { id: 'transportation', label: 'Transportation', icon: Train, isPublic: false },
    { id: 'distribution', label: 'Distribution', icon: Truck, isPublic: false },
    { id: 'communication', label: 'Communication and IT', icon: Monitor, isPublic: false },
    { id: 'animal-rescue', label: 'Animal Rescue and Care', icon: Heart, isPublic: false },
    
    { id: 'rebuilding', label: 'Rebuilding and Infrastruct...', icon: Building, isPublic: false },
    { id: 'childcare', label: 'Childcare and Education', icon: BookOpen, isPublic: false },
    { id: 'legal', label: 'Legal and Administrative...', icon: Gavel, isPublic: false },
    { id: 'mental-health', label: 'Mental and Emotional Su...', icon: Users, isPublic: false },

  ];

  return (
    <div className={`bg-gray-100 text-gray-900 transition-all duration-300 ${
      isCollapsed ? 'w-16 lg:w-20' : 'w-full lg:w-80'
    } border-r border-gray-200 flex-shrink-0`}>
      <div className="flex flex-col h-full">
        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2">
          <div className="space-y-1">
            <div className="flex items-center text-sm font-medium text-gray-500 mb-3">
              {!isCollapsed && <span>Menu</span>}
            </div>
            {mainMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </div>

          {/* Locations */}
          <div className="mt-6">
            <div className="flex items-center text-sm font-medium text-gray-500 mb-3">
              {!isCollapsed && <span>Locations and Services</span>}
            </div>
            <div className="space-y-1">
              {communitySpaces.map((space) => {
                const Icon = space.icon;
                return (
                  <button
                    key={space.id}
                    onClick={() => onTabChange(space.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === space.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                    {!isCollapsed && (
                      <div className="flex-1 flex items-center justify-between">
                        <span className="truncate">{space.label}</span>
                        {!space.isPublic && (
                          <Lock className="h-3 w-3 text-gray-400 ml-2" />
                        )}
                        {space.isPublic && space.id === 'join' && (
                          <Unlock className="h-3 w-3 text-green-500 ml-2" />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              setIsCollapsed(!isCollapsed);
              // Trigger resize event to update map
              setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
              }, 300); // Wait for transition to complete
            }}
            className="w-full flex items-center justify-center p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
          >
            <div className={`w-6 h-6 transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
            {!isCollapsed && <span className="ml-2 text-sm">Collapse</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
