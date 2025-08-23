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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/components/ui/use-toast';
import { roomsService, generateRoomKey, Room as RoomType } from '@/lib/firebase-services';
import { enhancedPracticeService } from '@/lib/enhanced-practice-service';
import { PracticeSubject } from '@/lib/enhanced-practice-data';
import {
  Video,
  VideoOff,
  Users,
  Plus,
  Lock,
  Globe,
  Loader2,
  Key,
  Settings,
  Clock,
  Target,
  BookOpen,
  Trophy,
  Mic,
  MicOff
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

  // Enhanced room creation state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [practiceSubjects, setPracticeSubjects] = useState<PracticeSubject[]>([]);
  const [roomSettings, setRoomSettings] = useState({
    name: '',
    type: 'public' as 'public' | 'private',
    maxParticipants: 10
  });

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

  // Load practice subjects on component mount
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const subjects = await enhancedPracticeService.getSubjects();
        setPracticeSubjects(subjects);
      } catch (error) {
        console.error('Error loading practice subjects:', error);
      }
    };
    loadSubjects();
  }, []);

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

  const handleCreateRoom = async () => {
    if (!firebaseUser) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to create a room."
      });
      return;
    }
    if (!roomSettings.name.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Room name is required."
      });
      return;
    }
    setCreateRoomLoading(true);
    try {
  const roomKey = roomSettings.type === 'private' ? await generateRoomKey() : '';
      const newRoom = {
        name: roomSettings.name,
        description: '',
        type: roomSettings.type,
        topic: '',
        hostId: firebaseUser.uid,
        hostName: user.name || 'Anonymous',
        maxParticipants: roomSettings.maxParticipants,
        roomKey: roomKey,
        isActive: true,
      };
      const roomId = await roomsService.createRoom(newRoom);
      setShowCreateModal(false);
      setRoomSettings({ name: '', type: 'public', maxParticipants: 10 });
      toast({
        variant: "success",
        title: "Room Created",
        description: roomSettings.type === 'private' ? `Room key: ${roomKey}` : 'Room created successfully.'
      });
      navigate(`/rooms/${roomId}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create room. Please try again."
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
            <Button onClick={() => setShowCreateModal(true)} variant="default">
              <Plus className="h-4 w-4 mr-2" />
              Create Room
            </Button>
            <Button onClick={() => navigate('/join-private-room')} variant="outline">
              <Key className="h-4 w-4 mr-2" />
              Join Private Room
            </Button>
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
                      <p className="text-sm text-muted-foreground">Host: {room.hostName}</p>
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

        {/* Join Room Modal */}
        {showJoinModal && selectedRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <Card className="w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Join "{selectedRoom.name}"</h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowJoinModal(false)}>
                    ✕
                  </Button>
                </div>
                
                {/* Camera/Mic Preview */}
                <div className="mb-6">
                  <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
                    {mediaStream ? (
                      <video
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                        ref={(video) => {
                          if (video && mediaStream) {
                            video.srcObject = mediaStream;
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <Video className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                          <p className="text-gray-400">Camera not available</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Media Controls */}
                  <div className="flex justify-center gap-4">
                    <Button
                      variant={micEnabled ? "default" : "destructive"}
                      size="sm"
                      onClick={() => setMicEnabled(!micEnabled)}
                    >
                      {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant={cameraEnabled ? "default" : "destructive"}
                      size="sm"
                      onClick={() => setCameraEnabled(!cameraEnabled)}
                    >
                      {cameraEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Room Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Host: {selectedRoom.hostName}</p>
                  <p className="text-sm text-gray-600">
                    Participants: {selectedRoom.participants.length}/{selectedRoom.maxParticipants}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setShowJoinModal(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleJoinRoomGoogleMeetStyle} className="flex-1">
                    Join Room
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Enhanced Room Creation Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Create Study Room</h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}>
                    ✕
                  </Button>
                </div>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleCreateRoom();
                  }}
                >
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="roomName">Room Name</Label>
                        <Input
                          id="roomName"
                          value={roomSettings.name}
                          onChange={(e) => setRoomSettings(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter room name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="roomType">Room Type</Label>
                        <Select
                          value={roomSettings.type}
                          onValueChange={(value: 'public' | 'private') =>
                            setRoomSettings(prev => ({ ...prev, type: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                Public - Anyone can join
                              </div>
                            </SelectItem>
                            <SelectItem value="private">
                              <div className="flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                Private - Requires room key
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="maxParticipants">Max Participants</Label>
                        <Select
                          value={roomSettings.maxParticipants.toString()}
                          onValueChange={(value) => setRoomSettings(prev => ({ ...prev, maxParticipants: parseInt(value) }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[5, 10, 15, 20, 25, 30].map((num) => (
                              <SelectItem key={num} value={num.toString()}>{num} participants</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-4 pt-4">
                    <Button variant="outline" type="button" onClick={() => setShowCreateModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createRoomLoading || !roomSettings.name.trim()}>
                      {createRoomLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Room
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function RoomsPage() {
  const { firebaseUser, loading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !firebaseUser) {
      navigate('/auth');
    }
  }, [firebaseUser, loading, navigate]);

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
    <Routes>
      <Route path="/" element={<RoomsList />} />
  <Route path="/create-room" element={<CreateRoomPage />} />
  <Route path="/join-private-room" element={<JoinPrivateRoomPage />} />
      <Route path=":roomId" element={<Room />} />
    </Routes>
  );
}
