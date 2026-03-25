export interface Bill {
  congress: number;
  type: string;
  number: string;
  title: string;
  introducedDate: string;
  latestAction: {
    actionDate: string;
    text: string;
  };
  sponsors: Array<{
    bioguideId: string;
    firstName: string;
    lastName: string;
    party: string;
    state: string;
  }>;
  subjects: string[];
  summary?: string;
  committees: Array<{
    systemCode: string;
    name: string;
  }>;
}

interface CongressResponse<T> {
  bills?: T[];
  congress?: {
    bills?: T[];
  };
  pagination: {
    count: number;
    next?: string;
  };
}

export class CongressAPI {
  private static instance: CongressAPI;
  private baseUrl = 'https://api.congress.gov/v3';
  private headers: HeadersInit;
  private responseCache = new Map<string, any>();

  private constructor() {
    if (!process.env.NEXT_PUBLIC_CONGRESS_API_KEY) {
      throw new Error('NEXT_PUBLIC_CONGRESS_API_KEY is required');
    }
    
    this.headers = {
      'X-API-Key': process.env.NEXT_PUBLIC_CONGRESS_API_KEY,
    };
  }

  public static getInstance(): CongressAPI {
    if (!CongressAPI.instance) {
      CongressAPI.instance = new CongressAPI();
    }
    return CongressAPI.instance;
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const queryString = endpoint.includes('?') ? endpoint.split('?')[1] : '';
    const basePath = endpoint.includes('?') ? endpoint.split('?')[0] : endpoint;
    
    const cacheKey = `${basePath}?${queryString}`;
    
    const cached = this.responseCache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    const response = await fetch(`/api/congress?endpoint=${encodeURIComponent(basePath)}${queryString ? `&${queryString}` : ''}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Congress API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    this.responseCache.set(cacheKey, data);
    
    return data;
  }

  async getRecentBills(congress: number = 118, type: 'hr' | 's' = 'hr'): Promise<Bill[]> {
    const response = await this.fetch<CongressResponse<Bill>>(`/bill/${congress}/${type}?format=json&limit=50&sort=updateDate&offset=0`);
    return response.congress?.bills || response.bills || [];
  }

  async searchBills(query: string, congress: number = 118): Promise<Bill[]> {
    const response = await this.fetch<CongressResponse<Bill>>(`/bill?congress=${congress}&query=${encodeURIComponent(query)}&format=json&limit=50&sort=updateDate&offset=0`);
    return response.congress?.bills || response.bills || [];
  }

  async getBillsBySubject(subject: string, congress: number = 118): Promise<Bill[]> {
    const response = await this.fetch<CongressResponse<Bill>>(`/bill/${congress}/subject/${encodeURIComponent(subject)}?format=json&limit=50`);
    return response.congress?.bills || response.bills || [];
  }

  async getBillDetail(congress: number, type: string, number: string): Promise<Bill> {
    const response = await this.fetch<{ bill: Bill }>(`/bill/${congress}/${type}${number}?format=json`);
    return response.bill;
  }

  async getMemberVotes(bioguideId: string): Promise<any[]> {
    const response = await this.fetch<{ votes: any[] }>(`/member/${bioguideId}/votes?format=json&limit=100`);
    return response.votes;
  }
}

export const congressAPI = CongressAPI.getInstance();
