'use client';

import { useState, useEffect, useCallback } from 'react';

interface Politician {
  id: string;
  name: string;
  party: string;
  state: string;
  fecId: string;
}

interface VoteRecord {
  id: string;
  billId: string;
  vote: 'YEA' | 'NAY' | 'PRESENT' | 'NOT_VOTING';
  date: string;
  billTitle: string;
}

interface Contribution {
  id: string;
  amount: number;
  date: string;
  source: string;
  industry: string;
  type: 'INDIVIDUAL' | 'COMMITTEE' | 'PARTY';
}

interface Investment {
  id: string;
  value: number;
  asset: string;
  type: string;
  date: string;
}

interface Expenditure {
  id: string;
  amount: number;
  date: string;
  source: string;
  industry: string;
  type: string;
}

interface FinancialReport {
  id: string;
  year: number;
  filingDate: string;
  reportType: string;
  documentUrl: string;
}

interface PoliticalData {
  loading: boolean;
  error: Error | null;
  politician?: Politician;
  voteRecords: VoteRecord[];
  contributions: Contribution[];
  investments: Investment[];
  expenditures: Expenditure[];
  reports: FinancialReport[];
}

interface UsePoliticalDataOptions {
  politicianId?: string;
}

export function usePoliticalData(options: UsePoliticalDataOptions): PoliticalData & {
  conflictAnalysis: {
    potentialConflicts: Array<{
      type: 'INVESTMENT' | 'CONTRIBUTION';
      description: string;
      severity: 'LOW' | 'MEDIUM' | 'HIGH';
      relatedVotes?: VoteRecord[];
    }>;
    voteCorrelations: Array<{
      industry: string;
      correlation: number;
      contributionTotal: number;
    }>;
    significantInvestments: Array<{
      asset: string;
      value: number;
      relatedVotes: number;
    }>;
  }
} {
  const [data, setData] = useState<PoliticalData>({
    loading: true,
    error: null,
    voteRecords: [],
    contributions: [],
    investments: [],
    expenditures: [],
    reports: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!options.politicianId) return;

      setData(prev => ({ ...prev, loading: true }));

      try {
        const response = await fetch(`/api/politicians/${options.politicianId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch politician data');
        }

        const { data: politician } = await response.json();
        setData({
          loading: false,
          error: null,
          politician,
          voteRecords: politician.votes || [],
          contributions: politician.contributions || [],
          investments: politician.investments || [],
          expenditures: politician.expenditures || [],
          reports: politician.reports || [],
        });
      } catch (error) {
        console.error('Error fetching politician data:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error : new Error('Unknown error occurred'),
        }));
      }
    };

    fetchData();
  }, [options.politicianId]);

  return {
    ...data,
    conflictAnalysis: useConflictAnalysis(data),
  };
}

export function useConflictAnalysis(data: PoliticalData) {
  const analyzePotentialConflicts = useCallback(() => {
    if (!data.politician || data.loading) return [];

    const conflicts: any[] = [];

    // Compare voting records with investments and contributions
    const voteRecords = data.voteRecords || [];
    for (const vote of voteRecords) {
      // Check for related investments
      const relatedInvestments = data.investments.filter(investment => 
        vote.billTitle?.toLowerCase().includes(investment.asset.toLowerCase())
      );

      // Check for related contributions
      const relatedContributions = data.contributions.filter(contribution =>
        vote.billTitle?.toLowerCase().includes(contribution.source.toLowerCase())
      );

      if (relatedInvestments.length > 0 || relatedContributions.length > 0) {
        conflicts.push({
          type: 'direct_interest',
          description: `Conflict of interest detected for bill ${vote.billTitle}`,
          severity: 'MEDIUM',
          relatedVotes: [vote],
        });
      }
    }

    return conflicts;
  }, [data]);

  const analyzeVoteCorrelations = useCallback(() => {
    const correlations = new Map<string, { correlation: number; contributionTotal: number }>();

    // Calculate correlation between contributions and related votes
    data.contributions.forEach(contribution => {
      const relatedVotes = data.voteRecords.filter(vote =>
        vote.billTitle?.toLowerCase().includes(contribution.industry.toLowerCase())
      );

      if (relatedVotes.length > 0) {
        const correlation = relatedVotes.reduce((acc, vote) => 
          acc + (vote.vote === 'YEA' ? 1 : -1), 0) / relatedVotes.length;
        
        correlations.set(contribution.industry, {
          correlation,
          contributionTotal: contribution.amount,
        });
      }
    });

    return Array.from(correlations.entries())
      .map(([industry, { correlation, contributionTotal }]) => ({
        industry,
        correlation,
        contributionTotal,
      }))
      .sort((a, b) => b.contributionTotal - a.contributionTotal);
  }, [data]);

  const analyzeSignificantInvestments = useCallback(() => {
    const totalInvestmentValue = data.investments.reduce((acc, inv) => acc + inv.value, 0);

    return data.investments
      .map(investment => ({
        ...investment,
        relatedVotes: data.voteRecords.filter(vote =>
          vote.billTitle?.toLowerCase().includes(investment.asset.toLowerCase())
        ).length,
      }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  return {
    potentialConflicts: analyzePotentialConflicts(),
    voteCorrelations: analyzeVoteCorrelations(),
    significantInvestments: analyzeSignificantInvestments(),
  };
}
