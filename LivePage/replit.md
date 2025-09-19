# Overview

Disaster Watch India is a real-time emergency monitoring application that aggregates disaster information from multiple sources including government APIs (NDMA, IMD), social media platforms, and satellite imagery. The system provides a comprehensive dashboard for tracking active disasters, social media reports, and data source statuses across India, with features for verification, filtering, and real-time updates.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built using React with TypeScript, utilizing a modern component-based architecture. Key decisions include:

- **UI Framework**: Uses shadcn/ui components built on Radix UI primitives with Tailwind CSS for consistent styling and accessibility
- **State Management**: React Query (@tanstack/react-query) for server state management with built-in caching and synchronization
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Updates**: WebSocket connection for live data feeds, with REST API fallback for reliability
- **Component Structure**: Modular dashboard components (Header, AlertSummary, MapVisualization, ActiveAlerts, etc.) for maintainability

## Backend Architecture
The backend follows an Express.js REST API pattern with modular service architecture:

- **Framework**: Express.js with TypeScript for type safety
- **Data Storage**: In-memory storage implementation (MemStorage) with interface abstraction for easy database migration
- **Real-time Communication**: WebSocket server for live updates to connected clients
- **Data Aggregation**: Scheduled services using node-cron for periodic data collection from external sources
- **Service Layer**: Separated concerns with dedicated services for government APIs and social media monitoring

## Data Collection Strategy
The system implements a multi-source data aggregation approach:

- **Government APIs**: NDMA and IMD services for official disaster alerts and weather warnings
- **Social Media Monitoring**: Twitter API integration for crowdsourced disaster reports
- **Scheduled Updates**: Automated data collection every 2-5 minutes with API status monitoring
- **Data Verification**: Multi-stage verification system for social media reports (pending, verified, flagged, dismissed)

## Map Integration
Interactive disaster visualization using:

- **Leaflet Maps**: OpenStreetMap integration for geographical disaster plotting
- **Dynamic Loading**: Async component loading to avoid SSR issues
- **Marker Clustering**: Severity-based color coding and custom icons for different disaster types

## Development Architecture
The project uses a monorepo structure with shared types and schemas:

- **Build System**: Vite for frontend bundling with esbuild for server-side compilation
- **Type Safety**: Shared TypeScript schemas between client and server via `@shared` namespace
- **Database Schema**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Development Tools**: Hot reload support with Replit-specific optimizations

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL using `@neondatabase/serverless` for production deployment
- **Drizzle ORM**: Type-safe database operations with schema migrations and query building

## Government APIs
- **NDMA API**: National Disaster Management Authority for official disaster alerts
- **IMD API**: India Meteorological Department for weather warnings and forecasts
- **ISRO BHUVAN**: Satellite imagery services for geographical data

## Social Media Platforms
- **Twitter/X API**: Real-time social media monitoring using Bearer Token authentication
- **Platform Integration**: Extensible architecture for additional social platforms (Instagram, Facebook)

## Mapping and Visualization
- **Leaflet**: Open-source mapping library for interactive geographical visualization
- **OpenStreetMap**: Tile services for map rendering

## UI and Styling
- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide Icons**: Consistent icon library for UI elements
- **React Icons**: Additional icon sets including FontAwesome for social media branding

## Monitoring and Communication
- **WebSocket**: Real-time bidirectional communication for live updates
- **Axios**: HTTP client for external API requests with timeout and error handling
- **Node-cron**: Scheduled task execution for data collection services

## Development and Deployment
- **Replit**: Development environment with specialized plugins for runtime error handling
- **PostCSS**: CSS processing with Autoprefixer for browser compatibility
- **ESBuild**: Fast bundling for production server builds