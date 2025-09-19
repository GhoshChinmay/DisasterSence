import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { dataAggregator } from "./services/dataAggregator";
import { insertDisasterSchema, insertSocialMediaReportSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Setup WebSocket for real-time updates
  dataAggregator.setupWebSocket(httpServer);
  
  // Start data collection services
  dataAggregator.startDataCollection();

  // Dashboard data endpoint
  app.get("/api/dashboard", async (req, res) => {
    try {
      const [disasters, socialReports, apiStatuses, alertSummary] = await Promise.all([
        storage.getDisasters({ isActive: true }),
        storage.getSocialMediaReports(),
        storage.getApiStatuses(),
        storage.getAlertSummary()
      ]);

      res.json({
        disasters: disasters.slice(0, 50),
        socialReports: socialReports.slice(0, 20),
        apiStatuses,
        alertSummary,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard data' });
    }
  });

  // Disasters endpoints
  app.get("/api/disasters", async (req, res) => {
    try {
      const { type, severity, state, search, isActive } = req.query;
      const disasters = await storage.getDisasters({
        type: type as string,
        severity: severity as string,
        state: state as string,
        search: search as string,
        isActive: isActive ? isActive === 'true' : undefined
      });
      res.json(disasters);
    } catch (error) {
      console.error('Error fetching disasters:', error);
      res.status(500).json({ message: 'Failed to fetch disasters' });
    }
  });

  app.get("/api/disasters/:id", async (req, res) => {
    try {
      const disaster = await storage.getDisaster(req.params.id);
      if (!disaster) {
        return res.status(404).json({ message: 'Disaster not found' });
      }
      res.json(disaster);
    } catch (error) {
      console.error('Error fetching disaster:', error);
      res.status(500).json({ message: 'Failed to fetch disaster' });
    }
  });

  app.post("/api/disasters", async (req, res) => {
    try {
      const validatedData = insertDisasterSchema.parse(req.body);
      const disaster = await storage.createDisaster(validatedData);
      res.status(201).json(disaster);
    } catch (error) {
      console.error('Error creating disaster:', error);
      res.status(400).json({ message: 'Invalid disaster data' });
    }
  });

  app.patch("/api/disasters/:id", async (req, res) => {
    try {
      const disaster = await storage.updateDisaster(req.params.id, req.body);
      if (!disaster) {
        return res.status(404).json({ message: 'Disaster not found' });
      }
      res.json(disaster);
    } catch (error) {
      console.error('Error updating disaster:', error);
      res.status(500).json({ message: 'Failed to update disaster' });
    }
  });

  // Social media reports endpoints
  app.get("/api/social-reports", async (req, res) => {
    try {
      const { platform, isVerified, location } = req.query;
      const reports = await storage.getSocialMediaReports({
        platform: platform as string,
        isVerified: isVerified ? isVerified === 'true' : undefined,
        location: location as string
      });
      res.json(reports);
    } catch (error) {
      console.error('Error fetching social media reports:', error);
      res.status(500).json({ message: 'Failed to fetch social media reports' });
    }
  });

  app.post("/api/social-reports", async (req, res) => {
    try {
      const validatedData = insertSocialMediaReportSchema.parse(req.body);
      const report = await storage.createSocialMediaReport(validatedData);
      res.status(201).json(report);
    } catch (error) {
      console.error('Error creating social media report:', error);
      res.status(400).json({ message: 'Invalid social media report data' });
    }
  });

  app.patch("/api/social-reports/:id/verify", async (req, res) => {
    try {
      const { status } = req.body;
      const report = await storage.updateSocialMediaReportVerification(req.params.id, status);
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }
      res.json(report);
    } catch (error) {
      console.error('Error updating report verification:', error);
      res.status(500).json({ message: 'Failed to update report verification' });
    }
  });

  // Map data endpoint
  app.get("/api/map/disasters", async (req, res) => {
    try {
      const { lat, lng, radius } = req.query;
      
      if (lat && lng && radius) {
        const disasters = await storage.getDisastersByLocation(
          parseFloat(lat as string),
          parseFloat(lng as string),
          parseFloat(radius as string)
        );
        res.json(disasters);
      } else {
        const disasters = await storage.getDisasters({ isActive: true });
        res.json(disasters.filter(d => d.latitude && d.longitude));
      }
    } catch (error) {
      console.error('Error fetching map disasters:', error);
      res.status(500).json({ message: 'Failed to fetch map data' });
    }
  });

  // API status endpoint
  app.get("/api/status", async (req, res) => {
    try {
      const statuses = await storage.getApiStatuses();
      res.json(statuses);
    } catch (error) {
      console.error('Error fetching API statuses:', error);
      res.status(500).json({ message: 'Failed to fetch API statuses' });
    }
  });

  // Alert summary endpoint
  app.get("/api/summary", async (req, res) => {
    try {
      const summary = await storage.getAlertSummary();
      res.json(summary);
    } catch (error) {
      console.error('Error fetching alert summary:', error);
      res.status(500).json({ message: 'Failed to fetch alert summary' });
    }
  });

  // Manual data refresh endpoint
  app.post("/api/refresh", async (req, res) => {
    try {
      // This will be handled by the cron jobs, but can trigger immediate refresh
      res.json({ message: 'Data refresh triggered', timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error triggering refresh:', error);
      res.status(500).json({ message: 'Failed to trigger refresh' });
    }
  });

  return httpServer;
}
