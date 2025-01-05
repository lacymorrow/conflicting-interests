import { Card, Text, Title, BarChart, DonutChart, Badge, LineChart } from "@tremor/react";
import { usePoliticalData } from "@/hooks/use-political-data";
import { AlertTriangle } from "lucide-react";

interface DashboardProps {
  politicianId: string;
}

export function VisualizationDashboard({ politicianId }: DashboardProps) {
  const { loading, error, contributions, investments, expenditures, conflictAnalysis } = usePoliticalData({ politicianId });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="h-[300px] animate-pulse bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <Text>Error loading financial data</Text>
      </div>
    );
  }

  // Format data for charts
  const contributionsByIndustry = contributions.reduce((acc, c) => {
    const existing = acc.find(x => x.industry === c.industry);
    if (existing) {
      existing.amount += c.amount;
    } else {
      acc.push({ industry: c.industry, amount: c.amount });
    }
    return acc;
  }, [] as { industry: string; amount: number }[])
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  const expendituresByIndustry = expenditures.reduce((acc, e) => {
    const existing = acc.find(x => x.industry === e.industry);
    if (existing) {
      existing.amount += e.amount;
    } else {
      acc.push({ industry: e.industry, amount: e.amount });
    }
    return acc;
  }, [] as { industry: string; amount: number }[])
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  const investmentsByType = investments.reduce((acc, i) => {
    const existing = acc.find(x => x.type === i.type);
    if (existing) {
      existing.value += i.value;
    } else {
      acc.push({ type: i.type, value: i.value });
    }
    return acc;
  }, [] as { type: string; value: number }[])
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
  const totalExpenditures = expenditures.reduce((sum, e) => sum + e.amount, 0);
  const totalInvestments = investments.reduce((sum, i) => sum + i.value, 0);

  return (
    <div className="space-y-6">
      {conflictAnalysis.potentialConflicts.length > 0 && (
        <Card className="bg-yellow-50">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <Title>Potential Conflicts of Interest</Title>
          </div>
          <div className="space-y-4">
            {conflictAnalysis.potentialConflicts.map((conflict, index) => (
              <div key={index} className="p-4 bg-white rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2">
                  <Badge color={
                    conflict.severity === 'HIGH' ? 'red' :
                    conflict.severity === 'MEDIUM' ? 'yellow' : 'blue'
                  }>
                    {conflict.severity}
                  </Badge>
                  <Text>{conflict.type}</Text>
                </div>
                <Text className="mt-2">{conflict.description}</Text>
                {conflict.relatedVotes && conflict.relatedVotes.length > 0 && (
                  <div className="mt-2">
                    <Text className="font-medium">Related Votes:</Text>
                    <ul className="list-disc list-inside">
                      {conflict.relatedVotes.map((vote, vIndex) => (
                        <li key={vIndex} className="text-sm text-muted-foreground">
                          {vote.billTitle} - {vote.vote}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <Title>Top Industry Contributions</Title>
          <Text className="text-muted-foreground">Total: {formatCurrency(totalContributions)}</Text>
          <BarChart
            data={contributionsByIndustry}
            index="industry"
            categories={["amount"]}
            colors={["blue"]}
            valueFormatter={formatCurrency}
            className="mt-4"
          />
        </Card>

        <Card>
          <Title>Top Industry Expenditures</Title>
          <Text className="text-muted-foreground">Total: {formatCurrency(totalExpenditures)}</Text>
          <BarChart
            data={expendituresByIndustry}
            index="industry"
            categories={["amount"]}
            colors={["blue"]}
            valueFormatter={formatCurrency}
            className="mt-4"
          />
        </Card>

        <Card>
          <Title>Investment Portfolio</Title>
          <Text className="text-muted-foreground">Total: {formatCurrency(totalInvestments)}</Text>
          <DonutChart
            data={investmentsByType}
            category="value"
            index="type"
            valueFormatter={formatCurrency}
            className="mt-4"
          />
        </Card>

        <Card>
          <Title>Recent Contributions</Title>
          <div className="space-y-4 mt-4">
            {contributions.slice(0, 5).map((contribution, index) => (
              <div key={index} className="p-4 bg-muted rounded-lg">
                <Text className="font-medium">
                  {formatCurrency(contribution.amount)}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  From: {contribution.source}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  Industry: {contribution.industry}
                </Text>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <Title>Recent Expenditures</Title>
          <div className="space-y-4 mt-4">
            {expenditures.slice(0, 5).map((expenditure, index) => (
              <div key={index} className="p-4 bg-muted rounded-lg">
                <Text className="font-medium">
                  {formatCurrency(expenditure.amount)}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  To: {expenditure.recipient}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  Industry: {expenditure.industry}
                </Text>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <Title>Recent Investments</Title>
          <div className="space-y-4 mt-4">
            {investments.slice(0, 5).map((investment, index) => (
              <div key={index} className="p-4 bg-muted rounded-lg">
                <Text className="font-medium">
                  {formatCurrency(investment.value)}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  Asset: {investment.asset}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  Type: {investment.type}
                </Text>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <Title>Vote-Contribution Correlation</Title>
          <Text className="text-muted-foreground">
            Correlation between contributions and voting patterns
          </Text>
          <LineChart
            data={conflictAnalysis.voteCorrelations}
            index="industry"
            categories={["correlation"]}
            colors={["blue"]}
            valueFormatter={(value) => `${(value * 100).toFixed(1)}%`}
            className="mt-4"
          />
        </Card>

        <Card>
          <Title>Significant Investments</Title>
          <div className="space-y-4 mt-4">
            {conflictAnalysis.significantInvestments.map((investment, index) => (
              <div key={index} className="p-4 bg-muted rounded-lg">
                <Text className="font-medium">
                  {formatCurrency(investment.value)}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  Asset: {investment.asset}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  Related Votes: {investment.relatedVotes}
                </Text>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("us", {
    style: "currency",
    currency: "USD",
    notation: "compact",
  }).format(value);
}
