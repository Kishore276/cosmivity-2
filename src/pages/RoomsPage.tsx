import React, { useState, useEffect } from 'react';
import CreateRoomPage from './CreateRoomPage';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import Room from '@/components/Room';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/components/ui/use-toast';
import { roomsService, generateRoomKey, Room as RoomType } from '@/lib/firebase-services';
import {
  Video,
  Users,
  Plus,
  Lock,
  Globe,
  Loader2,
  Key
} from 'lucide-react';

// Local page component for joining private rooms
export function JoinPrivateRoomPage() {
  const [privateRoomKey, setPrivateRoomKey] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const { user, firebaseUser } = useUser();
  const { toast } = useToast();

  const handleJoinPrivateRoom = async () => {
    if (!privateRoomKey.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a room key."
      });
      return;
    }
    if (!firebaseUser) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to join a room."
      });
      return;
    }
    setLoading(true);
    try {
      const room = await roomsService.getRoomByKey(privateRoomKey.toUpperCase());
      if (room) {
        await roomsService.joinRoom(room.id, firebaseUser.uid, user.name || 'Anonymous');
        navigate(`/rooms/${room.id}`);
        setPrivateRoomKey('');
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Room not found. Please check the room key."
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to join room. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Join Private Room</h2>
        <Input value={privateRoomKey} onChange={e => setPrivateRoomKey(e.target.value)} placeholder="Enter room key" />
        <Button className="w-full mt-4" onClick={handleJoinPrivateRoom} disabled={!privateRoomKey.trim() || loading}>
          {loading ? 'Joining...' : 'Join Room'}
        </Button>
      </Card>
    </div>
  );
}

function RoomsList() {
  // Google Meet style join modal state
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [createRoomLoading, setCreateRoomLoading] = useState(false);

  // Preview camera/mic when modal opens
  React.useEffect(() => {
    if (showJoinModal) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => setMediaStream(stream))
        .catch(() => setMediaStream(null));
    } else {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
      }
    }
  }, [showJoinModal]);

  const handleOpenJoinModal = (room: RoomType) => {
    setSelectedRoom(room);
    setShowJoinModal(true);
  };

  const handleJoinRoomGoogleMeetStyle = async () => {
    if (!firebaseUser || !selectedRoom) return;
    setShowJoinModal(false);
    // Optionally pass camera/mic state to backend or context
    await roomsService.joinRoom(selectedRoom.id, firebaseUser.uid, user.name || 'Anonymous');
    navigate(`/rooms/${selectedRoom.id}`);
  };
  const { user, firebaseUser } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [privateRoomKey, setPrivateRoomKey] = useState('');
  const [publicRooms, setPublicRooms] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(false);

  // Subscribe to real-time public rooms
  useEffect(() => {
    if (!firebaseUser) return;
    const unsubscribePublic = roomsService.subscribeToPublicRooms((rooms) => {
      setPublicRooms(rooms);
    });

    // Periodic cleanup to ensure participant counts are accurate
    const cleanupInterval = setInterval(async () => {
      try {
        // Clean up stale participants for all public rooms
        for (const room of publicRooms) {
          await roomsService.cleanupStaleParticipants(room.id);
        }
      } catch (error) {
        console.warn('Error during periodic cleanup:', error);
      }
    }, 30000); // Run every 30 seconds

    return () => {
      unsubscribePublic();
      clearInterval(cleanupInterval);
    };
  }, [firebaseUser, publicRooms]);

  // Google Meet style join logic will be implemented here

  // Google Meet style private room join logic will be implemented here

  const handleCreateRoom = async (type: 'public' | 'private') => {
    if (!firebaseUser) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to create a room."
      });
      return;
    }

    setCreateRoomLoading(true);
    try {
      const roomKey = type === 'private' ? await generateRoomKey() : undefined;
      const roomData: any = {
        name: `${user.name?.split(' ')[0] || 'User'}'s ${type === 'public' ? 'Public' : 'Private'} Room`,
        description: `A ${type} study room`,
        type,
        topic: 'General Study',
        hostId: firebaseUser.uid,
        hostName: user.name || 'Anonymous',
        maxParticipants: 10,
        isActive: true
      };
      if (roomKey) {
        roomData.roomKey = roomKey;
      }

      const roomId = await roomsService.createRoom(roomData);

      if (type === 'private' && roomKey) {
        toast({
          title: "Private Room Created!",
          description: `Room Key: ${roomKey}. Share this key with others to join.`
        });
      } else {
        toast({
          title: "Public Room Created!",
          description: "Your room is now visible to everyone."
        });
      }

      // Navigate to the created room
      navigate(`/rooms/${roomId}`);
    } catch (error) {
      console.error('Room creation error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to create room: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setCreateRoomLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">Study Rooms</h1>
          <div className="flex gap-4">
            <Button onClick={() => navigate('/create-room')} variant="default">Create Room</Button>
            <Button onClick={() => navigate('/join-private-room')} variant="outline">Join Private Room</Button>
          </div>
        </div>
        {/* Public Rooms Only */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Public Rooms</h3>
            <Badge variant="secondary">{publicRooms.length} active</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publicRooms.map((room) => (
              <Card key={room.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{room.name}</h4>
                        <Globe className="h-4 w-4 text-green-600" />
                      </div>
                      <p className="text-sm text-muted-foreground">Topic: {room.topic}</p>
                      <p className="text-sm text-muted-foreground">Host: {room.hostName}</p>
                      <p className="text-sm text-muted-foreground">{room.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {room.participants.length}/{room.maxParticipants}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleOpenJoinModal(room)}
                      disabled={room.participants.length >= room.maxParticipants}
                    >
                      {room.participants.length >= room.maxParticipants ? 'Full' : 'Join'}
                    </Button>
  {/* Google Meet style join modal */}
  {showJoinModal && selectedRoom && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <Card className="p-8 w-full max-w-md relative">
        <button className="absolute top-4 right-4 text-muted-foreground" onClick={() => setShowJoinModal(false)}>
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4">Join Room: {selectedRoom.name}</h2>
        <div className="mb-4 flex flex-col items-center">
          {mediaStream ? (
            <video
              autoPlay
              playsInline
              muted
              className="rounded-lg w-48 h-32 bg-black mb-2"
              ref={video => { if (video && mediaStream) video.srcObject = mediaStream; }}
              style={{ display: cameraEnabled ? 'block' : 'none' }}
            />
          ) : (
            <div className="w-48 h-32 bg-muted flex items-center justify-center rounded-lg mb-2">No Camera</div>
          )}
          <div className="flex gap-4">
            <Button variant={cameraEnabled ? 'default' : 'outline'} onClick={() => setCameraEnabled(v => !v)}>
              {cameraEnabled ? 'Camera On' : 'Camera Off'}
            </Button>
            <Button variant={micEnabled ? 'default' : 'outline'} onClick={() => setMicEnabled(v => !v)}>
              {micEnabled ? 'Mic On' : 'Mic Off'}
            </Button>
          </div>
        </div>
        <Button className="w-full" onClick={handleJoinRoomGoogleMeetStyle}>
          Enter Room
        </Button>
      </Card>
    </div>
  )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {publicRooms.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No public rooms available. Create one to get started!</p>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default function RoomsPage() {
  return (
    <Routes>
      <Route path="/" element={<RoomsList />} />
  <Route path="/create-room" element={<CreateRoomPage />} />
  <Route path="/join-private-room" element={<JoinPrivateRoomPage />} />
      <Route path=":roomId" element={<Room />} />
    </Routes>
  );
}
