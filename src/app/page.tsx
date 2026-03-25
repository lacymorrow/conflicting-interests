'use client';

import { useState, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VisualizationDashboard } from "@/components/financial/visualization-dashboard";
import { BillTracker } from "@/components/legislative/bill-tracker";
import { ActionCenter } from "@/components/action/action-center";
import { LearningCenter } from "@/components/education/learning-center";
import { searchPoliticians } from './actions/search';
import Link from 'next/link';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = useCallback(async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await searchPoliticians(query);
      console.log('Search results:', results);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching politicians:', error);
      setSearchResults([]);
    }
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="w-full max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Political Transparency Platform</h1>
          <p className="text-xl text-gray-600">
            Track financial connections and voting patterns of politicians
          </p>
        </div>

        <div className="mb-8">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search for a politician..."
              className="w-full"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {searchResults.length > 0 && (
            <div className="mt-4 space-y-4">
              {searchResults.map((result) => (
                <Link
                  key={result.id}
                  href={`/politicians/${result.id}`}
                  className="block p-4 rounded-lg border hover:border-primary transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">{result.name}</h3>
                      <p className="text-sm text-gray-600">
                        {result.party} • {result.state}
                      </p>
                    </div>
                    {result.stats && (
                      <div className="text-sm text-gray-600">
                        <p>{result.stats.contributions} contributions</p>
                        <p>{result.stats.investments} investments</p>
                        <p>{result.stats.expenditures} expenditures</p>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
