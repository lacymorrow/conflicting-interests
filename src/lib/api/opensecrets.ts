const OPENSECRETS_API_KEY = process.env.NEXT_PUBLIC_OPENSECRETS_API_KEY;
const BASE_URL = 'http://www.opensecrets.org/api';

export interface CandidateContribution {
  contributor_name: string;
  total: number;
  pacs: number;
  indivs: number;
}

export interface IndustryContribution {
  industry_name: string;
  industry_code: string;
  total: number;
  pacs: number;
  indivs: number;
}

class OpenSecretsAPI {
  private async fetch(params: Record<string, string>) {
    const queryParams = new URLSearchParams({
      apikey: OPENSECRETS_API_KEY || '',
      output: 'json',
      ...params,
    });

    const response = await fetch(`${BASE_URL}?${queryParams}`);

    if (!response.ok) {
      throw new Error(`OpenSecrets API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async getTopContributors(cid: string): Promise<CandidateContribution[]> {
    const response = await this.fetch({
      method: 'candContrib',
      cid,
    });
    return response.response.contributors.contributor;
  }

  async getIndustryContributions(cid: string): Promise<IndustryContribution[]> {
    const response = await this.fetch({
      method: 'candIndustry',
      cid,
    });
    return response.response.industries.industry;
  }

  async getLegislatorsByState(state: string) {
    const response = await this.fetch({
      method: 'getLegislators',
      id: state,
    });
    return response.response.legislators.legislator;
  }
}

export const openSecretsAPI = new OpenSecretsAPI();
