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
  Unlock,
  X
} from 'lucide-react';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface PublicSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function PublicSidebar({
  activeTab,
  onTabChange,
  mobileOpen,
  onMobileClose,
}: PublicSidebarProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';

  const emergencyItems = [
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, isPublic: true },
    { id: 'emergency-checklist', label: 'Emergency Checklist', icon: AlertTriangle, isPublic: true },
    { id: 'evacuation', label: 'Evacuation Plans', icon: Route, isPublic: true },
  ];

  const mainMenuItems = [
    { id: 'map', label: 'Map', icon: Map, isPublic: true },
    { id: 'security', label: 'Defense and Security', icon: Shield, isPublic: false },
    { id: 'shelter', label: 'Shelter and Housing', icon: Home, isPublic: false },
    { id: 'food-water', label: 'Food and Water Supply', icon: Utensils, isPublic: false },
    { id: 'medical', label: 'Medical Assistance', icon: Cross, isPublic: false },
    { id: 'medicines', label: 'Medicines Supply', icon: Syringe, isPublic: false },
    { id: 'sanitation', label: 'Sanitation and Cleanliness', icon: Sparkles, isPublic: false },
    { id: 'transportation', label: 'Transportation', icon: Train, isPublic: false },
    { id: 'distribution', label: 'Distribution', icon: Truck, isPublic: false },
    { id: 'communication', label: 'Communication and IT', icon: Monitor, isPublic: false },
    { id: 'animal-rescue', label: 'Animal Rescue and Care', icon: Heart, isPublic: false },
    { id: 'rebuilding', label: 'Rebuilding and Infrastructure', icon: Building, isPublic: false },
    { id: 'childcare', label: 'Childcare and Education', icon: BookOpen, isPublic: false },
    { id: 'mental-health', label: 'Mental and Emotional Support', icon: Users, isPublic: false },
    { id: 'legal', label: 'Legal and Administrative', icon: Gavel, isPublic: false },
  ];

  const communitySpaces = [
    { id: 'join-us', label: 'Join Us Today!', icon: MessageSquare, isPublic: true },
    { id: 'resources', label: 'Resources', icon: Package, isPublic: false, requiresAdmin: true },
  ];

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = () => {
      if (mq.matches) onMobileClose();
    };
    mq.addEventListener('change', closeOnDesktop);
    return () => mq.removeEventListener('change', closeOnDesktop);
  }, [onMobileClose]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onMobileClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen, onMobileClose]);

  const selectTab = (tab: string) => {
    onTabChange(tab);
    onMobileClose();
  };

  const navButton = (
    id: string,
    label: string,
    Icon: typeof Map,
    isPublic: boolean,
    isActive: boolean
  ) => (
    <button
      key={id}
      type="button"
      onClick={() => selectTab(id)}
      className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? 'bg-blue-100 text-blue-700 border border-blue-200'
          : 'text-gray-700 hover:bg-gray-200'
      }`}
    >
      <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
      <div className="flex-1 flex items-center justify-between min-w-0">
        <span className="truncate">{label}</span>
        {isPublic ? (
          <Unlock className="h-3 w-3 text-green-500 ml-2 flex-shrink-0" />
        ) : (
          <Lock className="h-3 w-3 text-red-500 ml-2 flex-shrink-0" />
        )}
      </div>
    </button>
  );

  return (
    <>
      <div
        className={`fixed inset-x-0 bottom-0 top-[calc(3.5rem+env(safe-area-inset-top))] sm:top-[calc(4rem+env(safe-area-inset-top))] z-[1090] bg-black/40 lg:hidden transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onMobileClose}
        aria-hidden={!mobileOpen}
      />
      <aside
        className={`fixed left-0 bottom-0 top-[calc(3.5rem+env(safe-area-inset-top))] sm:top-[calc(4rem+env(safe-area-inset-top))] z-[1100] max-w-[85vw] bg-gray-100 text-gray-900 flex flex-col
          transform transition-transform duration-300 ease-out
          ${mobileOpen ? 'translate-x-0 w-72 border-r border-gray-200' : '-translate-x-full w-0 overflow-hidden border-0 pointer-events-none'}
          lg:static lg:inset-auto lg:top-auto lg:bottom-auto lg:z-auto lg:translate-x-0 lg:w-72 lg:max-w-none lg:flex-shrink-0 lg:overflow-visible lg:border-r lg:border-gray-200 lg:pointer-events-auto`}
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 lg:hidden">
          <span className="font-semibold text-gray-900">Menu</span>
          <button
            type="button"
            onClick={onMobileClose}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-800"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-500 mb-3">Community</div>
            {communitySpaces.map((space) => {
              if (space.id === 'resources' && !isAdmin) return null;
              const tab = space.id === 'join-us' ? 'community' : space.id;
              return navButton(tab, space.label, space.icon, space.isPublic, activeTab === tab);
            })}
          </div>

          <div className="py-3">
            <div className="border-t border-gray-200" />
          </div>

          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-500 mb-3">Information</div>
            {emergencyItems.map((item) =>
              navButton(item.id, item.label, item.icon, item.isPublic, activeTab === item.id)
            )}
          </div>

          <div className="py-3">
            <div className="border-t border-gray-200" />
          </div>

          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-500 mb-3">Menu</div>
            {mainMenuItems.map((item) =>
              navButton(item.id, item.label, item.icon, item.isPublic, activeTab === item.id)
            )}
          </div>
        </nav>
      </aside>
    </>
  );
}
