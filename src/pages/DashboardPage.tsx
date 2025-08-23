import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/context/UserContext';
import { roomsService, Room } from '@/lib/firebase-services';
import { enhancedPracticeService } from '@/lib/enhanced-practice-service';
import PracticeAnalytics from '@/components/PracticeAnalytics';
import { Video, Users, Globe, Lock, BookOpen, TrendingUp, Target, Brain } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user, firebaseUser, loading } = useUser();
  const navigate = useNavigate();
  const [joinedRooms, setJoinedRooms] = useState<Room[]>([]);
  const [practiceStats, setPracticeStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Authentication guard
  useEffect(() => {
    if (!loading && !firebaseUser) {
      navigate('/auth');
    }
  }, [firebaseUser, loading, navigate]);

  // Subscribe to user's joined rooms
  useEffect(() => {
    if (!firebaseUser) return;

    const unsubscribe = roomsService.subscribeToUserRooms(firebaseUser.uid, (rooms) => {
      setJoinedRooms(rooms);
    });

    return () => unsubscribe();
  }, [firebaseUser]);

  // Load practice statistics
  useEffect(() => {
    if (!firebaseUser) return;

    const loadPracticeStats = async () => {
      try {
        const stats = await enhancedPracticeService.getSessionAnalytics(firebaseUser.uid, 'week');
        setPracticeStats(stats);
      } catch (error) {
        console.error('Error loading practice stats:', error);
      }
    };

    loadPracticeStats();
  }, [firebaseUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!firebaseUser) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Welcome back, {user.name?.split(' ')[0] || 'Student'}! 👋
            </h1>
            <p className="text-muted-foreground mt-2">
              Your learning dashboard
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline" className="flex-shrink-0">
              <Link to="/practice">
                <BookOpen className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Start </span>Practice
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-shrink-0">
              <Link to="/rooms">
                <Video className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Join </span>Rooms
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        {practiceStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sessions</p>
                  <p className="text-xl font-bold">{practiceStats.totalSessions}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                  <p className="text-xl font-bold">{practiceStats.averageScore.toFixed(0)}%</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Brain className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                  <p className="text-xl font-bold">{practiceStats.accuracy.toFixed(0)}%</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Questions</p>
                  <p className="text-xl font-bold">{practiceStats.totalQuestions}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">

            {/* User Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Your Information</h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Name:</span> {user.name || 'Not provided'}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Email:</span> {user.email || 'Not provided'}
                </p>
                {user.title && (
                  <p className="text-sm">
                    <span className="font-medium">Title:</span> {user.title}
                  </p>
                )}
                {user.college && (
                  <p className="text-sm">
                    <span className="font-medium">Education:</span> {user.college}
                  </p>
                )}
              </div>
              <div className="mt-4">
                <Button asChild variant="outline" size="sm">
                  <Link to="/profile">
                    Edit Profile
                  </Link>
                </Button>
              </div>
            </Card>

          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <PracticeAnalytics timeframe="month" />
          </TabsContent>

          <TabsContent value="rooms" className="mt-6">
            {/* Joined Rooms */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Rooms You've Joined</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{joinedRooms.length}</Badge>
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
          {joinedRooms.length > 0 ? (
            <div className="space-y-3">
              {joinedRooms.map((room) => (
                <div key={room.id} className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{room.name}</p>
                        {room.type === 'private' ? (
                          <Lock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        ) : (
                          <Globe className="h-4 w-4 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">Topic: {room.topic}</p>
                      <p className="text-sm text-muted-foreground truncate">Host: {room.hostName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {room.participants.length}/{room.maxParticipants} participants
                        </span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" asChild className="flex-shrink-0">
                      <Link to={`/rooms/${room.id}`}>
                        Enter
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">You haven't joined any rooms yet</p>
              <Button asChild>
                <Link to="/rooms">
                  <Video className="h-4 w-4 mr-2" />
                  Browse Rooms
                </Link>
              </Button>
              </div>
            )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
