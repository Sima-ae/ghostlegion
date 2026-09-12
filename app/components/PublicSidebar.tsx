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
import { useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useI18n } from '../lib/i18n/I18nProvider';

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
  const { t } = useI18n();
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';

  const emergencyItems = useMemo(
    () => [
      { id: 'alerts', label: t('nav.alerts'), icon: AlertTriangle, isPublic: true },
      { id: 'emergency-checklist', label: t('nav.checklist'), icon: AlertTriangle, isPublic: true },
      { id: 'evacuation', label: t('nav.evacuation'), icon: Route, isPublic: true },
    ],
    [t]
  );

  const mainMenuItems = useMemo(
    () => [
      { id: 'map', label: t('nav.map'), icon: Map, isPublic: true },
      { id: 'security', label: t('nav.security'), icon: Shield, isPublic: false },
      { id: 'shelter', label: t('nav.shelter'), icon: Home, isPublic: false },
      { id: 'food-water', label: t('nav.foodWater'), icon: Utensils, isPublic: false },
      { id: 'medical', label: t('nav.medical'), icon: Cross, isPublic: false },
      { id: 'medicines', label: t('nav.medicines'), icon: Syringe, isPublic: false },
      { id: 'sanitation', label: t('nav.sanitation'), icon: Sparkles, isPublic: false },
      { id: 'transportation', label: t('nav.transportation'), icon: Train, isPublic: false },
      { id: 'distribution', label: t('nav.distribution'), icon: Truck, isPublic: false },
      { id: 'communication', label: t('nav.communication'), icon: Monitor, isPublic: false },
      { id: 'animal-rescue', label: t('nav.animalRescue'), icon: Heart, isPublic: false },
      { id: 'rebuilding', label: t('nav.rebuilding'), icon: Building, isPublic: false },
      { id: 'childcare', label: t('nav.childcare'), icon: BookOpen, isPublic: false },
      { id: 'mental-health', label: t('nav.mentalHealth'), icon: Users, isPublic: false },
      { id: 'legal', label: t('nav.legal'), icon: Gavel, isPublic: false },
    ],
    [t]
  );

  const communitySpaces = useMemo(
    () => [
      { id: 'join-us', label: t('nav.joinUs'), icon: MessageSquare, isPublic: true },
      { id: 'resources', label: t('nav.resources'), icon: Package, isPublic: false, requiresAdmin: true },
    ],
    [t]
  );

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
        aria-label={t('nav.mainNav')}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 lg:hidden">
          <span className="font-semibold text-gray-900">{t('nav.menu')}</span>
          <button
            type="button"
            onClick={onMobileClose}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-800"
            aria-label={t('nav.closeMenu')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-500 mb-3">{t('nav.community')}</div>
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
            <div className="text-sm font-medium text-gray-500 mb-3">{t('nav.information')}</div>
            {emergencyItems.map((item) =>
              navButton(item.id, item.label, item.icon, item.isPublic, activeTab === item.id)
            )}
          </div>

          <div className="py-3">
            <div className="border-t border-gray-200" />
          </div>

          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-500 mb-3">{t('nav.menu')}</div>
            {mainMenuItems.map((item) =>
              navButton(item.id, item.label, item.icon, item.isPublic, activeTab === item.id)
            )}
          </div>
        </nav>
      </aside>
    </>
  );
}
