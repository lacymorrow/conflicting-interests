'use server';

import { prisma } from '@/lib/prisma';

export interface FinancialSummary {
  contributions: {
    total: number;
    byIndustry: { industry: string; amount: number }[];
  };
  investments: {
    total: number;
    byType: { type: string; value: number }[];
  };
}

export async function getFinancialData(politicianId: string): Promise<FinancialSummary> {
  const [contributions, investments] = await Promise.all([
    prisma.contribution.findMany({
      where: { politicianId },
      select: {
        amount: true,
        industry: true,
      },
    }),
    prisma.investment.findMany({
      where: { politicianId },
      select: {
        value: true,
        type: true,
      },
    }),
  ]);

  // Process contributions
  const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
  const byIndustry = contributions.reduce((acc, c) => {
    const existing = acc.find(x => x.industry === c.industry);
    if (existing) {
      existing.amount += c.amount;
    } else {
      acc.push({ industry: c.industry, amount: c.amount });
    }
    return acc;
  }, [] as { industry: string; amount: number }[]);

  // Process investments
  const totalInvestments = investments.reduce((sum, i) => sum + i.value, 0);
  const byType = investments.reduce((acc, i) => {
    const existing = acc.find(x => x.type === i.type);
    if (existing) {
      existing.value += i.value;
    } else {
      acc.push({ type: i.type, value: i.value });
    }
    return acc;
  }, [] as { type: string; value: number }[]);

  return {
    contributions: {
      total: totalContributions,
      byIndustry: byIndustry.sort((a, b) => b.amount - a.amount),
    },
    investments: {
      total: totalInvestments,
      byType: byType.sort((a, b) => b.value - a.value),
    },
  };
}
