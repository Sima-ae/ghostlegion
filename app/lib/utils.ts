import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('nl-NL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatTimeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'zojuist';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minuten geleden`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} uur geleden`;
  return `${Math.floor(diffInSeconds / 86400)} dagen geleden`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
    case 'online':
    case 'open':
    case 'available':
      return 'text-green-600 bg-green-100';
    case 'inactive':
    case 'offline':
    case 'closed':
    case 'out_of_stock':
      return 'text-red-600 bg-red-100';
    case 'deployed':
    case 'busy':
    case 'congested':
    case 'low_stock':
      return 'text-yellow-600 bg-yellow-100';
    case 'injured':
    case 'missing':
    case 'damaged':
    case 'dangerous':
      return 'text-red-600 bg-red-100';
    case 'away':
    case 'under_construction':
      return 'text-blue-600 bg-blue-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity?.toUpperCase()) {
    case 'LOW':
      return 'text-blue-600 bg-blue-100';
    case 'MEDIUM':
      return 'text-yellow-600 bg-yellow-100';
    case 'HIGH':
      return 'text-orange-600 bg-orange-100';
    case 'CRITICAL':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function getRoleIcon(role: string): string {
  const roleIcons: Record<string, string> = {
    soldier: '🪖',
    commander: '⭐',
    intelligence_analyst: '🔍',
    eod_specialist: '💣',
    sniper: '🎯',
    pilot: '✈️',
    doctor: '👨‍⚕️',
    nurse: '👩‍⚕️',
    police_officer: '👮',
    teacher: '👨‍🏫',
    volunteer: '🤝',
    journalist: '📰',
    farmer: '🚜',
    developer: '💻'
  };
  return roleIcons[role] || '👤';
}

export function getLocationTypeIcon(type: string): string {
  const typeIcons: Record<string, string> = {
    bunker: '🏗️',
    fortress: '🏰',
    hiding_place: '🕳️',
    evacuation_center: '🏥',
    medical_facility: '🏥',
    command_center: '🎯',
    supply_depot: '📦'
  };
  return typeIcons[type] || '📍';
}
