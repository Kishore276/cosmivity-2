import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/context/UserContext';
import { enhancedPracticeService } from '@/lib/enhanced-practice-service';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  Target,
  Clock,
  Award,
  BookOpen,
  Users,
  Calendar,
  Trophy,
  Brain,
  Zap
} from 'lucide-react';

interface AnalyticsData {
  totalSessions: number;
  totalTimeSpent: number;
  averageScore: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  sessions: any[];
}

interface PracticeAnalyticsProps {
  timeframe?: 'week' | 'month' | 'year';
}

export default function PracticeAnalytics({ timeframe = 'month' }: PracticeAnalyticsProps) {
  const { firebaseUser } = useUser();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);

  useEffect(() => {
    if (firebaseUser) {
      loadAnalytics();
    }
  }, [firebaseUser, selectedTimeframe]);

  const loadAnalytics = async () => {
    if (!firebaseUser) return;
    
    setLoading(true);
    try {
      const data = await enhancedPracticeService.getSessionAnalytics(firebaseUser.uid, selectedTimeframe);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <Card className="p-8 text-center">
        <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Practice Data Yet</h3>
        <p className="text-muted-foreground">Start practicing to see your analytics and progress!</p>
      </Card>
    );
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const performanceData = analyticsData.sessions.slice(0, 10).reverse().map((session, index) => ({
    session: `Session ${index + 1}`,
    score: session.score,
    accuracy: (session.correctAnswers / session.totalQuestions) * 100,
    timeSpent: session.duration / 60 // Convert to minutes
  }));

  const difficultyData = [
    { name: 'Easy', value: 30, color: '#10B981' },
    { name: 'Medium', value: 50, color: '#F59E0B' },
    { name: 'Hard', value: 20, color: '#EF4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Timeframe Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Practice Analytics</h2>
        <Tabs value={selectedTimeframe} onValueChange={(value: any) => setSelectedTimeframe(value)}>
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
              <p className="text-2xl font-bold">{analyticsData.totalSessions}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Score</p>
              <p className="text-2xl font-bold">{analyticsData.averageScore.toFixed(1)}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Time Spent</p>
              <p className="text-2xl font-bold">{formatTime(analyticsData.totalTimeSpent)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Zap className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Accuracy</p>
              <p className="text-2xl font-bold">{analyticsData.accuracy.toFixed(1)}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="session" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Score (%)"
              />
              <Line 
                type="monotone" 
                dataKey="accuracy" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Accuracy (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Difficulty Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Question Difficulty
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={difficultyData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {difficultyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Recent Sessions
        </h3>
        <div className="space-y-3">
          {analyticsData.sessions.slice(0, 5).map((session, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">{session.type} Session</p>
                  <p className="text-sm text-muted-foreground">
                    {session.totalQuestions} questions • {formatTime(session.duration)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={session.score >= 80 ? 'default' : session.score >= 60 ? 'secondary' : 'destructive'}>
                  {session.score}%
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  {session.correctAnswers}/{session.totalQuestions} correct
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Progress Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Progress Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{analyticsData.accuracy.toFixed(0)}%</span>
            </div>
            <Progress value={analyticsData.accuracy} className="h-2" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Questions Answered</span>
              <span className="text-sm text-muted-foreground">{analyticsData.totalQuestions}</span>
            </div>
            <Progress value={Math.min((analyticsData.totalQuestions / 1000) * 100, 100)} className="h-2" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Study Time</span>
              <span className="text-sm text-muted-foreground">{formatTime(analyticsData.totalTimeSpent)}</span>
            </div>
            <Progress value={Math.min((analyticsData.totalTimeSpent / 36000) * 100, 100)} className="h-2" />
          </div>
        </div>
      </Card>
    </div>
  );
}
