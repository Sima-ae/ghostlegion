# Ghost Legion - Military Preparedness & Community Management Platform

A comprehensive military preparedness and community management platform designed specifically for the Netherlands during crisis situations. This application provides real-time mapping, personnel management, evacuation planning, and community coordination tools.

## 🚀 Features

### 🗺️ Interactive Mapping System
- **Real-time Location Tracking**: Interactive map with pins for all critical locations
- **Location Types**: Bunkers, fortresses, hiding places, evacuation centers, medical facilities, command centers, and supply depots
- **Detailed Information**: Each location includes capacity, facilities, contact information, and status updates
- **Geographic Coverage**: Complete coverage of the Netherlands with strategic positioning

### 👥 Comprehensive Personnel Management
- **Multi-Department Support**: Military, government, humanitarian, medical, logistics, communication, law enforcement, civilian, and volunteer personnel
- **Role-Based Access**: Different clearance levels and permissions
- **Real-time Status**: Online/offline status tracking
- **Skills Management**: Detailed skill sets and specializations
- **Contact Information**: Direct communication channels

### 🚨 Evacuation Planning System
- **Route Management**: Multiple evacuation routes with waypoints
- **Transport Options**: Foot, vehicle, public transport, and military vehicle routes
- **Capacity Planning**: Real-time capacity tracking and management
- **Priority System**: High, medium, and low priority routes
- **Status Monitoring**: Open, closed, congested, and dangerous route status

### 📦 Resource Management
- **Inventory Tracking**: Food, water, medical supplies, fuel, ammunition, and equipment
- **Stock Levels**: Real-time inventory monitoring with low-stock alerts
- **Location-Based**: Resources tied to specific locations
- **Expiry Management**: Track expiration dates for perishable items

### 🚨 Alert System
- **Multi-Level Alerts**: Low, medium, high, and critical severity levels
- **Alert Types**: Security, evacuation, medical, logistics, and general alerts
- **Location-Specific**: Alerts can be tied to specific locations
- **Acknowledgment System**: Track who has acknowledged alerts

### 👥 Community Platform
- **Real-time Communication**: Chat and messaging system
- **Department Collaboration**: Cross-department communication
- **Status Updates**: Real-time status sharing
- **Skill Sharing**: Community skill and resource sharing

## 🏗️ Technical Architecture

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Leaflet**: Interactive mapping library
- **Lucide React**: Modern icon library

### Key Components
- **Dashboard**: Overview of all systems and real-time statistics
- **Map Component**: Interactive map with location pins and popups
- **Personnel Grid**: Advanced personnel management with filtering
- **Evacuation Plan**: Comprehensive evacuation route management
- **Location Cards**: Detailed location information display
- **Sidebar Navigation**: Collapsible navigation with department organization

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sima-ae/ghostlegion.git
   cd ghostlegion
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Personnel Categories

### Military & Defense Personnel
- Soldiers (infantry, artillery, special forces, engineers)
- Commanders and strategists
- Intelligence personnel (spies, analysts, cyber warfare experts)
- Explosive Ordnance Disposal (EOD) teams
- Snipers and marksmen
- Tank crews and armored vehicle operators
- Pilots and air force personnel
- Naval forces
- Military medics and combat nurses
- Logistics and supply chain managers
- Cybersecurity and electronic warfare experts
- Military police
- Psychological operations (PSYOPS) personnel
- Weapons and technology engineers

### Government & Emergency Management
- Government leaders and crisis managers
- Emergency response coordinators
- Civil defense organizations
- Evacuation planners and transport coordinators
- Diplomatic personnel
- Public relations and media spokespeople
- Border control and customs officers
- Legal advisors and human rights officers
- Elections and governance staff

### Humanitarian & Relief Workers
- United Nations (UN) personnel
- Red Cross / Red Crescent workers
- Non-Governmental Organizations (NGOs) staff
- Refugee camp coordinators
- Field medics and mobile hospital teams
- Psychologists and trauma counselors
- Volunteers distributing essentials
- Translators and cultural liaisons
- Social workers helping displaced individuals
- Child protection services

### Medical & Healthcare Personnel
- Doctors and surgeons (trauma specialists, general practitioners)
- Paramedics and emergency medical technicians (EMTs)
- Nurses and caregivers
- Pharmacists and medical supply coordinators
- Field hospital staff
- Mental health professionals
- Disease control and sanitation experts

### Logistics, Transport & Supply Chain
- Truck drivers and vehicle operators
- Railway and public transport operators
- Aircraft pilots and helicopter crews
- Ship captains and naval transport crews
- Warehouse managers and supply chain coordinators
- Fuel and energy technicians
- Construction and infrastructure repair teams

### Communication & Information Management
- Journalists and war correspondents
- IT specialists and cybersecurity experts
- Satellite and radio communication operators
- Social media managers
- Propaganda and counter-propaganda personnel
- Librarians and archivists

### Law Enforcement & Security
- Police officers and riot control teams
- Private security firms
- Border guards and customs officials
- Counterintelligence and anti-espionage agents
- Prison management staff

### Local Community & Civilian Volunteers
- Neighborhood watch groups and civil defense militias
- Teachers and educators
- Religious leaders providing spiritual support
- Local business owners supporting with resources
- Tech and software developers
- Farmers and food producers

## 🗺️ Sample Locations (Netherlands)

- **Fort Pampus**: Historical fort in IJmeer, suitable as command center
- **Bunkercomplex Den Haag**: Underground complex under Binnenhof
- **Evacuatiecentrum Amsterdam RAI**: Large exhibition hall for mass evacuation
- **Medisch Centrum Utrecht**: Specialized trauma center
- **Bunker Maastricht**: Strategic location near German border

## 🛣️ Evacuation Routes

- **Amsterdam → Utrecht**: High priority public transport route
- **Den Haag → Rotterdam**: High priority public transport route  
- **Groningen → Germany**: Medium priority military vehicle route

## 🔧 Development

### Project Structure
```
app/
├── components/          # React components
├── data/              # Sample data and mock data
├── lib/               # Utility functions
├── types/             # TypeScript type definitions
├── globals.css        # Global styles
├── layout.tsx         # Root layout
└── page.tsx          # Main page component
```

### Key Features Implemented
- ✅ Interactive mapping with Leaflet
- ✅ Personnel management system
- ✅ Evacuation planning
- ✅ Resource tracking
- ✅ Alert system
- ✅ Community platform
- ✅ Responsive design
- ✅ Professional UI/UX

### Future Enhancements
- 🔄 User authentication and role management
- 🔄 Real-time data synchronization
- 🔄 Advanced analytics and reporting
- 🔄 Mobile application
- 🔄 Offline capabilities
- 🔄 Integration with external systems

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Various screen sizes

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface
- **Intuitive Navigation**: Easy-to-use sidebar and navigation
- **Real-time Updates**: Live status updates and notifications
- **Color-coded Status**: Visual status indicators throughout
- **Interactive Elements**: Hover effects and smooth transitions
- **Accessibility**: Screen reader friendly and keyboard navigation

## 🔒 Security

### Security Updates Applied
- ✅ **React 19.1.4**: Fixed CVE-2025-55184 (DoS) and CVE-2025-55183 (Source Code Exposure)
- ✅ **Next.js 15.5.9**: Fixed RCE, Source Code Exposure, and DoS vulnerabilities
- ✅ **NextAuth 4.24.13**: Fixed email misdelivery vulnerability
- ✅ **Security Headers**: Configured in `next.config.ts`
- ✅ **No Hardcoded Secrets**: All credentials use environment variables
- ✅ **Input Sanitization**: No XSS vulnerabilities detected

### Environment Variables Required
See `SECURITY.md` for detailed security documentation.

**Required for production:**
- `DATABASE_URL` - Database connection string
- `NEXTAUTH_URL` - Application URL (e.g., https://your-domain.com)
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`

**For development seeding:**
- `ADMIN_EMAIL` - Admin user email
- `ADMIN_PASSWORD` - Admin user password

### Security Features
- Role-based access control
- Clearance level management
- Secure password hashing (bcrypt)
- JWT-based session management
- Security headers (HSTS, XSS Protection, etc.)
- Environment variable protection

## 📄 License

This project is private and confidential. All rights reserved.

## 👥 Contributing

This is a private project. For access or contributions, please contact the development team.

## 📞 Support

For technical support or questions, please contact the development team through the appropriate channels.

---

**Ghost Legion** - Preparing the Netherlands for any crisis situation with comprehensive military preparedness and community management tools.