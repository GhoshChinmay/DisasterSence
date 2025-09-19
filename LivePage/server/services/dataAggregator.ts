import { storage } from '../storage';
import { governmentApiService } from './governmentApiService';
import { socialMediaService } from './socialMediaService';
import cron from 'node-cron';
import { WebSocketServer } from 'ws';
import { Server } from 'http';

export class DataAggregator {
  private wss: WebSocketServer | null = null;

  setupWebSocket(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    
    this.wss.on('connection', (ws) => {
      console.log('Client connected to WebSocket');
      
      // Send initial data
      this.sendDashboardUpdate(ws);
      
      ws.on('close', () => {
        console.log('Client disconnected from WebSocket');
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
  }

  startDataCollection() {
    // Fetch government data every 2 minutes
    cron.schedule('*/2 * * * *', async () => {
      console.log('Fetching government API data...');
      await this.fetchGovernmentData();
    });

    // Fetch social media data every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      console.log('Fetching social media data...');
      await this.fetchSocialMediaData();
    });

    // Update API status every minute
    cron.schedule('* * * * *', async () => {
      await this.updateApiStatuses();
    });

    // Initial data fetch and sample data
    setTimeout(() => {
      this.initializeSampleData();
      this.fetchGovernmentData();
      this.fetchSocialMediaData();
      this.updateApiStatuses();
    }, 1000);
  }

  private async fetchGovernmentData() {
    try {
      await storage.updateApiStatus('NDMA API', {
        serviceName: 'NDMA API',
        status: 'online',
        lastSuccessfulSync: new Date(),
        responseTime: null,
        errorMessage: null
      });

      const ndmaAlerts = await governmentApiService.fetchNDMAAlerts();
      const imdAlerts = await governmentApiService.fetchIMDWeatherAlerts();
      
      for (const alert of [...ndmaAlerts, ...imdAlerts]) {
        await storage.createDisaster(alert);
      }

      await storage.updateApiStatus('IMD API', {
        serviceName: 'IMD API',
        status: 'online',
        lastSuccessfulSync: new Date(),
        responseTime: null,
        errorMessage: null
      });

      this.broadcastUpdate();
    } catch (error) {
      console.error('Error in government data fetch:', error);
      await storage.updateApiStatus('NDMA API', {
        serviceName: 'NDMA API',
        status: 'error',
        lastSuccessfulSync: null,
        responseTime: null,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async fetchSocialMediaData() {
    try {
      const reports = await socialMediaService.fetchTwitterReports([
        'flood india', 'earthquake india', 'fire india', 'cyclone india', 
        'landslide india', 'emergency india', 'disaster india'
      ]);
      
      for (const report of reports) {
        await storage.createSocialMediaReport(report);
      }

      await storage.updateApiStatus('Twitter API', {
        serviceName: 'Twitter API',
        status: 'online',
        lastSuccessfulSync: new Date(),
        responseTime: null,
        errorMessage: null
      });

      this.broadcastUpdate();
    } catch (error) {
      console.error('Error in social media data fetch:', error);
      await storage.updateApiStatus('Twitter API', {
        serviceName: 'Twitter API',
        status: 'error',
        lastSuccessfulSync: null,
        responseTime: null,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async updateApiStatuses() {
    // Update ISRO BHUVAN status (simulated as it may not have real-time API)
    const randomDelay = Math.random() > 0.8;
    await storage.updateApiStatus('ISRO BHUVAN', {
      serviceName: 'ISRO BHUVAN',
      status: randomDelay ? 'delayed' : 'online',
      lastSuccessfulSync: randomDelay ? null : new Date(),
      responseTime: randomDelay ? null : Math.floor(Math.random() * 1000) + 500,
      errorMessage: randomDelay ? 'Satellite data processing delay' : null
    });
  }

  private async broadcastUpdate() {
    if (!this.wss) return;

    const dashboardData = await this.getDashboardData();
    const message = JSON.stringify({
      type: 'dashboard_update',
      data: dashboardData,
      timestamp: new Date().toISOString()
    });

    this.wss.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message);
      }
    });
  }

  private async sendDashboardUpdate(client: any) {
    const dashboardData = await this.getDashboardData();
    const message = JSON.stringify({
      type: 'dashboard_update',
      data: dashboardData,
      timestamp: new Date().toISOString()
    });
    
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(message);
    }
  }

  private async initializeSampleData() {
    // Sample disaster data for demonstration
    const sampleDisasters = [
      {
        title: "Severe Cyclone Warning - Odisha Coast",
        description: "Cyclone Yaas is approaching the Odisha coast with wind speeds of 165-175 kmph. Coastal areas have been evacuated.",
        type: "cyclone",
        severity: "critical",
        state: "Odisha",
        district: "Bhadrak",
        latitude: "21.0547",
        longitude: "86.7903",
        source: "IMD",
        sourceUrl: "https://mausam.imd.gov.in",
        affectedPopulation: 500000,
        isVerified: true,
        metadata: {
          windSpeed: "165-175 kmph",
          landfall: "Expected within 6 hours",
          evacuated: "2 lakh people"
        },
        reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isActive: true
      },
      {
        title: "Flash Flood Alert - Mumbai Metropolitan Region",
        description: "Heavy rainfall has caused waterlogging in several areas of Mumbai. Local train services partially suspended.",
        type: "flood",
        severity: "high",
        state: "Maharashtra",
        district: "Mumbai",
        latitude: "19.0760",
        longitude: "72.8777",
        source: "NDMA",
        sourceUrl: "https://ndma.gov.in",
        affectedPopulation: 200000,
        isVerified: true,
        metadata: {
          rainfall: "150mm in 3 hours",
          waterLevel: "3 feet in low-lying areas",
          services: "Local trains disrupted"
        },
        reportedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        isActive: true
      },
      {
        title: "Earthquake - Magnitude 4.2 - Himachal Pradesh",
        description: "Moderate earthquake felt in Shimla and surrounding areas. No casualties reported.",
        type: "earthquake",
        severity: "medium",
        state: "Himachal Pradesh",
        district: "Shimla",
        latitude: "31.1048",
        longitude: "77.1734",
        source: "NDMA",
        sourceUrl: "https://ndma.gov.in",
        affectedPopulation: 50000,
        isVerified: true,
        metadata: {
          magnitude: "4.2",
          depth: "15 km",
          epicenter: "12 km NE of Shimla"
        },
        reportedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        isActive: true
      },
      {
        title: "Forest Fire - Uttarakhand Hills",
        description: "Wildfire spreading in the forest areas near Nainital. Firefighting operations underway.",
        type: "fire",
        severity: "high",
        state: "Uttarakhand",
        district: "Nainital",
        latitude: "29.3803",
        longitude: "79.4636",
        source: "State Forest Department",
        sourceUrl: null,
        affectedPopulation: 10000,
        isVerified: true,
        metadata: {
          area: "200 hectares",
          teams: "15 fire brigades deployed",
          cause: "Under investigation"
        },
        reportedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        isActive: true
      },
      {
        title: "Heat Wave Warning - Rajasthan",
        description: "Severe heat wave conditions with temperatures reaching 48°C in parts of Rajasthan.",
        type: "heatwave",
        severity: "medium",
        state: "Rajasthan",
        district: "Churu",
        latitude: "28.2969",
        longitude: "74.9647",
        source: "IMD",
        sourceUrl: "https://mausam.imd.gov.in",
        affectedPopulation: 300000,
        isVerified: true,
        metadata: {
          temperature: "48°C",
          duration: "Expected for 3 days",
          advisory: "Avoid outdoor activities"
        },
        reportedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        isActive: true
      }
    ];

    // Sample social media reports
    const sampleSocialReports = [
      {
        platform: "twitter",
        postId: "1234567890",
        authorUsername: "WeatherAlert_IN",
        content: "Heavy rains causing waterlogging in Andheri East. Traffic moving very slowly on Western Express Highway. #MumbaiRains #Traffic",
        location: "Mumbai, Maharashtra",
        latitude: "19.1136",
        longitude: "72.8697",
        mediaUrls: [],
        hashtags: ["MumbaiRains", "Traffic"],
        engagementMetrics: {
          retweets: 45,
          likes: 123,
          replies: 12
        },
        isVerified: false,
        verificationStatus: "pending",
        relatedDisasterId: null,
        reportedAt: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
      },
      {
        platform: "twitter",
        postId: "1234567891",
        authorUsername: "OdishaEmergency",
        content: "Cyclone shelter opened at Government High School, Balasore. All residents near coast requested to move to safety immediately. #CycloneYaas #Odisha",
        location: "Balasore, Odisha",
        latitude: "21.4942",
        longitude: "86.9268",
        mediaUrls: [],
        hashtags: ["CycloneYaas", "Odisha"],
        engagementMetrics: {
          retweets: 89,
          likes: 245,
          replies: 23
        },
        isVerified: true,
        verificationStatus: "verified",
        relatedDisasterId: null,
        reportedAt: new Date(Date.now() - 45 * 60 * 1000) // 45 minutes ago
      },
      {
        platform: "twitter",
        postId: "1234567892",
        authorUsername: "HimachalUpdates",
        content: "Felt tremors in Shimla area around 1:30 PM. Buildings shook for about 10 seconds. Everyone is safe in our locality. #Earthquake #Shimla",
        location: "Shimla, Himachal Pradesh",
        latitude: "31.1048",
        longitude: "77.1734",
        mediaUrls: [],
        hashtags: ["Earthquake", "Shimla"],
        engagementMetrics: {
          retweets: 67,
          likes: 156,
          replies: 34
        },
        isVerified: false,
        verificationStatus: "pending",
        relatedDisasterId: null,
        reportedAt: new Date(Date.now() - 25 * 60 * 1000) // 25 minutes ago
      }
    ];

    // Add sample data to storage
    for (const disaster of sampleDisasters) {
      await storage.createDisaster(disaster);
    }

    for (const report of sampleSocialReports) {
      await storage.createSocialMediaReport(report);
    }

    console.log('Sample data initialized with', sampleDisasters.length, 'disasters and', sampleSocialReports.length, 'social media reports');
  }

  private async getDashboardData() {
    const [disasters, socialReports, apiStatuses, alertSummary] = await Promise.all([
      storage.getDisasters({ isActive: true }),
      storage.getSocialMediaReports(),
      storage.getApiStatuses(),
      storage.getAlertSummary()
    ]);

    return {
      disasters: disasters.slice(0, 50), // Limit for performance
      socialReports: socialReports.slice(0, 20),
      apiStatuses,
      alertSummary,
      lastUpdated: new Date().toISOString()
    };
  }
}

export const dataAggregator = new DataAggregator();
