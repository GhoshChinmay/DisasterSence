import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const disasters = pgTable("disasters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // earthquake, flood, cyclone, fire, landslide, etc.
  severity: text("severity").notNull(), // critical, high, medium, low, info
  state: text("state").notNull(),
  district: text("district"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  source: text("source").notNull(), // NDMA, IMD, Social Media, etc.
  sourceUrl: text("source_url"),
  affectedPopulation: integer("affected_population"),
  isVerified: boolean("is_verified").notNull().default(false),
  metadata: jsonb("metadata"), // additional data like wind speed, rainfall, etc.
  reportedAt: timestamp("reported_at").notNull(),
  lastUpdated: timestamp("last_updated").notNull().default(sql`now()`),
  isActive: boolean("is_active").notNull().default(true),
});

export const socialMediaReports = pgTable("social_media_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  platform: text("platform").notNull(), // twitter, instagram, facebook
  postId: text("post_id").notNull(),
  authorUsername: text("author_username").notNull(),
  content: text("content").notNull(),
  location: text("location"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  mediaUrls: text("media_urls").array(),
  hashtags: text("hashtags").array(),
  engagementMetrics: jsonb("engagement_metrics"), // likes, retweets, etc.
  isVerified: boolean("is_verified").notNull().default(false),
  verificationStatus: text("verification_status").default("pending"), // pending, verified, flagged, dismissed
  relatedDisasterId: varchar("related_disaster_id").references(() => disasters.id),
  reportedAt: timestamp("reported_at").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const apiStatus = pgTable("api_status", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serviceName: text("service_name").notNull(),
  status: text("status").notNull(), // online, offline, delayed, error
  lastSuccessfulSync: timestamp("last_successful_sync"),
  responseTime: integer("response_time"), // in milliseconds
  errorMessage: text("error_message"),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDisasterSchema = createInsertSchema(disasters).omit({
  id: true,
  lastUpdated: true,
});

export const insertSocialMediaReportSchema = createInsertSchema(socialMediaReports).omit({
  id: true,
  createdAt: true,
});

export const insertApiStatusSchema = createInsertSchema(apiStatus).omit({
  id: true,
  updatedAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Disaster = typeof disasters.$inferSelect;
export type InsertDisaster = z.infer<typeof insertDisasterSchema>;

export type SocialMediaReport = typeof socialMediaReports.$inferSelect;
export type InsertSocialMediaReport = z.infer<typeof insertSocialMediaReportSchema>;

export type ApiStatus = typeof apiStatus.$inferSelect;
export type InsertApiStatus = z.infer<typeof insertApiStatusSchema>;
