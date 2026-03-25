'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Book,
  GraduationCap,
  LineChart,
  Building2,
  Users,
  Scale,
  DollarSign,
  CheckCircle,
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  modules: number;
  completedModules: number;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'guide';
  source: string;
  url: string;
}

export function LearningCenter() {
  const [courses] = useState<Course[]>([
    {
      id: '1',
      title: 'Understanding Campaign Finance',
      description: 'Learn the basics of how money flows through political campaigns and what it means for democracy.',
      modules: 5,
      completedModules: 2,
      duration: '2 hours',
      level: 'beginner',
      category: 'Campaign Finance',
    },
    {
      id: '2',
      title: 'Identifying Conflicts of Interest',
      description: 'Master the skills needed to spot and analyze potential conflicts of interest in government.',
      modules: 4,
      completedModules: 0,
      duration: '1.5 hours',
      level: 'intermediate',
      category: 'Ethics',
    },
    {
      id: '3',
      title: 'Advanced Lobbying Analysis',
      description: 'Deep dive into lobbying disclosure data and its impact on legislation.',
      modules: 6,
      completedModules: 0,
      duration: '3 hours',
      level: 'advanced',
      category: 'Lobbying',
    },
  ]);

  const [resources] = useState<Resource[]>([
    {
      id: '1',
      title: 'Guide to Political Action Committees (PACs)',
      description: 'Understanding the role and influence of PACs in American politics.',
      type: 'guide',
      source: 'Federal Election Commission',
      url: '#',
    },
    {
      id: '2',
      title: 'Tracking Money in Politics',
      description: 'How to use public databases to follow campaign contributions.',
      type: 'video',
      source: 'OpenSecrets',
      url: '#',
    },
    {
      id: '3',
      title: 'Ethics in Government: A Primer',
      description: 'Overview of ethics rules and regulations for government officials.',
      type: 'article',
      source: 'Congressional Research Service',
      url: '#',
    },
  ]);

  const getLevelColor = (level: Course['level']) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-500';
      case 'intermediate':
        return 'bg-yellow-500';
      case 'advanced':
        return 'bg-red-500';
    }
  };

  const getTypeIcon = (type: Resource['type']) => {
    switch (type) {
      case 'article':
        return <Book className="w-4 h-4" />;
      case 'video':
        return <LineChart className="w-4 h-4" />;
      case 'guide':
        return <GraduationCap className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Learning Center</h2>
        <p className="text-muted-foreground">
          Build your knowledge about government transparency and accountability
        </p>
      </div>

      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="glossary">Glossary</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{course.title}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                  </div>
                  <Badge className={getLevelColor(course.level)}>
                    {course.level}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>{course.duration}</span>
                    <span>{course.completedModules} of {course.modules} modules completed</span>
                  </div>
                  <Progress
                    value={(course.completedModules / course.modules) * 100}
                  />
                  <div className="flex gap-2">
                    <Button className="flex-1">
                      {course.completedModules === 0 ? 'Start Course' : 'Continue Course'}
                    </Button>
                    <Button variant="outline" className="flex-1">
                      View Syllabus
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          {resources.map((resource) => (
            <Card key={resource.id}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-muted rounded-lg">
                    {getTypeIcon(resource.type)}
                  </div>
                  <div>
                    <CardTitle>{resource.title}</CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Source: {resource.source}
                  </span>
                  <Button variant="outline" size="sm">
                    View Resource
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="glossary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Political Finance Glossary</CardTitle>
              <CardDescription>
                Key terms and concepts in political finance and government ethics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">PAC (Political Action Committee)</h3>
                  <p className="text-sm text-muted-foreground">
                    An organization that pools campaign contributions and donates them to
                    political candidates or parties.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Dark Money</h3>
                  <p className="text-sm text-muted-foreground">
                    Political spending by nonprofit organizations that are not required
                    to disclose their donors.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Lobbying</h3>
                  <p className="text-sm text-muted-foreground">
                    The act of attempting to influence decisions made by government
                    officials, often on behalf of special interest groups.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
