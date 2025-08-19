import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/components/ui/use-toast';
import { roomsService, generateRoomKey } from '@/lib/firebase-services';

export default function CreateRoomPage() {
  const { user, firebaseUser } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [roomType, setRoomType] = useState<'public' | 'private'>('public');
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [roomKey, setRoomKey] = useState<string | null>(null);

  const handleCreateRoom = async () => {
    if (!firebaseUser || !roomName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a room name and login.'
      });
      return;
    }
    setLoading(true);
    let didTimeout = false;
    const timeout = setTimeout(() => {
      didTimeout = true;
      setLoading(false);
      toast({
        variant: 'destructive',
        title: 'Network Timeout',
        description: 'Room creation is taking too long. Please check your connection or try again later.'
      });
    }, 8000); // 8 seconds
    try {
      let key: string | undefined = undefined;
      if (roomType === 'private') {
        key = await generateRoomKey();
        setRoomKey(key);
      }
      const roomData: any = {
        name: roomName,
        description: `A ${roomType} study room`,
        type: roomType,
        topic: 'General Study',
        hostId: firebaseUser.uid,
        hostName: user.name || 'Anonymous',
        maxParticipants: 10,
        isActive: true
      };
      if (key) roomData.roomKey = key;
      const roomId = await roomsService.createRoom(roomData);
      clearTimeout(timeout);
      if (didTimeout) return;
      toast({
        title: 'Room Created!',
        description: roomType === 'private' ? `Room Key: ${key}` : 'Your room is now visible to everyone.'
      });
      navigate(`/rooms/${roomId}`);
    } catch (error) {
      clearTimeout(timeout);
      if (didTimeout) return;
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create room.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Create a Room</h2>
        <div className="mb-4">
          <label className="block mb-2 font-medium">Room Type</label>
          <div className="flex gap-4">
            <Button variant={roomType === 'public' ? 'default' : 'outline'} onClick={() => setRoomType('public')}>Public</Button>
            <Button variant={roomType === 'private' ? 'default' : 'outline'} onClick={() => setRoomType('private')}>Private</Button>
          </div>
        </div>
        <div className="mb-6">
          <label className="block mb-2 font-medium">Room Name</label>
          <Input value={roomName} onChange={e => setRoomName(e.target.value)} placeholder="Enter room name" />
        </div>
        <Button className="w-full" onClick={handleCreateRoom} disabled={loading || !roomName.trim()}>
          {loading ? 'Creating...' : 'Create Room'}
        </Button>
        {roomKey && (
          <div className="mt-4 text-center">
            <span className="font-mono bg-muted px-2 py-1 rounded">Room Key: {roomKey}</span>
          </div>
        )}
      </Card>
    </div>
  );
}
