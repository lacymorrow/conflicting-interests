'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VisualizationDashboard } from "@/components/financial/visualization-dashboard";

// Mock data - in real app, this would come from an API
const mockFinancialData = [
  {
    politician: "John Smith",
    donor: "Tech Corp Inc",
    amount: 50000,
    date: "2024-12-15",
    type: "Campaign Contribution"
  },
  {
    politician: "Jane Doe",
    donor: "Energy Solutions LLC",
    amount: 75000,
    date: "2024-11-30",
    type: "PAC Donation"
  },
];

export default function FinancialTracking() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Financial Connections Tracker</CardTitle>
            <CardDescription>
              Explore and analyze financial relationships between politicians and private interests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search politicians or donors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="campaign">Campaign Contributions</SelectItem>
                  <SelectItem value="pac">PAC Donations</SelectItem>
                  <SelectItem value="lobbying">Lobbying</SelectItem>
                </SelectContent>
              </Select>
              <Button>Search</Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Politician</TableHead>
                  <TableHead>Donor/Entity</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockFinancialData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.politician}</TableCell>
                    <TableCell>{item.donor}</TableCell>
                    <TableCell>${item.amount.toLocaleString()}</TableCell>
                    <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                    <TableCell>{item.type}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <VisualizationDashboard />
      </div>
    </div>
  );
}
