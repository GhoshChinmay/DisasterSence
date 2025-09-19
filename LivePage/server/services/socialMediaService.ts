import axios from 'axios';
import { type InsertSocialMediaReport } from '@shared/schema';

export class SocialMediaService {
  private twitterApiKey = process.env.TWITTER_API_KEY || process.env.X_API_KEY || '';
  private twitterApiSecret = process.env.TWITTER_API_SECRET || process.env.X_API_SECRET || '';
  private twitterBearerToken = process.env.TWITTER_BEARER_TOKEN || process.env.X_BEARER_TOKEN || '';

  async fetchTwitterReports(keywords: string[] = ['disaster', 'emergency', 'flood', 'earthquake', 'fire']): Promise<InsertSocialMediaReport[]> {
    if (!this.twitterBearerToken) {
      console.warn('Twitter Bearer Token not provided, skipping social media fetch');
      return [];
    }

    try {
      const query = keywords.map(keyword => `${keyword} india`).join(' OR ');
      const response = await axios.get('https://api.twitter.com/2/tweets/search/recent', {
        headers: {
          'Authorization': `Bearer ${this.twitterBearerToken}`,
          'User-Agent': 'DisasterManagement-India/1.0'
        },
        params: {
          query,
          max_results: 50,
          'tweet.fields': 'created_at,author_id,public_metrics,geo,context_annotations',
          'user.fields': 'username,name,verified',
          'expansions': 'author_id,geo.place_id',
          'place.fields': 'full_name,country,place_type,geo'
        },
        timeout: 10000
      });

      return this.parseTwitterResponse(response.data);
    } catch (error) {
      console.error('Error fetching Twitter reports:', error);
      return [];
    }
  }

  private parseTwitterResponse(data: any): InsertSocialMediaReport[] {
    if (!data?.data) return [];

    const users = new Map();
    if (data.includes?.users) {
      data.includes.users.forEach((user: any) => {
        users.set(user.id, user);
      });
    }

    const places = new Map();
    if (data.includes?.places) {
      data.includes.places.forEach((place: any) => {
        places.set(place.id, place);
      });
    }

    return data.data.map((tweet: any) => {
      const author = users.get(tweet.author_id);
      const place = tweet.geo?.place_id ? places.get(tweet.geo.place_id) : null;
      
      return {
        platform: 'twitter',
        postId: tweet.id,
        authorUsername: author?.username || `user_${tweet.author_id}`,
        content: tweet.text,
        location: place?.full_name || this.extractLocationFromText(tweet.text),
        latitude: place?.geo?.bbox ? this.calculateCenterLat(place.geo.bbox) : null,
        longitude: place?.geo?.bbox ? this.calculateCenterLon(place.geo.bbox) : null,
        mediaUrls: [],
        hashtags: this.extractHashtags(tweet.text),
        engagementMetrics: {
          retweets: tweet.public_metrics?.retweet_count || 0,
          likes: tweet.public_metrics?.like_count || 0,
          replies: tweet.public_metrics?.reply_count || 0
        },
        isVerified: author?.verified || false,
        verificationStatus: 'pending',
        relatedDisasterId: null,
        reportedAt: new Date(tweet.created_at)
      };
    });
  }

  private extractLocationFromText(text: string): string | null {
    // Simple regex to extract Indian city/state names
    const locationRegex = /(Mumbai|Delhi|Bangalore|Hyderabad|Chennai|Kolkata|Pune|Ahmedabad|Jaipur|Lucknow|Kanpur|Nagpur|Indore|Bhopal|Visakhapatnam|Pimpri|Patna|Vadodara|Ghaziabad|Ludhiana|Agra|Nashik|Faridabad|Meerut|Rajkot|Kalyan|Vasai|Varanasi|Srinagar|Aurangabad|Dhanbad|Amritsar|Navi Mumbai|Allahabad|Ranchi|Howrah|Coimbatore|Jabalpur|Gwalior|Vijayawada|Jodhpur|Madurai|Raipur|Kota|Chandigarh|Guwahati|Solapur|Hubli|Bareilly|Moradabad|Mysore|Gurgaon|Aligarh|Jalandhar|Tiruchirappalli|Bhubaneswar|Salem|Mira-Bhayandar|Thiruvananthapuram|Bhiwandi|Saharanpur|Gorakhpur|Guntur|Bikaner|Amravati|Noida|Jamshedpur|Bhilai|Cuttack|Firozabad|Kochi|Dehradun|Durgapur|Rishikesh|Haridwar|Maharashtra|Kerala|Tamil Nadu|Karnataka|Andhra Pradesh|Telangana|Gujarat|Rajasthan|Punjab|Haryana|Uttar Pradesh|West Bengal|Odisha|Bihar|Jharkhand|Assam|Himachal Pradesh|Uttarakhand|Goa|Manipur|Tripura|Meghalaya|Mizoram|Nagaland|Arunachal Pradesh|Sikkim|Jammu and Kashmir|Ladakh)/gi;
    const matches = text.match(locationRegex);
    return matches ? matches[0] : null;
  }

  private extractHashtags(text: string): string[] {
    const hashtagRegex = /#(\w+)/g;
    const hashtags: string[] = [];
    let match;
    
    while ((match = hashtagRegex.exec(text)) !== null) {
      hashtags.push(match[1]);
    }
    
    return hashtags;
  }

  private calculateCenterLat(bbox: number[]): string {
    return ((bbox[1] + bbox[3]) / 2).toString();
  }

  private calculateCenterLon(bbox: number[]): string {
    return ((bbox[0] + bbox[2]) / 2).toString();
  }
}

export const socialMediaService = new SocialMediaService();
