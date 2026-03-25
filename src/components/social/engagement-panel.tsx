'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Twitter,
  Facebook,
  Share2,
  AlertTriangle,
  ThumbsUp,
  MessageCircle
} from 'lucide-react';

interface EngagementPanelProps {
  politicianName?: string;
  conflictData?: {
    type: string;
    description: string;
    evidence: string[];
  };
}

export function EngagementPanel({ politicianName, conflictData }: EngagementPanelProps) {
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportData, setReportData] = useState({
    title: '',
    description: '',
    evidence: '',
  });

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = conflictData 
    ? `Check out this potential conflict of interest involving ${politicianName}: ${conflictData.description}`
    : `Explore political conflicts of interest on Conflicting Interests`;

  const handleShare = (platform: 'twitter' | 'facebook') => {
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  const handleReport = async () => {
    // In a real app, this would submit to an API endpoint
    console.log('Submitting report:', reportData);
    setShowReportDialog(false);
    // Add success notification
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Take Action</CardTitle>
          <CardDescription>
            Share findings and report potential conflicts of interest
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex space-x-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleShare('twitter')}
              >
                <Twitter className="w-4 h-4 mr-2" />
                Share on Twitter
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleShare('facebook')}
              >
                <Facebook className="w-4 h-4 mr-2" />
                Share on Facebook
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  // Add success notification
                }}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </div>

            <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Report Conflict of Interest
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Report a Conflict of Interest</DialogTitle>
                  <DialogDescription>
                    Provide details about the potential conflict of interest you've identified.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Input
                      placeholder="Title of your report"
                      value={reportData.title}
                      onChange={(e) => setReportData({ ...reportData, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Textarea
                      placeholder="Describe the potential conflict of interest..."
                      value={reportData.description}
                      onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div>
                    <Textarea
                      placeholder="Provide any evidence or sources..."
                      value={reportData.evidence}
                      onChange={(e) => setReportData({ ...reportData, evidence: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleReport} className="w-full">
                    Submit Report
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Community Engagement</CardTitle>
          <CardDescription>
            Connect with others and discuss findings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button variant="outline" className="flex-1">
              <ThumbsUp className="w-4 h-4 mr-2" />
              Support Investigation
            </Button>
            <Button variant="outline" className="flex-1">
              <MessageCircle className="w-4 h-4 mr-2" />
              Join Discussion
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
