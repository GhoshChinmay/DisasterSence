import { 
  type User, 
  type InsertUser,
  type Cyclone,
  type InsertCyclone,
  type Earthquake,
  type InsertEarthquake,
  type Flood,
  type InsertFlood,
  type RiskAssessment,
  type InsertRiskAssessment,
  type RiskLevel,
  type DisasterType,
  type PredictionResponse,
  type AnalyticsData
} from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Disaster data methods
  createCyclone(cyclone: InsertCyclone): Promise<Cyclone>;
  createEarthquake(earthquake: InsertEarthquake): Promise<Earthquake>;
  createFlood(flood: InsertFlood): Promise<Flood>;
  createRiskAssessment(assessment: InsertRiskAssessment): Promise<RiskAssessment>;
  
  // Data retrieval methods
  getCyclonesByState(state: string, limit?: number): Promise<Cyclone[]>;
  getEarthquakesByState(state: string, limit?: number): Promise<Earthquake[]>;
  getFloodsByState(state: string, limit?: number): Promise<Flood[]>;
  getCurrentRiskAssessments(state?: string): Promise<RiskAssessment[]>;
  getLatestDisasters(limit?: number): Promise<{
    cyclones: Cyclone[];
    earthquakes: Earthquake[];
    floods: Flood[];
  }>;
  
  // Analytics methods
  getAnalyticsData(): Promise<AnalyticsData>;
  getDisasterStatsByState(state: string): Promise<{
    cyclones: number;
    earthquakes: number;  
    floods: number;
    totalAffected: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private cyclones: Map<string, Cyclone>;
  private earthquakes: Map<string, Earthquake>;
  private floods: Map<string, Flood>;
  private riskAssessments: Map<string, RiskAssessment>;

  constructor() {
    this.users = new Map();
    this.cyclones = new Map();
    this.earthquakes = new Map();
    this.floods = new Map();
    this.riskAssessments = new Map();
  }

  // User methods
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

  // Disaster data methods
  async createCyclone(insertCyclone: InsertCyclone): Promise<Cyclone> {
    const id = randomUUID();
    const cyclone: Cyclone = { 
      ...insertCyclone, 
      id, 
      createdAt: new Date() 
    } as Cyclone;
    this.cyclones.set(id, cyclone);
    return cyclone;
  }

  async createEarthquake(insertEarthquake: InsertEarthquake): Promise<Earthquake> {
    const id = randomUUID();
    const earthquake: Earthquake = { 
      ...insertEarthquake, 
      id, 
      createdAt: new Date() 
    } as Earthquake;
    this.earthquakes.set(id, earthquake);
    return earthquake;
  }

  async createFlood(insertFlood: InsertFlood): Promise<Flood> {
    const id = randomUUID();
    const flood: Flood = { 
      ...insertFlood, 
      id, 
      createdAt: new Date() 
    } as Flood;
    this.floods.set(id, flood);
    return flood;
  }

  async createRiskAssessment(insertAssessment: InsertRiskAssessment): Promise<RiskAssessment> {
    const id = randomUUID();
    const assessment: RiskAssessment = { 
      ...insertAssessment, 
      id, 
      createdAt: new Date() 
    } as RiskAssessment;
    this.riskAssessments.set(id, assessment);
    return assessment;
  }

  // Data retrieval methods
  async getCyclonesByState(state: string, limit = 50): Promise<Cyclone[]> {
    return Array.from(this.cyclones.values())
      .filter(cyclone => cyclone.coastalState?.toLowerCase().includes(state.toLowerCase()))
      .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())
      .slice(0, limit);
  }

  async getEarthquakesByState(state: string, limit = 50): Promise<Earthquake[]> {
    return Array.from(this.earthquakes.values())
      .filter(earthquake => earthquake.affectedState?.toLowerCase().includes(state.toLowerCase()))
      .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())
      .slice(0, limit);
  }

  async getFloodsByState(state: string, limit = 50): Promise<Flood[]> {
    return Array.from(this.floods.values())
      .filter(flood => flood.state?.toLowerCase().includes(state.toLowerCase()))
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .slice(0, limit);
  }

  async getCurrentRiskAssessments(state?: string): Promise<RiskAssessment[]> {
    let assessments = Array.from(this.riskAssessments.values());
    
    if (state) {
      assessments = assessments.filter(assessment => 
        assessment.state?.toLowerCase().includes(state.toLowerCase())
      );
    }
    
    return assessments
      .filter(assessment => {
        const validUntil = assessment.validUntil ? new Date(assessment.validUntil) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        return validUntil > new Date();
      })
      .sort((a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime());
  }

  async getLatestDisasters(limit = 10): Promise<{
    cyclones: Cyclone[];
    earthquakes: Earthquake[];
    floods: Flood[];
  }> {
    return {
      cyclones: Array.from(this.cyclones.values())
        .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())
        .slice(0, limit),
      earthquakes: Array.from(this.earthquakes.values())
        .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())
        .slice(0, limit),
      floods: Array.from(this.floods.values())
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
        .slice(0, limit)
    };
  }

  // Analytics methods
  async getAnalyticsData(): Promise<AnalyticsData> {
    const cycloneCount = this.cyclones.size;
    const earthquakeCount = this.earthquakes.size;
    const floodCount = this.floods.size;
    
    const highRiskAssessments = Array.from(this.riskAssessments.values())
      .filter(assessment => assessment.riskLevel === 'High' || assessment.riskLevel === 'Extreme');
    
    const totalPopulationAffected = [
      ...Array.from(this.cyclones.values()),
      ...Array.from(this.earthquakes.values()),
      ...Array.from(this.floods.values())
    ].reduce((total, disaster) => {
      const population = 'populationAffected' in disaster ? disaster.populationAffected : 
                       'humanDisplaced' in disaster ? disaster.humanDisplaced : 0;
      return total + (population || 0);
    }, 0);

    return {
      totalAlerts: cycloneCount + earthquakeCount + floodCount,
      highRiskAreas: highRiskAssessments.length,
      populationAtRisk: totalPopulationAffected,
      accuracy: 94.2, // Mock accuracy for now
      trends: [
        { region: 'Eastern Coast', trend: '+15%', riskType: 'Cyclone' },
        { region: 'Northern Plains', trend: '-8%', riskType: 'Flood' },
        { region: 'Western Ghats', trend: '+22%', riskType: 'Landslide' },
        { region: 'Himalayan Belt', trend: '+5%', riskType: 'Earthquake' }
      ]
    };
  }

  async getDisasterStatsByState(state: string): Promise<{
    cyclones: number;
    earthquakes: number;  
    floods: number;
    totalAffected: number;
  }> {
    const cyclones = await this.getCyclonesByState(state);
    const earthquakes = await this.getEarthquakesByState(state);
    const floods = await this.getFloodsByState(state);
    
    const totalAffected = [
      ...cyclones,
      ...earthquakes,
      ...floods
    ].reduce((total, disaster) => {
      const population = 'populationAffected' in disaster ? disaster.populationAffected : 
                       'humanDisplaced' in disaster ? disaster.humanDisplaced : 0;
      return total + (population || 0);
    }, 0);

    return {
      cyclones: cyclones.length,
      earthquakes: earthquakes.length,
      floods: floods.length,
      totalAffected
    };
  }
}

export const storage = new MemStorage();
