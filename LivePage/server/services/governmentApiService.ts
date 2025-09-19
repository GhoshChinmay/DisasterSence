import axios from 'axios';
import Parser from 'rss-parser';
import { type InsertDisaster } from '@shared/schema';

export class GovernmentApiService {
  private indianApiKey = process.env.INDIAN_API_KEY || '';
  private indianApiBaseUrl = 'https://weather.indianapi.in';
  private sachetBaseUrl = 'https://sachet.ndma.gov.in';
  private rssParser = new Parser();
  
  async fetchNDMAAlerts(): Promise<InsertDisaster[]> {
    try {
      // Try to fetch from SACHET RSS feeds
      const rssUrls = [
        'https://sachet.ndma.gov.in/feeds/alerts.rss',
        'https://sachet.ndma.gov.in/rss/alerts.xml',
        'https://ndma.gov.in/feeds/alerts.rss'
      ];
      
      for (const rssUrl of rssUrls) {
        try {
          const feed = await this.rssParser.parseURL(rssUrl);
          if (feed.items.length > 0) {
            return this.parseRSSFeed(feed, 'NDMA');
          }
        } catch (error) {
          console.log(`RSS URL ${rssUrl} not available:`, error instanceof Error ? error.message : 'Unknown error');
        }
      }
      
      // Fallback: Try to scrape recent earthquake data from SACHET
      return await this.fetchSachetEarthquakeData();
    } catch (error) {
      console.error('Error fetching NDMA alerts:', error);
      return [];
    }
  }

  async fetchIMDWeatherAlerts(): Promise<InsertDisaster[]> {
    try {
      if (!this.indianApiKey) {
        console.warn('IndianAPI key not provided, skipping weather alerts');
        return [];
      }
      
      // Fetch weather alerts for major Indian cities
      const majorCities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];
      const alerts: InsertDisaster[] = [];
      
      for (const city of majorCities) {
        try {
          const response = await axios.get(`${this.indianApiBaseUrl}/india/weather`, {
            params: { city },
            headers: {
              'x-api-key': this.indianApiKey,
              'User-Agent': 'DisasterManagement-India/1.0'
            },
            timeout: 10000
          });
          
          const weatherAlerts = this.parseIndianApiWeather(response.data, city);
          alerts.push(...weatherAlerts);
        } catch (error) {
          console.log(`Failed to fetch weather for ${city}:`, error instanceof Error ? error.message : 'Unknown error');
        }
      }
      
      return alerts;
    } catch (error) {
      console.error('Error fetching IMD alerts:', error);
      return [];
    }
  }

  private parseNDMAResponse(data: any): InsertDisaster[] {
    if (!Array.isArray(data?.alerts)) return [];
    
    return data.alerts.map((alert: any) => ({
      title: alert.title || 'NDMA Alert',
      description: alert.description || '',
      type: this.mapNDMAType(alert.type),
      severity: this.mapNDMASeverity(alert.severity),
      state: alert.state || '',
      district: alert.district,
      latitude: alert.coordinates?.latitude ? alert.coordinates.latitude.toString() : null,
      longitude: alert.coordinates?.longitude ? alert.coordinates.longitude.toString() : null,
      source: 'NDMA',
      sourceUrl: alert.url,
      affectedPopulation: alert.affectedPopulation,
      isVerified: true,
      metadata: {
        alertCode: alert.code,
        priority: alert.priority,
        instructions: alert.instructions
      },
      reportedAt: new Date(alert.issuedAt || Date.now()),
      isActive: alert.status === 'active'
    }));
  }

  private parseIMDResponse(data: any): InsertDisaster[] {
    if (!Array.isArray(data?.warnings)) return [];
    
    return data.warnings.map((warning: any) => ({
      title: warning.headline || 'Weather Warning',
      description: warning.description || '',
      type: this.mapIMDType(warning.event),
      severity: this.mapIMDSeverity(warning.severity),
      state: warning.areas?.[0]?.state || '',
      district: warning.areas?.[0]?.district,
      latitude: warning.coordinates?.lat ? warning.coordinates.lat.toString() : null,
      longitude: warning.coordinates?.lon ? warning.coordinates.lon.toString() : null,
      source: 'IMD',
      sourceUrl: warning.web || null,
      affectedPopulation: null,
      isVerified: true,
      metadata: {
        windSpeed: warning.windSpeed,
        rainfall: warning.rainfall,
        temperature: warning.temperature,
        event: warning.event
      },
      reportedAt: new Date(warning.effective || Date.now()),
      isActive: warning.status === 'Actual'
    }));
  }

  private mapNDMAType(type: string): string {
    const typeMap: Record<string, string> = {
      'flood': 'flood',
      'earthquake': 'earthquake',
      'cyclone': 'cyclone',
      'landslide': 'landslide',
      'fire': 'fire',
      'drought': 'drought',
      'tsunami': 'tsunami'
    };
    return typeMap[type?.toLowerCase()] || 'other';
  }

  private mapIMDType(event: string): string {
    const eventMap: Record<string, string> = {
      'flood': 'flood',
      'heavy_rain': 'flood',
      'cyclone': 'cyclone',
      'thunderstorm': 'thunderstorm',
      'heatwave': 'heatwave',
      'cold_wave': 'coldwave'
    };
    return eventMap[event?.toLowerCase().replace(' ', '_')] || 'weather';
  }

  private mapNDMASeverity(severity: string): string {
    const severityMap: Record<string, string> = {
      'extreme': 'critical',
      'severe': 'high',
      'moderate': 'medium',
      'minor': 'low'
    };
    return severityMap[severity?.toLowerCase()] || 'medium';
  }

  private mapIMDSeverity(severity: string): string {
    const severityMap: Record<string, string> = {
      'red': 'critical',
      'orange': 'high',
      'yellow': 'medium',
      'green': 'low'
    };
    return severityMap[severity?.toLowerCase()] || 'medium';
  }

  private async fetchSachetEarthquakeData(): Promise<InsertDisaster[]> {
    try {
      const response = await axios.get(this.sachetBaseUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'DisasterManagement-India/1.0'
        }
      });
      
      // Parse earthquake data from SACHET portal HTML
      const earthquakes: InsertDisaster[] = [];
      const earthquakeRegex = /\*\*\*\s*\*\*(\d+\.\d+)\s+Magnitude\*\*\s*\|\s*([^|]+)\s*\|\s*([^*]+)\*\*\*/g;
      
      let match;
      while ((match = earthquakeRegex.exec(response.data)) !== null) {
        const magnitude = parseFloat(match[1]);
        const location = match[2].trim();
        const timeStr = match[3].trim();
        
        // Only include significant earthquakes (magnitude >= 3.5)
        if (magnitude >= 3.5) {
          earthquakes.push({
            title: `Earthquake - Magnitude ${magnitude} - ${location}`,
            description: `Earthquake of magnitude ${magnitude} reported in ${location} region.`,
            type: 'earthquake',
            severity: magnitude >= 6 ? 'critical' : magnitude >= 5 ? 'high' : 'medium',
            state: this.extractStateFromLocation(location),
            district: null,
            latitude: null,
            longitude: null,
            source: 'NDMA/SACHET',
            sourceUrl: this.sachetBaseUrl,
            affectedPopulation: null,
            isVerified: true,
            metadata: {
              magnitude: magnitude.toString(),
              time: timeStr,
              region: location
            },
            reportedAt: new Date(),
            isActive: true
          });
        }
      }
      
      return earthquakes.slice(0, 5); // Limit to 5 most recent
    } catch (error) {
      console.error('Error fetching SACHET earthquake data:', error);
      return [];
    }
  }

  private parseRSSFeed(feed: any, source: string): InsertDisaster[] {
    const disasters: InsertDisaster[] = [];
    
    for (const item of feed.items) {
      try {
        const disaster: InsertDisaster = {
          title: item.title || 'Government Alert',
          description: item.contentSnippet || item.content || '',
          type: this.extractDisasterTypeFromText(item.title || ''),
          severity: this.extractSeverityFromText(item.title || ''),
          state: this.extractStateFromText(item.title || ''),
          district: null,
          latitude: null,
          longitude: null,
          source: source,
          sourceUrl: item.link,
          affectedPopulation: null,
          isVerified: true,
          metadata: {
            guid: item.guid,
            pubDate: item.pubDate
          },
          reportedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          isActive: true
        };
        
        disasters.push(disaster);
      } catch (error) {
        console.error('Error parsing RSS item:', error);
      }
    }
    
    return disasters;
  }

  private parseIndianApiWeather(data: any, city: string): InsertDisaster[] {
    const alerts: InsertDisaster[] = [];
    
    try {
      if (!data?.weather?.current) return alerts;
      
      const weather = data.weather.current;
      const temp = weather.temperature;
      
      // Generate weather-based alerts
      if (temp?.max?.value >= 45) {
        alerts.push({
          title: `Extreme Heat Warning - ${city}`,
          description: `Severe heat wave conditions with maximum temperature of ${temp.max.value}°C recorded in ${city}.`,
          type: 'heatwave',
          severity: temp.max.value >= 48 ? 'critical' : 'high',
          state: this.getCityState(city),
          district: city,
          latitude: null,
          longitude: null,
          source: 'IMD via IndianAPI',
          sourceUrl: null,
          affectedPopulation: this.getCityPopulation(city),
          isVerified: true,
          metadata: {
            maxTemp: temp.max.value,
            minTemp: temp.min?.value,
            humidity: weather.humidity
          },
          reportedAt: new Date(),
          isActive: true
        });
      }
      
      if (weather.humidity?.evening >= 90 && temp?.max?.value >= 35) {
        alerts.push({
          title: `High Humidity Alert - ${city}`,
          description: `Very high humidity (${weather.humidity.evening}%) combined with high temperature may cause discomfort in ${city}.`,
          type: 'weather',
          severity: 'medium',
          state: this.getCityState(city),
          district: city,
          latitude: null,
          longitude: null,
          source: 'IMD via IndianAPI',
          sourceUrl: null,
          affectedPopulation: null,
          isVerified: true,
          metadata: {
            humidity: weather.humidity.evening,
            temperature: temp.max.value
          },
          reportedAt: new Date(),
          isActive: true
        });
      }
    } catch (error) {
      console.error(`Error parsing weather data for ${city}:`, error);
    }
    
    return alerts;
  }

  private extractDisasterTypeFromText(text: string): string {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('earthquake') || lowerText.includes('tremor')) return 'earthquake';
    if (lowerText.includes('flood') || lowerText.includes('inundation')) return 'flood';
    if (lowerText.includes('cyclone') || lowerText.includes('hurricane')) return 'cyclone';
    if (lowerText.includes('fire') || lowerText.includes('wildfire')) return 'fire';
    if (lowerText.includes('landslide') || lowerText.includes('mudslide')) return 'landslide';
    if (lowerText.includes('heatwave') || lowerText.includes('heat wave')) return 'heatwave';
    if (lowerText.includes('thunderstorm') || lowerText.includes('lightning')) return 'thunderstorm';
    return 'other';
  }

  private extractSeverityFromText(text: string): string {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('severe') || lowerText.includes('critical') || lowerText.includes('extreme')) return 'critical';
    if (lowerText.includes('high') || lowerText.includes('major') || lowerText.includes('significant')) return 'high';
    if (lowerText.includes('moderate') || lowerText.includes('medium')) return 'medium';
    if (lowerText.includes('low') || lowerText.includes('minor')) return 'low';
    return 'medium';
  }

  private extractStateFromText(text: string): string {
    const states = [
      'Maharashtra', 'Kerala', 'Tamil Nadu', 'Karnataka', 'Andhra Pradesh', 'Telangana',
      'Gujarat', 'Rajasthan', 'Punjab', 'Haryana', 'Uttar Pradesh', 'West Bengal',
      'Odisha', 'Bihar', 'Jharkhand', 'Assam', 'Himachal Pradesh', 'Uttarakhand',
      'Madhya Pradesh', 'Chhattisgarh', 'Goa', 'Manipur', 'Tripura', 'Meghalaya',
      'Mizoram', 'Nagaland', 'Arunachal Pradesh', 'Sikkim', 'Delhi'
    ];
    
    for (const state of states) {
      if (text.includes(state)) return state;
    }
    
    return 'Unknown';
  }

  private extractStateFromLocation(location: string): string {
    // Map some common location references to states
    const locationMap: Record<string, string> = {
      'Mumbai': 'Maharashtra',
      'Delhi': 'Delhi',
      'Bangalore': 'Karnataka',
      'Chennai': 'Tamil Nadu',
      'Kolkata': 'West Bengal',
      'Hyderabad': 'Telangana',
      'Pune': 'Maharashtra',
      'Ahmedabad': 'Gujarat',
      'Shimla': 'Himachal Pradesh',
      'Nainital': 'Uttarakhand',
      'Bhadrak': 'Odisha',
      'Balasore': 'Odisha',
      'Manipur': 'Manipur',
      'Madhya Pradesh': 'Madhya Pradesh',
      'Tibet': 'International',
      'Myanmar': 'International',
      'Afghanistan': 'International',
      'Tajikistan': 'International',
      'Sumatra': 'International',
      'China': 'International'
    };
    
    for (const [key, state] of Object.entries(locationMap)) {
      if (location.includes(key)) return state;
    }
    
    return this.extractStateFromText(location);
  }

  private getCityState(city: string): string {
    const cityStateMap: Record<string, string> = {
      'Mumbai': 'Maharashtra',
      'Delhi': 'Delhi',
      'Bangalore': 'Karnataka',
      'Chennai': 'Tamil Nadu',
      'Kolkata': 'West Bengal',
      'Hyderabad': 'Telangana',
      'Pune': 'Maharashtra',
      'Ahmedabad': 'Gujarat'
    };
    
    return cityStateMap[city] || 'Unknown';
  }

  private getCityPopulation(city: string): number | null {
    const cityPopulationMap: Record<string, number> = {
      'Mumbai': 12500000,
      'Delhi': 11000000,
      'Bangalore': 8500000,
      'Chennai': 7000000,
      'Kolkata': 4500000,
      'Hyderabad': 7000000,
      'Pune': 3100000,
      'Ahmedabad': 5500000
    };
    
    return cityPopulationMap[city] || null;
  }
}

export const governmentApiService = new GovernmentApiService();
