import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/context/UserContext';
import { roomsService, Room } from '@/lib/firebase-services';
import { Video, Users, Globe, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { user, firebaseUser } = useUser();
  const [joinedRooms, setJoinedRooms] = useState<Room[]>([]);

  // Subscribe to user's joined rooms
  useEffect(() => {
    if (!firebaseUser) return;

    const unsubscribe = roomsService.subscribeToUserRooms(firebaseUser.uid, (rooms) => {
      setJoinedRooms(rooms);
    });

    return () => unsubscribe();
  }, [firebaseUser]);

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
              <Link to="/rooms">
                <Video className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Go to </span>Rooms
              </Link>
            </Button>
          </div>
        </div>

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
          </div>
        </Card>

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
      </div>
    </DashboardLayout>
  );
}
