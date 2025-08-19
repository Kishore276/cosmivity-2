


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/components/ui/use-toast';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface JoinRoomDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function JoinRoomDialog({ open, onOpenChange }: JoinRoomDialogProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleJoin = async () => {
    if (!code.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter a room code.' });
      return;
    }
    setLoading(true);

    try {
      const roomsRef = collection(db, 'rooms');
      const q = query(roomsRef, where("type", "==", "private"), where("roomKey", "==", code.toUpperCase()));

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({ variant: 'destructive', title: 'Not Found', description: 'No private room found with that code.' });
      } else {
        const roomDoc = querySnapshot.docs[0];
        navigate(`/rooms/${roomDoc.id}`);
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error joining room:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not join room. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join a Private Room</DialogTitle>
          <DialogDescription>
            Enter the 6-character code for the private room you want to join.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="room-code" className="text-right">
              Code
            </Label>
            <Input
              id="room-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="col-span-3"
              maxLength={6}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" onClick={handleJoin} disabled={loading}>
            {loading ? 'Joining...' : 'Find and Join Room'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
