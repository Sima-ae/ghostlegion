'use client';

import { useState } from 'react';
import { MapPin, Clock, Users, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

export default function EvacuationPlansPage() {
  const [selectedRegion, setSelectedRegion] = useState('north');

  const evacuationRoutes = {
    north: {
      name: 'Northern Netherlands',
      routes: [
        {
          id: 'route-1',
          name: 'Groningen to Germany',
          distance: '45 km',
          duration: '2-3 hours',
          capacity: '15,000 people',
          status: 'active',
          checkpoints: [
            { name: 'Groningen Central Station', type: 'assembly', capacity: '5,000' },
            { name: 'Winschoten Border Crossing', type: 'border', capacity: '2,000' },
            { name: 'Bad Nieuweschans Refugee Center', type: 'shelter', capacity: '8,000' }
          ]
        },
        {
          id: 'route-2',
          name: 'Friesland to Denmark',
          distance: '120 km',
          duration: '4-5 hours',
          capacity: '8,000 people',
          status: 'standby',
          checkpoints: [
            { name: 'Leeuwarden Assembly Point', type: 'assembly', capacity: '3,000' },
            { name: 'Harlingen Port', type: 'port', capacity: '2,000' },
            { name: 'Esbjerg Reception Center', type: 'shelter', capacity: '5,000' }
          ]
        }
      ]
    },
    central: {
      name: 'Central Netherlands',
      routes: [
        {
          id: 'route-3',
          name: 'Amsterdam to Belgium',
          distance: '180 km',
          duration: '3-4 hours',
          capacity: '25,000 people',
          status: 'active',
          checkpoints: [
            { name: 'Amsterdam Arena', type: 'assembly', capacity: '10,000' },
            { name: 'Rotterdam Central', type: 'transit', capacity: '8,000' },
            { name: 'Antwerp Reception Center', type: 'shelter', capacity: '15,000' }
          ]
        }
      ]
    },
    south: {
      name: 'Southern Netherlands',
      routes: [
        {
          id: 'route-4',
          name: 'Eindhoven to France',
          distance: '220 km',
          duration: '4-5 hours',
          capacity: '12,000 people',
          status: 'active',
          checkpoints: [
            { name: 'Eindhoven Airport', type: 'assembly', capacity: '5,000' },
            { name: 'Tilburg Transit Center', type: 'transit', capacity: '3,000' },
            { name: 'Lille Reception Center', type: 'shelter', capacity: '8,000' }
          ]
        }
      ]
    }
  };

  const emergencyContacts = [
    { name: 'Emergency Services', number: '112', type: 'emergency' },
    { name: 'Evacuation Hotline', number: '0800-1234', type: 'info' },
    { name: 'Red Cross', number: '0800-5678', type: 'support' },
    { name: 'Military Command', number: '0800-9999', type: 'military' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'standby': return 'text-yellow-600 bg-yellow-100';
      case 'closed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCheckpointIcon = (type: string) => {
    switch (type) {
      case 'assembly': return <Users className="h-4 w-4" />;
      case 'border': return <MapPin className="h-4 w-4" />;
      case 'shelter': return <CheckCircle className="h-4 w-4" />;
      case 'port': return <ArrowRight className="h-4 w-4" />;
      case 'transit': return <Clock className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <div className="h-full bg-gray-50 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Evacuation Plans</h1>
          <p className="text-gray-600">
            Comprehensive evacuation routes and procedures for the Netherlands during crisis situations.
          </p>
        </div>

        {/* Region Selector */}
        <div className="mb-8">
          <div className="flex space-x-4">
            {Object.keys(evacuationRoutes).map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  selectedRegion === region
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {evacuationRoutes[region as keyof typeof evacuationRoutes].name}
              </button>
            ))}
          </div>
        </div>

        {/* Evacuation Routes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {evacuationRoutes[selectedRegion as keyof typeof evacuationRoutes].routes.map((route) => (
            <div key={route.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{route.name}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(route.status)}`}>
                  {route.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{route.distance}</div>
                  <div className="text-sm text-gray-500">Distance</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{route.duration}</div>
                  <div className="text-sm text-gray-500">Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{route.capacity}</div>
                  <div className="text-sm text-gray-500">Capacity</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Checkpoints</h4>
                {route.checkpoints.map((checkpoint, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    {getCheckpointIcon(checkpoint.type)}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{checkpoint.name}</div>
                      <div className="text-sm text-gray-500 capitalize">
                        {checkpoint.type} • Capacity: {checkpoint.capacity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Emergency Contacts */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Emergency Contacts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-lg font-bold text-blue-600 mb-1">{contact.number}</div>
                <div className="text-sm font-medium text-gray-900 mb-1">{contact.name}</div>
                <div className="text-xs text-gray-500 capitalize">{contact.type}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Checklist */}
        <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800 mb-4 text-xl">Emergency Checklist: What to do when war starts in The Netherlands</h4>              
              {/* Phase 1 */}
              <div className="mb-6">
                <h5 className="font-semibold text-red-700 mb-3 text-lg">Phase 1: Stay Informed & Prepare (Before Conflict Escalates)</h5>
                
                <div className="mb-4">
                  <h6 className="font-medium text-red-700 mb-2">Follow Official Announcements</h6>
                  <ul className="text-sm text-red-600 space-y-1">
                    <li>✅ Monitor news sources: NOS, Rijksoverheid, NL-Alert, Crisis.nl</li>
                    <li>✅ Listen to emergency broadcasts on NPO Radio 1 & local authorities</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h6 className="font-medium text-red-700 mb-2">Assemble an Emergency Kit</h6>
                  <ul className="text-sm text-red-600 space-y-1">
                    <li>✅ <strong>Food & Water:</strong> 3-7 days' worth of non-perishable food and bottled water</li>
                    <li>✅ <strong>First Aid Kit:</strong> Medical supplies, prescription medicines</li>
                    <li>✅ <strong>Communication Tools:</strong> Battery-powered radio, power banks</li>
                    <li>✅ <strong>Identification & Documents:</strong> Passport, insurance papers, cash</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h6 className="font-medium text-red-700 mb-2">Additional Supplies</h6>
                  <ul className="text-sm text-red-600 space-y-1">
                    <li>✅ Sleeping bags or thermal blankets (for warmth and comfort)</li>
                    <li>✅ Face masks and gloves (protection against dust, debris, or chemical hazards)</li>
                    <li>✅ Waterproof matches or lighters (for starting fires in emergencies)</li>
                    <li>✅ Maps of the local area and evacuation routes (in case GPS is unavailable)</li>
                    <li>✅ Extra keys for home and vehicle (useful for emergency evacuations)</li>
                    <li>✅ Duct tape and plastic sheeting (for sealing windows or temporary repairs)</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h6 className="font-medium text-red-700 mb-2">Plan Shelter Options</h6>
                  <ul className="text-sm text-red-600 space-y-1">
                    <li>✅ Identify safe locations at home (basement, windowless rooms)</li>
                    <li>✅ Find the nearest official shelter or bunker (check municipality info)</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h6 className="font-medium text-red-700 mb-2">Prepare an Evacuation Plan</h6>
                  <ul className="text-sm text-red-600 space-y-1">
                    <li>✅ Arrange transportation options (car, bike, walking routes)</li>
                    <li>✅ Know safe evacuation zones (rural areas, designated safe zones)</li>
                    <li>✅ Fill car fuel tanks & charge electronic devices</li>
                    <li>✅ Inform family & create a communication plan in case of network failure</li>
                    <li>✅ Stock up on essential medications & pet supplies if needed</li>
                  </ul>
                </div>
              </div>

              {/* Phase 2 */}
              <div className="mb-6">
                <h5 className="font-semibold text-red-700 mb-3 text-lg">Phase 2: Immediate Action When War Starts</h5>
                <ul className="text-sm text-red-600 space-y-1">
                  <li>✅ Stay indoors & seek shelter (reinforced room, away from windows)</li>
                  <li>✅ Lock doors & windows, turn off ventilation if necessary</li>
                  <li>✅ Follow NL-Alert & emergency services updates</li>
                  <li>✅ Only call <strong>112</strong> for life-threatening emergencies</li>
                  <li>✅ Use texts or radio to communicate; conserve phone battery</li>
                  <li>✅ Avoid conflict zones, military sites & government buildings</li>
                  <li>✅ Do not approach military personnel or vehicles</li>
                </ul>
              </div>

              {/* Phase 3 */}
              <div className="mb-6">
                <h5 className="font-semibold text-red-700 mb-3 text-lg">Phase 3: Survival & Recovery</h5>
                <ul className="text-sm text-red-600 space-y-1">
                  <li>✅ Follow government & military instructions</li>
                  <li>✅ If evacuation is ordered, leave only with essential items</li>
                  <li>✅ Help elderly, disabled, and vulnerable individuals</li>
                  <li>✅ Expect possible power, water & internet outages</li>
                  <li>✅ Rely on stored supplies and practice hygiene with limited resources</li>
                  <li>✅ Report damages and seek aid from local authorities when safe</li>
                  <li>✅ Wait for official confirmation before returning to normal activities</li>
                </ul>
              </div>

              {/* Final Reminders */}
              <div className="bg-red-100 border border-red-300 rounded-lg p-4">
                <h5 className="font-semibold text-red-800 mb-2 text-lg">Final Reminders</h5>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>✔ Stay calm and avoid panic</li>
                  <li>✔ Trust only official sources; do not spread misinformation</li>
                  <li>✔ Understand your rights under international humanitarian law</li>
                </ul>
                <p className="text-sm text-red-600 mt-3 font-medium">
                  <strong>Keep this checklist in a safe and accessible place.</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
