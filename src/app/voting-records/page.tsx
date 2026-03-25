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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Mock data - in real app, this would come from an API
const mockVotingData = [
  {
    bill: "H.R. 123 - Tech Regulation Act",
    politician: "John Smith",
    vote: "Yes",
    date: "2024-12-15",
    relatedDonors: [
      { name: "Tech Corp Inc", amount: 50000 },
      { name: "Digital Solutions LLC", amount: 25000 },
    ]
  },
  {
    bill: "S. 456 - Energy Policy Reform",
    politician: "Jane Doe",
    vote: "No",
    date: "2024-11-30",
    relatedDonors: [
      { name: "Energy Solutions LLC", amount: 75000 },
      { name: "Clean Power Co", amount: 40000 },
    ]
  },
];

export default function VotingRecords() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Voting Records Analysis</CardTitle>
            <CardDescription>
              Examine voting patterns and their correlation with financial contributions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search bills or politicians..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="tech">Technology</SelectItem>
                  <SelectItem value="energy">Energy</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                </SelectContent>
              </Select>
              <Button>Search</Button>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {mockVotingData.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>
                    <div className="grid grid-cols-4 w-full">
                      <span>{item.bill}</span>
                      <span>{item.politician}</span>
                      <span className={`font-medium ${
                        item.vote === "Yes" ? "text-green-600" : "text-red-600"
                      }`}>
                        {item.vote}
                      </span>
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Related Financial Contributions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Donor</TableHead>
                              <TableHead>Amount</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {item.relatedDonors.map((donor, donorIndex) => (
                              <TableRow key={donorIndex}>
                                <TableCell>{donor.name}</TableCell>
                                <TableCell>${donor.amount.toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Voting Patterns</CardTitle>
              <CardDescription>Analysis of voting patterns by category</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Add visualization component here */}
              <p className="text-sm text-gray-500">Visualization coming soon...</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vote-Donation Correlation</CardTitle>
              <CardDescription>Correlation between votes and financial contributions</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Add visualization component here */}
              <p className="text-sm text-gray-500">Visualization coming soon...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
