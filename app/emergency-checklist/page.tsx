'use client';

import { AlertTriangle, CheckCircle, Shield, Radio, MapPin, Users, Phone, FileText } from 'lucide-react';

export default function EmergencyChecklistPage() {
  return (
    <div className="bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">Emergency Checklist</h1>
          </div>
          <p className="text-lg text-gray-600">
            What to do when war starts in The Netherlands
          </p>
        </div>

        {/* Phase 1 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">1</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Phase 1: Stay Informed & Prepare</h2>
            <span className="text-sm text-gray-500">(Before Conflict Escalates)</span>
          </div>

          {/* Follow Official Announcements */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <Radio className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Follow Official Announcements</h3>
            </div>
            <ul className="space-y-2 ml-7">
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Monitor news sources: NOS, Rijksoverheid, NL-Alert, Crisis.nl</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Listen to emergency broadcasts on NPO Radio 1 & local authorities</span>
              </li>
            </ul>
          </div>

          {/* Assemble an Emergency Kit */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Assemble an Emergency Kit</h3>
            </div>
            <ul className="space-y-2 ml-7">
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700"><strong>Food & Water:</strong> 3-7 days' worth of non-perishable food and bottled water</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700"><strong>First Aid Kit:</strong> Medical supplies, prescription medicines</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700"><strong>Communication Tools:</strong> Battery-powered radio, power banks</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700"><strong>Identification & Documents:</strong> Passport, insurance papers, cash</span>
              </li>
            </ul>
          </div>

          {/* Additional Supplies */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Additional Supplies</h3>
            </div>
            <ul className="space-y-2 ml-7">
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Sleeping bags or thermal blankets (for warmth and comfort)</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Face masks and gloves (protection against dust, debris, or chemical hazards)</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Waterproof matches or lighters (for starting fires in emergencies)</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Maps of the local area and evacuation routes (in case GPS is unavailable)</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Extra keys for home and vehicle (useful for emergency evacuations)</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Duct tape and plastic sheeting (for sealing windows or temporary repairs)</span>
              </li>
            </ul>
          </div>

          {/* Plan Shelter Options */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <MapPin className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Plan Shelter Options</h3>
            </div>
            <ul className="space-y-2 ml-7">
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Identify safe locations at home (basement, windowless rooms)</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Find the nearest official shelter or bunker (check municipality info)</span>
              </li>
            </ul>
          </div>

          {/* Prepare an Evacuation Plan */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Prepare an Evacuation Plan</h3>
            </div>
            <ul className="space-y-2 ml-7">
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Arrange transportation options (car, bike, walking routes)</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Know safe evacuation zones (rural areas, designated safe zones)</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Fill car fuel tanks & charge electronic devices</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Inform family & create a communication plan in case of network failure</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Stock up on essential medications & pet supplies if needed</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Phase 2 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 font-bold text-sm">2</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Phase 2: Immediate Action When War Starts</h2>
          </div>
          <ul className="space-y-2 ml-7">
            <li className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Stay indoors & seek shelter (reinforced room, away from windows)</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Lock doors & windows, turn off ventilation if necessary</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Follow NL-Alert & emergency services updates</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Only call <strong>112</strong> for life-threatening emergencies</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Use texts or radio to communicate; conserve phone battery</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Avoid conflict zones, military sites & government buildings</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Do not approach military personnel or vehicles</span>
            </li>
          </ul>
        </div>

        {/* Phase 3 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold text-sm">3</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Phase 3: Survival & Recovery</h2>
          </div>
          <ul className="space-y-2 ml-7">
            <li className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Follow government & military instructions</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">If evacuation is ordered, leave only with essential items</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Help elderly, disabled, and vulnerable individuals</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Expect possible power, water & internet outages</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Rely on stored supplies and practice hygiene with limited resources</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Report damages and seek aid from local authorities when safe</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Wait for official confirmation before returning to normal activities</span>
            </li>
          </ul>
        </div>

        {/* Final Reminders */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-bold text-red-800">Final Reminders</h2>
          </div>
          <ul className="space-y-2 ml-7">
            <li className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-red-700">Stay calm and avoid panic</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-red-700">Trust only official sources; do not spread misinformation</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-red-700">Understand your rights under international humanitarian law</span>
            </li>
          </ul>
          <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-800 font-semibold text-center">
              Keep this checklist in a safe and accessible place.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
