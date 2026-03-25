const FEC_API_KEY = 'tfhEmquaEKXflU4xjA8mHjGTMKssTloO3JQrSBmf';
const BASE_URL = 'https://api.open.fec.gov/v1';

export interface Candidate {
  candidate_id: string;
  name: string;
  party: string;
  state: string;
  office: string;
  district?: string;
  cycles: number[];
}

export interface Committee {
  committee_id: string;
  name: string;
  treasurer_name: string;
  organization_type: string;
  committee_type: string;
  filing_frequency: string;
  designation: string;
}

export interface Contribution {
  contributor_name: string;
  contributor_employer: string;
  contributor_occupation: string;
  contribution_receipt_amount: number;
  contribution_receipt_date: string;
  memo_text: string | null;
  report_year: number;
}

export interface IndependentExpenditure {
  committee_id: string;
  committee_name: string;
  candidate_name: string;
  candidate_id: string;
  support_oppose_indicator: 'S' | 'O';
  expenditure_amount: number;
  expenditure_date: string;
  purpose_description: string;
}

// Rate limiting and retry configuration
const RATE_LIMIT_DELAY = 1000; // 1 second between requests
const MAX_RETRIES = 3;
let lastRequestTime = 0;

class FECClient {
  private async fetch<T>(endpoint: string, params: Record<string, string | number> = {}) {
    // Implement rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest));
    }
    lastRequestTime = Date.now();

    // Implement retry logic
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const queryParams = new URLSearchParams({
          api_key: FEC_API_KEY,
          ...Object.fromEntries(
            Object.entries(params).map(([key, value]) => [key, String(value)])
          ),
        });

        const response = await fetch(`${BASE_URL}${endpoint}?${queryParams}`);

        if (response.status === 429) { // Too Many Requests
          const retryAfter = parseInt(response.headers.get('retry-after') || '60');
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          continue;
        }

        if (!response.ok) {
          throw new Error(`FEC API Error: ${response.statusText}`);
        }

        return response.json() as Promise<T>;
      } catch (error) {
        lastError = error as Error;
        if (attempt < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY * Math.pow(2, attempt)));
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  async searchCandidates(name: string, cycle?: number) {
    // Clean up the name and create a search query
    const cleanName = name.replace(/[^\w\s]/g, '').trim();
    const nameParts = cleanName.split(' ');
    const searchName = nameParts.length > 1 ? 
      `${nameParts[nameParts.length - 1]}, ${nameParts[0]}` : // Last, First format
      cleanName;

    const response = await this.fetch<{ results: Candidate[] }>('/candidates/search', {
      q: searchName,
      sort: '-receipts',
      per_page: 5,
      election_full: true,
      is_active_candidate: true,
    });
    return response.results;
  }

  async getCandidateById(candidateId: string) {
    const response = await this.fetch<{ results: [Candidate] }>(`/candidate/${candidateId}`);
    return response.results[0];
  }

  async getCandidateCommittees(candidateId: string) {
    const response = await this.fetch<{ results: Committee[] }>(
      `/candidate/${candidateId}/committees`
    );
    return response.results;
  }

  async getCommitteeContributions(committeeId: string, params: {
    min_date?: string;
    max_date?: string;
    min_amount?: number;
    contributor_name?: string;
  } = {}) {
    const response = await this.fetch<{ results: Contribution[] }>(
      '/schedules/schedule_a',
      {
        committee_id: committeeId,
        sort: '-contribution_receipt_amount',
        per_page: 100,
        ...params,
      }
    );
    return response.results;
  }

  async getIndependentExpenditures(params: {
    candidate_id?: string;
    committee_id?: string;
    min_date?: string;
    max_date?: string;
    min_amount?: number;
  } = {}) {
    const response = await this.fetch<{ results: IndependentExpenditure[] }>(
      '/schedules/schedule_e',
      {
        sort: '-expenditure_date',
        per_page: 100,
        is_notice: false,
        ...params,
      }
    );
    return response.results;
  }

  async getTopIndustries(candidateId: string, cycle?: number) {
    // Note: This is a custom aggregation since FEC doesn't provide direct industry totals
    const committees = await this.getCandidateCommittees(candidateId);
    const contributions = await Promise.all(
      committees.map(committee =>
        this.getCommitteeContributions(committee.committee_id)
      )
    );

    const industries = new Map<string, number>();
    contributions.flat().forEach(contribution => {
      const industry = contribution.contributor_employer || 'Unknown';
      industries.set(
        industry,
        (industries.get(industry) || 0) + contribution.contribution_receipt_amount
      );
    });

    return Array.from(industries.entries())
      .map(([industry, total]) => ({ industry, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 20);
  }

  async analyzePotentialConflicts(candidateId: string) {
    const [committees, expenditures] = await Promise.all([
      this.getCandidateCommittees(candidateId),
      this.getIndependentExpenditures({ candidate_id: candidateId }),
    ]);

    const contributions = await Promise.all(
      committees.map(committee =>
        this.getCommitteeContributions(committee.committee_id, {
          min_amount: 10000, // Focus on large contributions
        })
      )
    );

    const conflicts = [];

    // Analyze large contributions
    contributions.flat().forEach(contribution => {
      if (contribution.contribution_receipt_amount >= 10000) {
        conflicts.push({
          type: 'large_contribution',
          amount: contribution.contribution_receipt_amount,
          date: contribution.contribution_receipt_date,
          contributor: contribution.contributor_name,
          employer: contribution.contributor_employer,
          occupation: contribution.contributor_occupation,
        });
      }
    });

    // Analyze independent expenditures
    expenditures.forEach(expenditure => {
      conflicts.push({
        type: 'independent_expenditure',
        amount: expenditure.expenditure_amount,
        date: expenditure.expenditure_date,
        spender: expenditure.committee_name,
        purpose: expenditure.purpose_description,
        support_oppose: expenditure.support_oppose_indicator,
      });
    });

    return conflicts;
  }
}

export const fecClient = new FECClient();
