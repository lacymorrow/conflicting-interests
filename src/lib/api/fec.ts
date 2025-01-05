const FEC_API_KEY = process.env.NEXT_PUBLIC_FEC_API_KEY;
const BASE_URL = 'https://api.open.fec.gov/v1';

export interface CommitteeContribution {
  committee_id: string;
  committee_name: string;
  contribution_receipt_amount: number;
  contribution_receipt_date: string;
  entity_type: string;
  entity_type_desc: string;
}

export interface IndependentExpenditure {
  committee_id: string;
  committee_name: string;
  candidate_name: string;
  candidate_id: string;
  support_oppose_indicator: string;
  expenditure_amount: number;
  expenditure_date: string;
  purpose_description: string;
}

class FECAPI {
  private async fetch(endpoint: string, params: Record<string, string> = {}) {
    const queryParams = new URLSearchParams({
      api_key: FEC_API_KEY || '',
      ...params,
    });

    const response = await fetch(`${BASE_URL}${endpoint}?${queryParams}`);

    if (!response.ok) {
      throw new Error(`FEC API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async getCommitteeContributions(
    committeeId: string,
    params: { min_date?: string; max_date?: string } = {}
  ): Promise<CommitteeContribution[]> {
    const response = await this.fetch(`/committee/${committeeId}/contributions`, {
      min_date: params.min_date || '',
      max_date: params.max_date || '',
      sort: '-contribution_receipt_date',
      per_page: '100',
    });
    return response.results;
  }

  async getIndependentExpenditures(
    candidateId: string,
    params: { min_date?: string; max_date?: string } = {}
  ): Promise<IndependentExpenditure[]> {
    const response = await this.fetch('/schedule/schedule_e', {
      candidate_id: candidateId,
      min_date: params.min_date || '',
      max_date: params.max_date || '',
      sort: '-expenditure_date',
      per_page: '100',
    });
    return response.results;
  }

  async searchCandidates(name: string) {
    const response = await this.fetch('/candidates/search', {
      q: name,
      sort: '-receipts',
    });
    return response.results;
  }
}

export const fecAPI = new FECAPI();
