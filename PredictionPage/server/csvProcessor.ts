import { promises as fs } from 'fs';
import { parse } from 'csv-parse';
import { storage } from './storage';
import { 
  type InsertCyclone, 
  type InsertEarthquake, 
  type InsertFlood,
  type InsertRiskAssessment 
} from '@shared/schema';

interface CycloneCSVRow {
  UEI: string;
  'Cyclone Name': string;
  'Event Date': string;
  'Cyclone Category': string;
  'Maximum Sustained Wind Speed (km/h)': string;
  'Minimum Central Pressure (hPa)': string;
  'Duration (Days)': string;
  'Latitude at Landfall': string;
  'Longitude at Landfall': string;
  'Coastal State Impacted': string;
  'Affected Districts': string;
  'Storm Surge Height (m)': string;
  'Area Affected (sq km)': string;
  'Population Affected': string;
  'Human Fatalities': string;
  'Human Injuries': string;
  'Human Displaced': string;
  'Economic Loss (USD)': string;
  'Severity Level': string;
  'Description/Notes': string;
}

interface EarthquakeCSVRow {
  UEI: string;
  Event_Date: string;
  Magnitude_Mw: string;
  Depth_km: string;
  Latitude: string;
  Longitude: string;
  Epicenter_Location: string;
  Affected_State: string;
  Seismic_Intensity_MMI: string;
  Area_Affected_sq_km: string;
  Population_Affected: string;
  Human_Fatalities: string;
  Human_Injuries: string;
  Human_Displaced: string;
  Economic_Loss_USD: string;
  Severity_Level: string;
  Description_Notes: string;
}

interface FloodCSVRow {
  start_date: string;
  end_date: string;
  duration_days: string;
  state: string;
  city: string;
  latitude: string;
  longitude: string;
  rainfall_mm: string;
  river_level_m: string;
  area_affected_sq_km: string;
  severity: string;
  human_fatalities: string;
  human_injured: string;
  human_displaced: string;
  animal_fatalities: string;
  infrastructure_damage_cost_inr: string;
  description: string;
}

export class CSVProcessor {
  async processCycloneCSV(filePath: string): Promise<number> {
    console.log(`Processing cyclone CSV: ${filePath}`);
    
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const records: CycloneCSVRow[] = [];
    
    return new Promise((resolve, reject) => {
      parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      }, async (err, data: CycloneCSVRow[]) => {
        if (err) {
          reject(err);
          return;
        }
        
        let processed = 0;
        
        for (const row of data) {
          if (!row.UEI) continue; // Skip empty rows
          
          try {
            const cyclone: InsertCyclone = {
              uei: row.UEI,
              cycloneName: row['Cyclone Name'] || null,
              eventDate: row['Event Date'],
              cycloneCategory: row['Cyclone Category'] || null,
              maxWindSpeed: row['Maximum Sustained Wind Speed (km/h)'] || null,
              minCentralPressure: row['Minimum Central Pressure (hPa)'] || null,
              durationDays: row['Duration (Days)'] ? parseInt(row['Duration (Days)']) : null,
              latitudeLandfall: row['Latitude at Landfall'] || null,
              longitudeLandfall: row['Longitude at Landfall'] || null,
              coastalState: row['Coastal State Impacted'] || null,
              affectedDistricts: row['Affected Districts'] || null,
              stormSurgeHeight: row['Storm Surge Height (m)'] || null,
              areaAffected: row['Area Affected (sq km)'] || null,
              populationAffected: row['Population Affected'] ? parseInt(row['Population Affected']) : null,
              humanFatalities: row['Human Fatalities'] ? parseInt(row['Human Fatalities']) : null,
              humanInjuries: row['Human Injuries'] ? parseInt(row['Human Injuries']) : null,
              humanDisplaced: row['Human Displaced'] ? parseInt(row['Human Displaced']) : null,
              economicLoss: row['Economic Loss (USD)'] || null,
              severityLevel: row['Severity Level'] || null,
              description: row['Description/Notes'] || null
            };
            
            await storage.createCyclone(cyclone);
            processed++;
          } catch (error) {
            console.error(`Error processing cyclone row ${row.UEI}:`, error);
          }
        }
        
        console.log(`Processed ${processed} cyclone records`);
        resolve(processed);
      });
    });
  }

  async processEarthquakeCSV(filePath: string): Promise<number> {
    console.log(`Processing earthquake CSV: ${filePath}`);
    
    const fileContent = await fs.readFile(filePath, 'utf-8');
    
    return new Promise((resolve, reject) => {
      parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      }, async (err, data: EarthquakeCSVRow[]) => {
        if (err) {
          reject(err);
          return;
        }
        
        let processed = 0;
        
        for (const row of data) {
          if (!row.UEI) continue; // Skip empty rows
          
          try {
            const earthquake: InsertEarthquake = {
              uei: row.UEI,
              eventDate: row.Event_Date,
              magnitudeMw: row.Magnitude_Mw || null,
              depthKm: row.Depth_km || null,
              latitude: row.Latitude || null,
              longitude: row.Longitude || null,
              epicenterLocation: row.Epicenter_Location || null,
              affectedState: row.Affected_State || null,
              seismicIntensityMmi: row.Seismic_Intensity_MMI || null,
              areaAffected: row.Area_Affected_sq_km || null,
              populationAffected: row.Population_Affected ? parseInt(row.Population_Affected) : null,
              humanFatalities: row.Human_Fatalities ? parseInt(row.Human_Fatalities) : null,
              humanInjuries: row.Human_Injuries ? parseInt(row.Human_Injuries) : null,
              humanDisplaced: row.Human_Displaced ? parseInt(row.Human_Displaced) : null,
              economicLoss: row.Economic_Loss_USD || null,
              severityLevel: row.Severity_Level || null,
              description: row.Description_Notes || null
            };
            
            await storage.createEarthquake(earthquake);
            processed++;
          } catch (error) {
            console.error(`Error processing earthquake row ${row.UEI}:`, error);
          }
        }
        
        console.log(`Processed ${processed} earthquake records`);
        resolve(processed);
      });
    });
  }

  async processFloodCSV(filePath: string): Promise<number> {
    console.log(`Processing flood CSV: ${filePath}`);
    
    const fileContent = await fs.readFile(filePath, 'utf-8');
    
    return new Promise((resolve, reject) => {
      parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      }, async (err, data: FloodCSVRow[]) => {
        if (err) {
          reject(err);
          return;
        }
        
        let processed = 0;
        
        for (const row of data) {
          if (!row.start_date) continue; // Skip empty rows
          
          try {
            const flood: InsertFlood = {
              startDate: row.start_date,
              endDate: row.end_date || null,
              durationDays: row.duration_days ? parseInt(row.duration_days) : null,
              state: row.state || null,
              city: row.city || null,
              latitude: row.latitude || null,
              longitude: row.longitude || null,
              rainfallMm: row.rainfall_mm || null,
              riverLevelM: row.river_level_m || null,
              areaAffected: row.area_affected_sq_km || null,
              severity: row.severity || null,
              humanFatalities: row.human_fatalities ? parseInt(row.human_fatalities) : null,
              humanInjured: row.human_injured ? parseInt(row.human_injured) : null,
              humanDisplaced: row.human_displaced ? parseInt(row.human_displaced) : null,
              animalFatalities: row.animal_fatalities ? parseInt(row.animal_fatalities) : null,
              infrastructureDamageCost: row.infrastructure_damage_cost_inr || null,
              description: row.description || null
            };
            
            await storage.createFlood(flood);
            processed++;
          } catch (error) {
            console.error(`Error processing flood row:`, error);
          }
        }
        
        console.log(`Processed ${processed} flood records`);
        resolve(processed);
      });
    });
  }

  async processAllCSVFiles(): Promise<{cyclones: number, earthquakes: number, floods: number}> {
    console.log('Starting CSV processing...');
    
    const results = {
      cyclones: 0,
      earthquakes: 0,
      floods: 0
    };

    try {
      // Process cyclone data
      results.cyclones = await this.processCycloneCSV('attached_assets/CycloneDataset_1758265284469.csv');
    } catch (error) {
      console.error('Error processing cyclone CSV:', error);
    }

    try {
      // Process earthquake data
      results.earthquakes = await this.processEarthquakeCSV('attached_assets/EarthquakeDataset_1758265284480.csv');
    } catch (error) {
      console.error('Error processing earthquake CSV:', error);
    }

    try {
      // Process flood data
      results.floods = await this.processFloodCSV('attached_assets/FloodDataset_1758265292414.csv');
    } catch (error) {
      console.error('Error processing flood CSV:', error);
    }

    console.log('CSV processing complete:', results);
    return results;
  }
}

export const csvProcessor = new CSVProcessor();