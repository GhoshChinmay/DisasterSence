# Disaster Operations React App

A modern React application for disaster management and emergency response coordination. This app provides role-based dashboards for Government agencies, NGOs, First Responders, and the General Public.

## Features

- **Multi-role Authentication**: Separate login flows for Government, NGO, First Responder, and Public users
- **Role-based Dashboards**: Customized interfaces for each user type
- **Real-time Data**: Interactive charts, maps, and live updates
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Modern UI**: Dark theme with teal/emerald/amber/indigo color schemes

## Role Capabilities

### Government Dashboard
- Allocate and track resources (Food, Medicine, Shelters, Equipment)
- Issue emergency alerts and warnings
- Approve/deny NGO resource requests
- Coordinate with emergency agencies
- Interactive maps and charts for resource tracking

### NGO Dashboard
- Request relief resources from government
- Share ground reports and situation updates
- Deploy volunteer teams and aid workers
- Manage shelters and supply depots
- Track approved requests and deployments

### First Responder Dashboard
- Receive and accept task assignments
- Update status and location in real-time
- GPS location tracking
- Task completion management
- Private mapping interface

### Public Portal
- View active emergency alerts
- Report incidents with location data
- Find nearby shelters and helplines
- Public map with incidents and camps
- Anonymous incident reporting

## Tech Stack

- **React 18** with Vite for fast development
- **React Router** for client-side routing
- **Tailwind CSS** for styling and responsive design
- **Chart.js** for data visualization
- **Leaflet** for interactive maps
- **Lucide React** for consistent icons
- **Local Storage** for data persistence

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd disaster-operations-react
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

## Usage

1. **Access the landing page** - Select your role (Government, NGO, First Responder, or Public)
2. **Login** - Use the authentication form for your selected role
3. **Dashboard access** - You'll be redirected to your role-specific dashboard
4. **Interact with features** - Use the various forms, maps, and charts to manage disaster operations

## Project Structure

```
src/
├── components/
│   ├── LandingPage.jsx          # Main landing page with role selection
│   ├── GovernmentDashboard.jsx  # Government agency dashboard
│   ├── NGODashboard.jsx         # NGO/Relief organization dashboard
│   ├── FirstResponderDashboard.jsx # First responder dashboard
│   └── PublicDashboard.jsx      # Public portal
├── contexts/
│   └── AuthContext.jsx          # Authentication state management
├── utils/
│   └── loadExternalScripts.js   # External script loading utilities
├── App.jsx                      # Main app component with routing
├── main.jsx                     # Application entry point
└── index.css                    # Global styles and Tailwind imports
```

## Data Persistence

The app uses browser localStorage to persist:
- User authentication sessions
- Dashboard data (allocations, requests, alerts, etc.)
- User preferences and settings

## Responsive Design

The application is fully responsive and works on:
- Desktop computers (1200px+)
- Tablets (768px - 1199px)
- Mobile phones (320px - 767px)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Setup

No additional environment variables are required for basic functionality. The app works out of the box with the included external CDN resources.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team or create an issue in the repository.
