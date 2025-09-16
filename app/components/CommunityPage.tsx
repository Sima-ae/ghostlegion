'use client';

import { useState } from 'react';
import { 
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
  Plus,
  Users2
} from 'lucide-react';

export default function CommunityPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showJoinForm, setShowJoinForm] = useState(false);

  const communityCategories = [
    {
      id: 'animal-rescue',
      name: 'Animal Rescue and Care',
      icon: Heart,
      description: 'Rescuing and caring for abandoned pets during crisis',
      tasks: [
        'Rescuing abandoned pets from affected areas',
        'Providing temporary shelter for animals',
        'Coordinating with veterinary services',
        'Organizing pet food and medical supply drives',
        'Setting up animal-friendly evacuation centers'
      ],
      requirements: 'Animal care experience, transportation, basic medical knowledge',
      contact: 'animal-rescue@ghostlegion.nl',
      members: 45,
      isPublic: false
    },
    {
      id: 'childcare',
      name: 'Childcare and Education',
      icon: BookOpen,
      description: 'Providing educational support and care for displaced children',
      tasks: [
        'Teaching displaced children in temporary schools',
        'Organizing educational activities and games',
        'Providing psychological support for traumatized children',
        'Coordinating with local schools for integration',
        'Managing learning materials and resources'
      ],
      requirements: 'Teaching experience, child psychology background, patience',
      contact: 'childcare@ghostlegion.nl',
      members: 78,
      isPublic: false
    },
    {
      id: 'communication',
      name: 'Communication and IT',
      icon: Monitor,
      description: 'Maintaining communication networks and IT infrastructure',
      tasks: [
        'Setting up emergency communication systems',
        'Maintaining internet and power infrastructure',
        'Operating radio networks for coordination',
        'Managing social media for information dissemination',
        'Providing technical support for emergency services'
      ],
      requirements: 'IT/Telecommunications background, technical skills',
      contact: 'communication@ghostlegion.nl',
      members: 32,
      isPublic: false
    },
    {
      id: 'distribution',
      name: 'Distribution',
      icon: Truck,
      description: 'Coordinating supply distribution and logistics',
      tasks: [
        'Organizing supply distribution networks',
        'Coordinating transportation of essential goods',
        'Managing inventory and storage facilities',
        'Setting up distribution points in affected areas',
        'Coordinating with suppliers and donors'
      ],
      requirements: 'Logistics experience, organizational skills, transportation',
      contact: 'distribution@ghostlegion.nl',
      members: 56,
      isPublic: false
    },
    {
      id: 'food-water',
      name: 'Food and Water Supply',
      icon: Utensils,
      description: 'Ensuring food and clean water availability',
      tasks: [
        'Setting up community kitchens and feeding centers',
        'Organizing food collection and donation drives',
        'Establishing clean water distribution points',
        'Coordinating with local restaurants and suppliers',
        'Managing food safety and hygiene standards'
      ],
      requirements: 'Food service experience, health and safety knowledge',
      contact: 'food-supply@ghostlegion.nl',
      members: 89,
      isPublic: false
    },
    {
      id: 'legal',
      name: 'Legal and Administrative',
      icon: Gavel,
      description: 'Providing legal assistance and administrative support',
      tasks: [
        'Assisting with refugee registration and documentation',
        'Providing legal advice and representation',
        'Helping with paperwork and official procedures',
        'Coordinating with government agencies',
        'Managing legal rights and entitlements'
      ],
      requirements: 'Legal background, administrative experience, language skills',
      contact: 'legal@ghostlegion.nl',
      members: 23,
      isPublic: false
    },
    {
      id: 'medical',
      name: 'Medical Assistance',
      icon: Cross,
      description: 'Providing medical care and health services',
      tasks: [
        'Providing first aid and emergency medical care',
        'Assisting in makeshift clinics and hospitals',
        'Organizing blood donation drives',
        'Managing medical supplies and equipment',
        'Coordinating with healthcare professionals'
      ],
      requirements: 'Medical training, first aid certification, healthcare experience',
      contact: 'medical@ghostlegion.nl',
      members: 124,
      isPublic: false
    },
    {
      id: 'medicines',
      name: 'Medicines Supply',
      icon: Syringe,
      description: 'Managing pharmaceutical supplies and medication distribution',
      tasks: [
        'Coordinating medicine collection and distribution',
        'Managing pharmaceutical inventory',
        'Ensuring proper storage and handling of medications',
        'Coordinating with pharmacies and medical facilities',
        'Providing medication counseling and support'
      ],
      requirements: 'Pharmaceutical knowledge, medical background',
      contact: 'medicines@ghostlegion.nl',
      members: 34,
      isPublic: false
    },
    {
      id: 'mental-health',
      name: 'Mental and Emotional Support',
      icon: Users,
      description: 'Providing psychological support and counseling',
      tasks: [
        'Offering trauma counseling and psychological support',
        'Setting up safe spaces for social interaction',
        'Providing religious and spiritual support',
        'Organizing support groups and therapy sessions',
        'Training volunteers in basic counseling techniques'
      ],
      requirements: 'Psychology background, counseling experience, empathy',
      contact: 'mental-health@ghostlegion.nl',
      members: 67,
      isPublic: false
    },
    {
      id: 'rebuilding',
      name: 'Rebuilding and Infrastructure',
      icon: Building,
      description: 'Repairing and rebuilding damaged infrastructure',
      tasks: [
        'Repairing roads and damaged buildings',
        'Restoring electricity and water supplies',
        'Providing heating solutions in cold weather',
        'Coordinating with construction companies',
        'Managing rebuilding projects and resources'
      ],
      requirements: 'Construction experience, engineering background, technical skills',
      contact: 'rebuilding@ghostlegion.nl',
      members: 91,
      isPublic: false
    },
    {
      id: 'resources',
      name: 'Resource Collection',
      icon: Package,
      description: 'Collecting and managing essential supplies',
      tasks: [
        'Collecting clothes, hygiene products, and essentials',
        'Packing and distributing emergency supply kits',
        'Coordinating with NGOs and charities',
        'Managing donation drives and collection points',
        'Organizing supply distribution networks'
      ],
      requirements: 'Organizational skills, logistics experience, community connections',
      contact: 'resources@ghostlegion.nl',
      members: 112,
      isPublic: false
    },
    {
      id: 'sanitation',
      name: 'Sanitation and Cleanliness',
      icon: Sparkles,
      description: 'Maintaining hygiene and sanitation standards',
      tasks: [
        'Cleaning shelters and public spaces',
        'Setting up waste disposal systems',
        'Disinfecting public spaces to prevent disease',
        'Managing hygiene supplies and equipment',
        'Training volunteers in sanitation procedures'
      ],
      requirements: 'Health and safety knowledge, cleaning experience',
      contact: 'sanitation@ghostlegion.nl',
      members: 58,
      isPublic: false
    },
    {
      id: 'security',
      name: 'Security and Defense',
      icon: Shield,
      description: 'Maintaining security and safety in communities',
      tasks: [
        'Organizing neighborhood patrols',
        'Reporting suspicious activities to authorities',
        'Assisting with crowd control in shelters',
        'Coordinating with law enforcement',
        'Providing security for vulnerable areas'
      ],
      requirements: 'Security background, law enforcement experience, physical fitness',
      contact: 'security@ghostlegion.nl',
      members: 76,
      isPublic: false
    },
    {
      id: 'shelter',
      name: 'Shelter and Housing',
      icon: Home,
      description: 'Providing temporary housing and shelter',
      tasks: [
        'Hosting displaced families in private homes',
        'Setting up temporary shelters and camps',
        'Providing blankets, mattresses, and tents',
        'Coordinating with hotels and accommodation providers',
        'Managing shelter capacity and resources'
      ],
      requirements: 'Hospitality experience, property management, community connections',
      contact: 'shelter@ghostlegion.nl',
      members: 143,
      isPublic: false
    },
    {
      id: 'transportation',
      name: 'Transportation',
      icon: Train,
      description: 'Coordinating transportation and logistics',
      tasks: [
        'Driving evacuees to safe areas',
        'Repairing and maintaining vehicles',
        'Organizing public transportation for evacuation',
        'Coordinating with transport companies',
        'Managing fuel and vehicle resources'
      ],
      requirements: 'Driving license, mechanical knowledge, transportation experience',
      contact: 'transportation@ghostlegion.nl',
      members: 98,
      isPublic: false
    }
  ];

  const filteredCategories = selectedCategory === 'all' 
    ? communityCategories 
    : communityCategories.filter(cat => cat.id === selectedCategory);

  return (
    <div className="bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Spaces</h1>
          <p className="text-gray-600">
            Join specialized community groups to help with specific tasks during crisis situations.
          </p>
        </div>

        {/* Join Us Today Banner */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Join Us Today</h2>
              <p className="text-blue-100 mb-4">
                Become part of our community and help make a difference during crisis situations.
              </p>
              <button
                onClick={() => setShowJoinForm(true)}
                className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Join Community
              </button>
            </div>
            <Users2 className="h-24 w-24 text-blue-200" />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              All Categories
            </button>
            {communityCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Community Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        {category.isPublic ? (
                          <Unlock className="h-4 w-4 text-green-500" />
                        ) : (
                          <Lock className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="text-sm text-gray-500">
                          {category.members} members
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">{category.description}</p>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 text-sm">Key Tasks:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {category.tasks.slice(0, 3).map((task, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{task}</span>
                      </li>
                    ))}
                    {category.tasks.length > 3 && (
                      <li className="text-blue-600 text-sm">
                        +{category.tasks.length - 3} more tasks
                      </li>
                    )}
                  </ul>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500 mb-2">
                    <strong>Requirements:</strong> {category.requirements}
                  </div>
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                      Join Group
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Join Form Modal */}
        {showJoinForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Join Community</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Category
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Choose a category</option>
                    {communityCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience/Background
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Describe your relevant experience..."
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowJoinForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
