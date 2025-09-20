# DisasterSense Unified Platform

A unified React application combining disaster prediction, live monitoring, authentication, and emergency response features.

## 🚀 Quick Start

```bash
npm install
npm start
```

The application will start at `http://localhost:3000`

## 📋 Features

### 🏠 Landing Page (DisasterSense)
- Modern landing page with disaster prediction features
- **Speech-to-text button** on bottom-right corner using Web Speech API
- Integrates with OpenAI Whisper API for voice processing
- "Get Started" button redirects to Auth page

### 🔐 Authentication (UserC Integration)
- Multi-role authentication system
- **Demo Credentials:**
  - Government: `admin@gov.in` / `password123`
  - NGO: `ngo@gov.in` / `help123`
  - First Responder: `FX-1111` / `123456`
  - Public: `+91987654321` / `112233`

### 📊 Dashboard
- Unified dashboard with role-based access
- **Extended sidebar** with new menu items:
  - **Live** → IndiaRelief live updates
  - **Predict** → IndiaRisk analytics
- Overview with real-time statistics
- Quick action buttons

### 📡 Live Page (IndiaRelief)
- Real-time government alerts (NDMA/IMD integration)
- Social media monitoring (Twitter API)
- Live disaster updates and emergency reports
- API status monitoring

### 🔮 Predict Page (IndiaRisk)
- AI-powered disaster predictions
- Multiple prediction models (Weather-AI, Seismic-AI, etc.)
- Regional risk analysis
- OpenAI integration for enhanced predictions

## 🔧 Environment Variables

Copy the `.env` file and replace with your actual API keys:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_key_here

# OpenAI Configuration
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here

# Weather API Configuration
REACT_APP_WEATHER_API_KEY=your_weather_api_key_here

# Twitter API Configuration
REACT_APP_TWITTER_API_KEY=your_twitter_api_key_here
REACT_APP_TWITTER_API_SECRET=your_twitter_api_secret_here
REACT_APP_TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here

# Government APIs
REACT_APP_NDMA_API_KEY=your_ndma_api_key_here
REACT_APP_IMD_API_KEY=your_imd_api_key_here
```

## 🎯 Navigation Flow

```
Landing Page (/) 
    ↳ Speech-to-Text Button (Web Speech API + OpenAI Whisper)
    ↳ Get Started Button
        ↳ Auth Page (/auth)
            ↳ Role Selection (Gov/NGO/FR/Public)
            ↳ Login Forms
                ↳ Dashboard (/dashboard)
                    ↳ Overview Tab
                    ↳ Live Tab (IndiaRelief)
                    ↳ Predict Tab (IndiaRisk)
                    ↳ Other Features
```

## 🛠 Technology Stack

- **Frontend:** React 18, React Router, Tailwind CSS
- **Authentication:** Supabase Auth
- **Icons:** Lucide React
- **Charts:** Chart.js, Recharts
- **Speech:** Web Speech API
- **Maps:** Leaflet, React Leaflet

## 📱 Features Overview

### Speech Recognition Component
- Voice-to-text emergency reporting
- Web Speech API integration
- OpenAI Whisper API processing
- Real-time transcript display

### Dashboard Components
- Unified sidebar navigation
- Role-based access control
- Real-time data updates
- Responsive design

### Live Monitoring
- NDMA/IMD government alerts
- Twitter social media feeds
- API integration status
- Real-time refresh (30s intervals)

### AI Predictions
- Weather forecasting models
- Seismic activity prediction
- Flood risk analysis
- Regional risk assessment

## 🔒 Security Features

- Role-based authentication
- Environment variable protection
- Secure API key management
- Error boundary protection

## 🚢 Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy the `build` folder to your hosting service

3. Configure environment variables on your hosting platform

## 🐛 Troubleshooting

- **Speech Recognition:** Requires HTTPS in production
- **API Keys:** Ensure all environment variables are set
- **CORS Issues:** Configure API endpoints for cross-origin requests

## 📞 Support

For technical support or integration help, contact the development team.

---

**Note:** This is a unified platform combining multiple disaster management systems. All API integrations use placeholder keys that need to be replaced with actual production keys.