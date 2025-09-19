import { type User, type InsertUser, type Disaster, type InsertDisaster, type SocialMediaReport, type InsertSocialMediaReport, type ApiStatus, type InsertApiStatus } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Disaster methods
  getDisasters(filters?: { type?: string; severity?: string; state?: string; search?: string; isActive?: boolean }): Promise<Disaster[]>;
  getDisaster(id: string): Promise<Disaster | undefined>;
  createDisaster(disaster: InsertDisaster): Promise<Disaster>;
  updateDisaster(id: string, updates: Partial<Disaster>): Promise<Disaster | undefined>;
  getDisastersByLocation(latitude: number, longitude: number, radius: number): Promise<Disaster[]>;

  // Social media report methods
  getSocialMediaReports(filters?: { platform?: string; isVerified?: boolean; location?: string }): Promise<SocialMediaReport[]>;
  createSocialMediaReport(report: InsertSocialMediaReport): Promise<SocialMediaReport>;
  updateSocialMediaReportVerification(id: string, status: string): Promise<SocialMediaReport | undefined>;
  getSocialMediaReportsByKeywords(keywords: string[]): Promise<SocialMediaReport[]>;

  // API status methods
  getApiStatuses(): Promise<ApiStatus[]>;
  updateApiStatus(serviceName: string, status: InsertApiStatus): Promise<ApiStatus>;
  
  // Dashboard aggregations
  getAlertSummary(): Promise<{
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private disasters: Map<string, Disaster>;
  private socialMediaReports: Map<string, SocialMediaReport>;
  private apiStatuses: Map<string, ApiStatus>;

  constructor() {
    this.users = new Map();
    this.disasters = new Map();
    this.socialMediaReports = new Map();
    this.apiStatuses = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getDisasters(filters?: { type?: string; severity?: string; state?: string; search?: string; isActive?: boolean }): Promise<Disaster[]> {
    let result = Array.from(this.disasters.values());
    
    if (filters) {
      if (filters.type) {
        result = result.filter(d => d.type === filters.type);
      }
      if (filters.severity) {
        result = result.filter(d => d.severity === filters.severity);
      }
      if (filters.state) {
        result = result.filter(d => d.state === filters.state);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        result = result.filter(d => 
          d.title.toLowerCase().includes(searchLower) ||
          d.description.toLowerCase().includes(searchLower) ||
          d.state.toLowerCase().includes(searchLower) ||
          d.district?.toLowerCase().includes(searchLower)
        );
      }
      if (filters.isActive !== undefined) {
        result = result.filter(d => d.isActive === filters.isActive);
      }
    }
    
    return result.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
  }

  async getDisaster(id: string): Promise<Disaster | undefined> {
    return this.disasters.get(id);
  }

  async createDisaster(insertDisaster: InsertDisaster): Promise<Disaster> {
    const id = randomUUID();
    const now = new Date();
    const disaster: Disaster = { 
      ...insertDisaster, 
      id, 
      lastUpdated: now,
      metadata: insertDisaster.metadata || null,
      isActive: insertDisaster.isActive ?? true
    };
    this.disasters.set(id, disaster);
    return disaster;
  }

  async updateDisaster(id: string, updates: Partial<Disaster>): Promise<Disaster | undefined> {
    const existing = this.disasters.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates, lastUpdated: new Date() };
    this.disasters.set(id, updated);
    return updated;
  }

  async getDisastersByLocation(latitude: number, longitude: number, radius: number): Promise<Disaster[]> {
    return Array.from(this.disasters.values()).filter(d => {
      if (!d.latitude || !d.longitude) return false;
      
      const lat1 = parseFloat(d.latitude);
      const lon1 = parseFloat(d.longitude);
      const distance = this.calculateDistance(latitude, longitude, lat1, lon1);
      
      return distance <= radius;
    });
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  async getSocialMediaReports(filters?: { platform?: string; isVerified?: boolean; location?: string }): Promise<SocialMediaReport[]> {
    let result = Array.from(this.socialMediaReports.values());
    
    if (filters) {
      if (filters.platform) {
        result = result.filter(r => r.platform === filters.platform);
      }
      if (filters.isVerified !== undefined) {
        result = result.filter(r => r.isVerified === filters.isVerified);
      }
      if (filters.location) {
        const locationLower = filters.location.toLowerCase();
        result = result.filter(r => 
          r.location?.toLowerCase().includes(locationLower)
        );
      }
    }
    
    return result.sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());
  }

  async createSocialMediaReport(insertReport: InsertSocialMediaReport): Promise<SocialMediaReport> {
    const id = randomUUID();
    const now = new Date();
    const report: SocialMediaReport = { 
      ...insertReport, 
      id,
      createdAt: now,
      location: insertReport.location || null,
      latitude: insertReport.latitude || null,
      longitude: insertReport.longitude || null,
      isVerified: insertReport.isVerified ?? false
    };
    this.socialMediaReports.set(id, report);
    return report;
  }

  async updateSocialMediaReportVerification(id: string, status: string): Promise<SocialMediaReport | undefined> {
    const existing = this.socialMediaReports.get(id);
    if (!existing) return undefined;
    
    const updated = { 
      ...existing, 
      verificationStatus: status,
      isVerified: status === "verified"
    };
    this.socialMediaReports.set(id, updated);
    return updated;
  }

  async getSocialMediaReportsByKeywords(keywords: string[]): Promise<SocialMediaReport[]> {
    return Array.from(this.socialMediaReports.values()).filter(r => {
      const contentLower = r.content.toLowerCase();
      return keywords.some(keyword => contentLower.includes(keyword.toLowerCase()));
    });
  }

  async getApiStatuses(): Promise<ApiStatus[]> {
    return Array.from(this.apiStatuses.values());
  }

  async updateApiStatus(serviceName: string, statusData: InsertApiStatus): Promise<ApiStatus> {
    const existing = Array.from(this.apiStatuses.values()).find(s => s.serviceName === serviceName);
    
    if (existing) {
      const updated = { ...existing, ...statusData, updatedAt: new Date() };
      this.apiStatuses.set(existing.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const newStatus: ApiStatus = { 
        ...statusData, 
        id,
        updatedAt: new Date(),
        lastSuccessfulSync: statusData.lastSuccessfulSync || null,
        responseTime: statusData.responseTime || null,
        errorMessage: statusData.errorMessage || null
      };
      this.apiStatuses.set(id, newStatus);
      return newStatus;
    }
  }

  async getAlertSummary(): Promise<{
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  }> {
    const activeDisasters = Array.from(this.disasters.values()).filter(d => d.isActive);
    
    const summary = {
      critical: activeDisasters.filter(d => d.severity === "critical").length,
      high: activeDisasters.filter(d => d.severity === "high").length,
      medium: activeDisasters.filter(d => d.severity === "medium").length,
      low: activeDisasters.filter(d => d.severity === "low").length,
      total: activeDisasters.length,
    };
    
    return summary;
  }
}

export const storage = new MemStorage();
