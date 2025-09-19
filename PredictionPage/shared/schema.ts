import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Cyclone Data Table
export const cyclones = pgTable("cyclones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  uei: text("uei").notNull(),
  cycloneName: text("cyclone_name"),
  eventDate: text("event_date").notNull(),
  cycloneCategory: text("cyclone_category"),
  maxWindSpeed: decimal("max_wind_speed", { precision: 10, scale: 2 }),
  minCentralPressure: decimal("min_central_pressure", { precision: 10, scale: 2 }),
  durationDays: integer("duration_days"),
  latitudeLandfall: decimal("latitude_landfall", { precision: 10, scale: 6 }),
  longitudeLandfall: decimal("longitude_landfall", { precision: 10, scale: 6 }),
  coastalState: text("coastal_state"),
  affectedDistricts: text("affected_districts"),
  stormSurgeHeight: decimal("storm_surge_height", { precision: 10, scale: 2 }),
  areaAffected: decimal("area_affected_sq_km", { precision: 15, scale: 2 }),
  populationAffected: integer("population_affected"),
  humanFatalities: integer("human_fatalities"),
  humanInjuries: integer("human_injuries"),
  humanDisplaced: integer("human_displaced"),
  economicLoss: decimal("economic_loss_usd", { precision: 20, scale: 2 }),
  severityLevel: text("severity_level"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow()
});

// Earthquake Data Table
export const earthquakes = pgTable("earthquakes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  uei: text("uei").notNull(),
  eventDate: text("event_date").notNull(),
  magnitudeMw: decimal("magnitude_mw", { precision: 10, scale: 2 }),
  depthKm: decimal("depth_km", { precision: 10, scale: 2 }),
  latitude: decimal("latitude", { precision: 10, scale: 6 }),
  longitude: decimal("longitude", { precision: 10, scale: 6 }),
  epicenterLocation: text("epicenter_location"),
  affectedState: text("affected_state"),
  seismicIntensityMmi: decimal("seismic_intensity_mmi", { precision: 10, scale: 2 }),
  areaAffected: decimal("area_affected_sq_km", { precision: 15, scale: 2 }),
  populationAffected: integer("population_affected"),
  humanFatalities: integer("human_fatalities"),
  humanInjuries: integer("human_injuries"),
  humanDisplaced: integer("human_displaced"),
  economicLoss: decimal("economic_loss_usd", { precision: 20, scale: 2 }),
  severityLevel: text("severity_level"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow()
});

// Flood Data Table
export const floods = pgTable("floods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  durationDays: integer("duration_days"),
  state: text("state"),
  city: text("city"),
  latitude: decimal("latitude", { precision: 10, scale: 6 }),
  longitude: decimal("longitude", { precision: 10, scale: 6 }),
  rainfallMm: decimal("rainfall_mm", { precision: 10, scale: 2 }),
  riverLevelM: decimal("river_level_m", { precision: 10, scale: 2 }),
  areaAffected: decimal("area_affected_sq_km", { precision: 15, scale: 2 }),
  severity: text("severity"),
  humanFatalities: integer("human_fatalities"),
  humanInjured: integer("human_injured"),
  humanDisplaced: integer("human_displaced"),
  animalFatalities: integer("animal_fatalities"),
  infrastructureDamageCost: decimal("infrastructure_damage_cost_inr", { precision: 20, scale: 2 }),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow()
});

// Risk Assessment Table (for predictions)
export const riskAssessments = pgTable("risk_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  state: text("state").notNull(),
  city: text("city"),
  latitude: decimal("latitude", { precision: 10, scale: 6 }),
  longitude: decimal("longitude", { precision: 10, scale: 6 }),
  disasterType: text("disaster_type").notNull(), // cyclone, flood, earthquake, landslide
  riskLevel: text("risk_level").notNull(), // Low, Medium, High, Extreme
  probability: decimal("probability", { precision: 5, scale: 2 }), // 0-100%
  assessmentDate: text("assessment_date").notNull(),
  validUntil: text("valid_until"),
  affectedPopulation: integer("affected_population"),
  confidence: decimal("confidence", { precision: 5, scale: 2 }), // AI confidence 0-100%
  predictedSeverity: text("predicted_severity"),
  warningLevel: text("warning_level"), // advisory, watch, warning
  createdAt: timestamp("created_at").defaultNow()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Create insert schemas
export const insertCycloneSchema = createInsertSchema(cyclones).omit({
  id: true,
  createdAt: true
});

export const insertEarthquakeSchema = createInsertSchema(earthquakes).omit({
  id: true,
  createdAt: true
});

export const insertFloodSchema = createInsertSchema(floods).omit({
  id: true,
  createdAt: true
});

export const insertRiskAssessmentSchema = createInsertSchema(riskAssessments).omit({
  id: true,
  createdAt: true
});

// Create type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCyclone = z.infer<typeof insertCycloneSchema>;
export type InsertEarthquake = z.infer<typeof insertEarthquakeSchema>;
export type InsertFlood = z.infer<typeof insertFloodSchema>;
export type InsertRiskAssessment = z.infer<typeof insertRiskAssessmentSchema>;

export type Cyclone = typeof cyclones.$inferSelect;
export type Earthquake = typeof earthquakes.$inferSelect;
export type Flood = typeof floods.$inferSelect;
export type RiskAssessment = typeof riskAssessments.$inferSelect;

// Risk level enum for frontend
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Extreme';

// Disaster types
export type DisasterType = 'cyclone' | 'flood' | 'earthquake' | 'landslide';

// Prediction response type
export interface PredictionResponse {
  success: boolean;
  data: {
    location: string;
    predictions: Array<{
      date: string;
      day: string;
      cyclone: RiskLevel;
      flood: RiskLevel;
      earthquake: RiskLevel;
      landslide: RiskLevel;
      confidence: number;
    }>;
  };
}

// Analytics data types  
export interface AnalyticsData {
  totalAlerts: number;
  highRiskAreas: number;
  populationAtRisk: number;
  accuracy: number;
  trends: Array<{
    region: string;
    trend: string;
    riskType: string;
  }>;
}
