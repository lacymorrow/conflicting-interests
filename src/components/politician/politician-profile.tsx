'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VisualizationDashboard } from "@/components/financial/visualization-dashboard";
import { BillTracker } from "@/components/legislative/bill-tracker";

interface Politician {
  id: string;
  firstName: string;
  lastName: string;
  party: string;
  state: string;
  district?: string;
  _count: {
    votes: number;
    contributions: number;
    investments: number;
    expenditures: number;
  };
}

interface PoliticianProfileProps {
  politician: Politician;
}

export function PoliticianProfile({ politician }: PoliticianProfileProps) {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{politician.firstName} {politician.lastName}</CardTitle>
            <CardDescription>
              {politician.party} • {politician.state}
              {politician.district && ` • District ${politician.district}`}
            </CardDescription>
            <div className="mt-2 text-sm text-gray-600">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="font-semibold">{politician._count.contributions}</p>
                  <p>Contributions</p>
                </div>
                <div>
                  <p className="font-semibold">{politician._count.investments}</p>
                  <p>Investments</p>
                </div>
                <div>
                  <p className="font-semibold">{politician._count.expenditures}</p>
                  <p>Expenditures</p>
                </div>
                <div>
                  <p className="font-semibold">{politician._count.votes}</p>
                  <p>Votes</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="financial" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="financial">Financial Data</TabsTrigger>
                <TabsTrigger value="legislative">Legislative Activity</TabsTrigger>
              </TabsList>
              <TabsContent value="financial">
                <VisualizationDashboard politicianId={politician.id} />
              </TabsContent>
              <TabsContent value="legislative">
                <BillTracker politicianId={politician.id} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
