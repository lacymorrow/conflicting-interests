'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { congressAPI, type Bill } from '@/lib/api/congress';
import { AlertTriangle, Share2, UserRound, Eye, EyeOff } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from 'sonner';
import { usePoliticalData } from '@/hooks/use-political-data';

const DEFAULT_KEYWORDS = ['ethics', 'lobbying', 'campaign finance', 'disclosure'] as const;

interface BillTrackerProps {
  keywords?: typeof DEFAULT_KEYWORDS;
  politicianId?: string;
}

interface ConflictAnalysis {
  hasConflict: boolean;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  relatedContributions?: Array<{
    source: string;
    amount: number;
    industry: string;
  }>;
}

export function BillTracker({ keywords = DEFAULT_KEYWORDS, politicianId }: BillTrackerProps) {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [trackedBills, setTrackedBills] = useState<Set<string>>(new Set());
  const { contributions, investments } = usePoliticalData({ politicianId });

  // Fetch bills only once on mount
  useEffect(() => {
    let mounted = true;

    async function fetchBills() {
      try {
        const [recentBills, ...keywordBills] = await Promise.all([
          congressAPI.getRecentBills(),
          ...DEFAULT_KEYWORDS.map(keyword => congressAPI.searchBills(keyword))
        ]);
        
        if (!mounted) return;

        const billMap = new Map();
        [...recentBills, ...keywordBills.flat()].forEach(bill => {
          const id = `${bill.congress}-${bill.type}${bill.number}`;
          if (!billMap.has(id)) {
            billMap.set(id, bill);
          }
        });

        setBills(Array.from(billMap.values()));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bills:', error);
        if (mounted) {
          setLoading(false);
          toast.error('Failed to fetch bills');
        }
      }
    }

    fetchBills();
    return () => { mounted = false; };
  }, []); // Only run once on mount

  const analyzeBillConflicts = useCallback((bill: Bill): ConflictAnalysis => {
    if (!contributions?.length && !investments?.length) {
      return {
        hasConflict: false,
        severity: 'LOW',
        description: 'No financial data available for analysis'
      };
    }

    const relatedContributions = contributions?.filter(contribution => {
      const industryKeywords = contribution.industry.toLowerCase().split(' ');
      return industryKeywords.some(keyword => 
        bill.title.toLowerCase().includes(keyword) ||
        (bill.summary?.toLowerCase() || '').includes(keyword)
      );
    });

    const relatedInvestments = investments?.filter(investment => {
      const assetKeywords = investment.asset.toLowerCase().split(' ');
      return assetKeywords.some(keyword =>
        bill.title.toLowerCase().includes(keyword) ||
        (bill.summary?.toLowerCase() || '').includes(keyword)
      );
    });

    if (relatedContributions?.length || relatedInvestments?.length) {
      const totalAmount = (relatedContributions?.reduce((sum, c) => sum + c.amount, 0) || 0) +
                         (relatedInvestments?.reduce((sum, i) => sum + i.value, 0) || 0);
      
      let severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
      if (totalAmount > 100000) severity = 'HIGH';
      else if (totalAmount > 10000) severity = 'MEDIUM';

      return {
        hasConflict: true,
        severity,
        description: `Found ${relatedContributions?.length || 0} related contributions and ${relatedInvestments?.length || 0} related investments that may indicate a conflict of interest.`,
        relatedContributions
      };
    }

    return {
      hasConflict: false,
      severity: 'LOW',
      description: 'No potential conflicts detected'
    };
  }, [contributions, investments]); // Only recalculate when financial data changes

  const toggleTrackBill = (billId: string) => {
    setTrackedBills(prev => {
      const newSet = new Set(prev);
      if (newSet.has(billId)) {
        newSet.delete(billId);
        toast.success('Bill removed from tracking');
      } else {
        newSet.add(billId);
        toast.success('Bill added to tracking');
      }
      return newSet;
    });
  };

  const shareBill = async (bill: Bill) => {
    try {
      await navigator.share({
        title: bill.title,
        text: `Check out this bill: ${bill.title}`,
        url: `https://www.congress.gov/bill/${bill.congress}th-congress/${bill.type}${bill.number}`
      });
    } catch (error) {
      console.error('Error sharing bill:', error);
      toast.error('Failed to share bill');
    }
  };

  const contactRepresentatives = (bill: Bill) => {
    // TODO: Implement contact form or redirect to contact page
    toast.info('Contact feature coming soon');
  };

  const uniqueBills = useMemo(() => {
    const seen = new Set<string>();
    return bills.filter(bill => {
      const id = `${bill.congress}-${bill.type}${bill.number}`;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [bills]);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Date not available';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Date not available';
    }
  };

  // Memoize filtered and processed bills
  const {
    activeBills,
    trackedBills: trackedBillsList,
    conflictBills,
    billsWithConflicts
  } = useMemo(() => {
    // Take only the most recent 20 bills for each category
    const processed = uniqueBills.slice(0, 50);
    
    return {
      activeBills: processed.slice(0, 20),
      trackedBills: processed
        .filter(bill => trackedBills.has(`${bill.congress}-${bill.type}${bill.number}`))
        .slice(0, 20),
      conflictBills: processed
        .filter(bill => analyzeBillConflicts(bill).hasConflict)
        .slice(0, 20),
      billsWithConflicts: new Set(
        processed
          .filter(bill => analyzeBillConflicts(bill).hasConflict)
          .map(bill => `${bill.congress}-${bill.type}${bill.number}`)
      )
    };
  }, [uniqueBills, trackedBills, analyzeBillConflicts]);

  // Memoize conflict analysis to prevent recalculation
  const conflictAnalysis = useMemo(() => {
    const analysis = new Map();
    conflictBills.forEach(bill => {
      analysis.set(`${bill.congress}-${bill.type}${bill.number}`, analyzeBillConflicts(bill));
    });
    return analysis;
  }, [conflictBills, analyzeBillConflicts]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-[400px]" />
                <Skeleton className="h-4 w-[200px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Legislative Tracker</CardTitle>
        <CardDescription>
          Monitor bills and legislation related to government ethics and transparency
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Active Bills</TabsTrigger>
            <TabsTrigger value="tracked">Tracked Bills</TabsTrigger>
            <TabsTrigger value="conflicts">Potential Conflicts</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-muted-foreground">Showing the 20 most recent bills</p>
              <Badge variant="secondary">{uniqueBills.length} total bills</Badge>
            </div>
            {activeBills.map((bill) => {
              const billId = `${bill.congress}-${bill.type}${bill.number}`;
              const conflict = billsWithConflicts.has(billId) ? conflictAnalysis.get(billId) : null;
              const mainSponsor = bill.sponsors?.[0];
              return (
                <Card key={billId}>
                  <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {bill.type.toUpperCase()} {bill.number} - {bill.congress}th Congress
                        </CardTitle>
                        <CardDescription className="mt-2">
                          Introduced: {formatDate(bill.introducedDate)}
                          {mainSponsor && (
                            <> by {mainSponsor.firstName} {mainSponsor.lastName} ({mainSponsor.party}-{mainSponsor.state})</>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {conflict && (
                          <Badge variant="destructive" className="flex gap-1">
                            <AlertTriangle className="w-4 h-4" />
                            {conflict.severity}
                          </Badge>
                        )}
                        {mainSponsor && (
                          <Badge className={
                            mainSponsor.party === 'D' ? 'bg-blue-500' :
                            mainSponsor.party === 'R' ? 'bg-red-500' : 'bg-gray-500'
                          }>
                            {mainSponsor.party} - {mainSponsor.state}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{bill.summary || 'No summary available.'}</p>
                      {conflict && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                          <p className="text-sm font-medium text-red-800">{conflict.description}</p>
                          {conflict.relatedContributions && conflict.relatedContributions.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {conflict.relatedContributions.map((contribution, i) => (
                                <li key={i} className="text-sm text-red-700">
                                  ${contribution.amount.toLocaleString()} from {contribution.source} ({contribution.industry})
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                      <div className="flex justify-between items-center text-sm">
                        <span>Introduced: {formatDate(bill.introducedDate)}</span>
                        <span>Latest Action: {formatDate(bill.latestAction.actionDate)}</span>
                      </div>
                      <p className="text-sm font-medium">{bill.latestAction.text}</p>
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant={trackedBills.has(billId) ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => toggleTrackBill(billId)}
                        >
                          {trackedBills.has(billId) ? (
                            <><EyeOff className="w-4 h-4 mr-2" /> Untrack</>
                          ) : (
                            <><Eye className="w-4 h-4 mr-2" /> Track Bill</>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => contactRepresentatives(bill)}
                        >
                          <UserRound className="w-4 h-4 mr-2" />
                          Contact Representatives
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => shareBill(bill)}
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="tracked" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-muted-foreground">Showing your 20 most recently tracked bills</p>
              <Badge variant="secondary">{trackedBills.size} tracked bills</Badge>
            </div>
            {trackedBillsList.length > 0 ? (
              trackedBillsList.map(bill => {
                const mainSponsor = bill.sponsors?.[0];
                return (
                  <Card key={`${bill.congress}-${bill.type}${bill.number}`}>
                    <CardHeader>
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {bill.type.toUpperCase()} {bill.number} - {bill.congress}th Congress
                          </CardTitle>
                          <CardDescription className="mt-2">
                            Introduced: {formatDate(bill.introducedDate)}
                            {mainSponsor && (
                              <> by {mainSponsor.firstName} {mainSponsor.lastName} ({mainSponsor.party}-{mainSponsor.state})</>
                            )}
                          </CardDescription>
                        </div>
                        {mainSponsor && (
                          <Badge className={
                            mainSponsor.party === 'D' ? 'bg-blue-500' :
                            mainSponsor.party === 'R' ? 'bg-red-500' : 'bg-gray-500'
                          }>
                            {mainSponsor.party} - {mainSponsor.state}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{bill.summary || 'No summary available.'}</p>
                        <div className="flex justify-between items-center text-sm">
                          <span>Introduced: {formatDate(bill.introducedDate)}</span>
                          <span>Latest Action: {formatDate(bill.latestAction.actionDate)}</span>
                        </div>
                        <p className="text-sm font-medium">{bill.latestAction.text}</p>
                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => contactRepresentatives(bill)}
                          >
                            <UserRound className="w-4 h-4 mr-2" />
                            Contact Representatives
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => shareBill(bill)}
                          >
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No bills are currently being tracked.
              </div>
            )}
          </TabsContent>

          <TabsContent value="conflicts" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-muted-foreground">Showing the 20 most recent bills with potential conflicts</p>
              <Badge variant="secondary">{billsWithConflicts.size} bills with conflicts</Badge>
            </div>
            {conflictBills.length > 0 ? (
              conflictBills.map(bill => {
                const conflict = conflictAnalysis.get(`${bill.congress}-${bill.type}${bill.number}`);
                const mainSponsor = bill.sponsors?.[0];
                return (
                  <Card key={`${bill.congress}-${bill.type}${bill.number}`}>
                    <CardHeader>
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {bill.type.toUpperCase()} {bill.number} - {bill.congress}th Congress
                          </CardTitle>
                          <CardDescription className="mt-2">
                            Introduced: {formatDate(bill.introducedDate)}
                            {mainSponsor && (
                              <> by {mainSponsor.firstName} {mainSponsor.lastName} ({mainSponsor.party}-{mainSponsor.state})</>
                            )}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="destructive" className="flex gap-1">
                            <AlertTriangle className="w-4 h-4" />
                            {conflict.severity}
                          </Badge>
                          {mainSponsor && (
                            <Badge className={
                              mainSponsor.party === 'D' ? 'bg-blue-500' :
                              mainSponsor.party === 'R' ? 'bg-red-500' : 'bg-gray-500'
                            }>
                              {mainSponsor.party} - {mainSponsor.state}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">{bill.summary || 'No summary available.'}</p>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                          <p className="text-sm font-medium text-red-800">{conflict.description}</p>
                          {conflict.relatedContributions && conflict.relatedContributions.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {conflict.relatedContributions.map((contribution, i) => (
                                <li key={i} className="text-sm text-red-700">
                                  ${contribution.amount.toLocaleString()} from {contribution.source} ({contribution.industry})
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>Introduced: {formatDate(bill.introducedDate)}</span>
                          <span>Latest Action: {formatDate(bill.latestAction.actionDate)}</span>
                        </div>
                        <p className="text-sm font-medium">{bill.latestAction.text}</p>
                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => contactRepresentatives(bill)}
                          >
                            <UserRound className="w-4 h-4 mr-2" />
                            Contact Representatives
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => shareBill(bill)}
                          >
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No potential conflicts detected in current bills.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
