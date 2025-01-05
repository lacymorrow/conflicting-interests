'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Phone, MapPin, Calendar, AlertTriangle } from 'lucide-react';

interface Campaign {
  id: string;
  title: string;
  description: string;
  type: 'local' | 'state' | 'federal';
  status: 'active' | 'planning' | 'completed';
  participants: number;
  location: string;
  date: string;
}

export function ActionCenter() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: '1',
      title: 'Stop Stock Trading by Congress',
      description: 'Campaign to support legislation banning members of Congress from trading individual stocks while in office.',
      type: 'federal',
      status: 'active',
      participants: 1250,
      location: 'Nationwide',
      date: '2025-02-15',
    },
    {
      id: '2',
      title: 'Transparency in Local Government',
      description: 'Initiative to implement stricter disclosure requirements for local government officials.',
      type: 'local',
      status: 'planning',
      participants: 450,
      location: 'Boston, MA',
      date: '2025-03-01',
    },
  ]);

  const [showNewCampaignDialog, setShowNewCampaignDialog] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    description: '',
    type: 'local',
    location: '',
    date: '',
  });

  const handleCreateCampaign = () => {
    // In a real app, this would make an API call
    const campaign: Campaign = {
      id: String(campaigns.length + 1),
      ...newCampaign,
      status: 'planning',
      participants: 0,
    };
    setCampaigns([...campaigns, campaign]);
    setShowNewCampaignDialog(false);
  };

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'planning':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-blue-500';
    }
  };

  const getTypeColor = (type: Campaign['type']) => {
    switch (type) {
      case 'federal':
        return 'bg-purple-500';
      case 'state':
        return 'bg-orange-500';
      case 'local':
        return 'bg-teal-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Action Center</h2>
          <p className="text-muted-foreground">
            Join or create campaigns to drive change in government transparency
          </p>
        </div>
        <Dialog open={showNewCampaignDialog} onOpenChange={setShowNewCampaignDialog}>
          <DialogTrigger asChild>
            <Button>Create Campaign</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>
                Start a new campaign to address conflicts of interest in government
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Campaign Title"
                  value={newCampaign.title}
                  onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                />
              </div>
              <div>
                <Textarea
                  placeholder="Campaign Description"
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Location"
                  value={newCampaign.location}
                  onChange={(e) => setNewCampaign({ ...newCampaign, location: e.target.value })}
                />
                <Input
                  type="date"
                  value={newCampaign.date}
                  onChange={(e) => setNewCampaign({ ...newCampaign, date: e.target.value })}
                />
              </div>
              <Button onClick={handleCreateCampaign} className="w-full">
                Create Campaign
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{campaign.title}</CardTitle>
                <div className="flex gap-2">
                  <Badge className={getTypeColor(campaign.type)}>
                    {campaign.type}
                  </Badge>
                  <Badge className={getStatusColor(campaign.status)}>
                    {campaign.status}
                  </Badge>
                </div>
              </div>
              <CardDescription>{campaign.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {campaign.participants} participants
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {campaign.location}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4" />
                  Start Date: {campaign.date}
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1">
                    <Users className="w-4 h-4 mr-2" />
                    Join Campaign
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Mail className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Ethics Violations</CardTitle>
          <CardDescription>
            Submit information about potential ethics violations or conflicts of interest
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-500">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm">
                All reports are confidential and will be reviewed by our team
              </span>
            </div>
            <div className="space-y-2">
              <Input placeholder="Title of the violation" />
              <Textarea placeholder="Describe the potential violation or conflict of interest..." />
              <Input placeholder="Relevant links or documentation" />
            </div>
            <Button className="w-full">Submit Report</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
