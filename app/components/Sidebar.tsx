'use client';

import { 
  Map, 
  Users, 
  Route, 
  Package, 
  AlertTriangle, 
  Shield, 
  Heart, 
  Truck, 
  MessageSquare, 
  Gavel, 
  Home,
  Settings,
  BarChart3
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'map', label: 'Locaties & Kaart', icon: Map },
    { id: 'personnel', label: 'Personeel', icon: Users },
    { id: 'evacuation', label: 'Evacuatieplannen', icon: Route },
    { id: 'resources', label: 'Voorraden', icon: Package },
    { id: 'alerts', label: 'Waarschuwingen', icon: AlertTriangle },
    { id: 'community', label: 'Gemeenschap', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const departmentSections = [
    {
      title: 'Militair & Defensie',
      icon: Shield,
      items: [
        'Soldaten & Commandanten',
        'Inlichtingen',
        'EOD Specialisten',
        'Luchtmacht',
        'Marine',
        'Militaire Medici',
        'Logistiek',
        'Cybersecurity'
      ]
    },
    {
      title: 'Overheid & Crisisbeheer',
      icon: Settings,
      items: [
        'Crisis Managers',
        'Burgerbescherming',
        'Evacuatie Planners',
        'Diplomatiek Personeel',
        'Media & Communicatie',
        'Grenscontrole'
      ]
    },
    {
      title: 'Humanitair & Hulpverlening',
      icon: Heart,
      items: [
        'VN Personeel',
        'Rode Kruis',
        'NGO Medewerkers',
        'Vluchtelingen Coordinatie',
        'Trauma Counselors',
        'Sociale Werkers'
      ]
    },
    {
      title: 'Medisch & Gezondheidszorg',
      icon: Heart,
      items: [
        'Dokters & Chirurgen',
        'Paramedici',
        'Verpleegkundigen',
        'Apothekers',
        'Geestelijke Gezondheid',
        'Ziekenhuis Personeel'
      ]
    },
    {
      title: 'Logistiek & Transport',
      icon: Truck,
      items: [
        'Vrachtwagen Chauffeurs',
        'Piloten',
        'Scheepvaart',
        'Warehouse Managers',
        'Bouw & Infrastructuur',
        'Energie Technici'
      ]
    },
    {
      title: 'Communicatie & IT',
      icon: MessageSquare,
      items: [
        'Journalisten',
        'IT Specialisten',
        'Communicatie Operators',
        'Social Media Managers',
        'Bibliothecarissen'
      ]
    },
    {
      title: 'Wet & Orde',
      icon: Gavel,
      items: [
        'Politie',
        'Privé Beveiliging',
        'Grensbewaking',
        'Contra-inlichtingen',
        'Gevangenis Personeel'
      ]
    }
  ];

  return (
    <div className={`bg-gray-800 text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-80'}`}>
      <div className="flex flex-col h-full">
        {/* Toggle Button */}
        <div className="p-4 border-b border-gray-700">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            <div className={`w-6 h-6 transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Department Sections */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-700">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Personeel Categorieën
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {departmentSections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center text-xs font-medium text-gray-400">
                      <Icon className="h-4 w-4 mr-2" />
                      {section.title}
                    </div>
                    <div className="ml-6 space-y-1">
                      {section.items.map((item, itemIndex) => (
                        <button
                          key={itemIndex}
                          className="block w-full text-left text-xs text-gray-300 hover:text-white hover:bg-gray-700 px-2 py-1 rounded transition-colors"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
