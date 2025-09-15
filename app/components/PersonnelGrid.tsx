'use client';

import { Personnel, PersonnelDepartment } from '../types';
import { getRoleIcon, getStatusColor, formatTimeAgo } from '../lib/utils';
import { Search, Filter, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface PersonnelGridProps {
  personnel: Personnel[];
  onPersonnelSelect?: (personnel: Personnel) => void;
}

export default function PersonnelGrid({ personnel, onPersonnelSelect }: PersonnelGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<PersonnelDepartment | 'all'>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');

  const departments: PersonnelDepartment[] = ['military', 'government', 'humanitarian', 'medical', 'logistics', 'communication', 'law_enforcement', 'civilian', 'volunteer'];
  
  const roles = Array.from(new Set(personnel.map(p => p.role)));

  const filteredPersonnel = personnel.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDepartment = selectedDepartment === 'all' || person.department === selectedDepartment;
    const matchesRole = selectedRole === 'all' || person.role === selectedRole;
    
    return matchesSearch && matchesDepartment && matchesRole;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Zoek personeel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Department Filter */}
          <div className="lg:w-48">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value as PersonnelDepartment | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Alle Afdelingen</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept.charAt(0).toUpperCase() + dept.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div className="lg:w-48">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Alle Rollen</option>
              {roles.map(role => (
                <option key={role} value={role}>
                  {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* Add Button */}
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Toevoegen
          </button>
        </div>
      </div>

      {/* Personnel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPersonnel.map((person) => (
          <div
            key={person.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onPersonnelSelect?.(person)}
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{getRoleIcon(person.role)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{person.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">
                      {person.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(person.status)}`}>
                  {person.status}
                </span>
              </div>

              {/* Department */}
              <div className="mb-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {person.department}
                </span>
              </div>

              {/* Location */}
              {person.location && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Locatie:</span> {person.location}
                  </p>
                </div>
              )}

              {/* Skills */}
              <div className="mb-3">
                <h4 className="text-xs font-medium text-gray-500 mb-2">Vaardigheden</h4>
                <div className="flex flex-wrap gap-1">
                  {person.skills.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                  {person.skills.length > 3 && (
                    <span className="text-xs text-gray-500 px-2 py-1">
                      +{person.skills.length - 3} meer
                    </span>
                  )}
                </div>
              </div>

              {/* Contact & Last Seen */}
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex items-center justify-between">
                  <span>Contact: {person.contact}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Laatst gezien: {formatTimeAgo(person.lastSeen)}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    person.clearanceLevel === 'top_secret' ? 'bg-red-100 text-red-800' :
                    person.clearanceLevel === 'secret' ? 'bg-orange-100 text-orange-800' :
                    person.clearanceLevel === 'confidential' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {person.clearanceLevel.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 mt-3 pt-3 border-t border-gray-100">
                <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                  <Eye className="h-4 w-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500 text-center">
        {filteredPersonnel.length} van {personnel.length} personeelsleden gevonden
      </div>
    </div>
  );
}
