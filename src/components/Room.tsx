import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/components/ui/use-toast';
import { roomsService, RoomMessage } from '@/lib/firebase-services';
import { useWebRTC, Participant } from '@/hooks/useWebRTC';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  MessageSquare,
  Send,
  Users,
  Crown,
  ArrowLeft,
  Copy
} from 'lucide-react';

// Component for rendering participant video - Google Meet style
function ParticipantVideo({
  participant,
  room,
  isLocal = false,
  localVideoRef,
  isMainView = false
}: {
  participant: Participant;
  room: any;
  isLocal?: boolean;
  localVideoRef?: React.RefObject<HTMLVideoElement>;
  isMainView?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isLocal && videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
      // Ensure remote video plays immediately
      videoRef.current.play().catch(e => console.log('Remote video autoplay prevented:', e));
    } else if (isLocal && localVideoRef?.current && participant.stream) {
      localVideoRef.current.srcObject = participant.stream;
      // Ensure local video plays immediately
      localVideoRef.current.play().catch(e => console.log('Local video autoplay prevented:', e));
    }
  }, [participant.stream, isLocal, localVideoRef]);

  return (
    <div
      className={`relative bg-gray-900 rounded-xl overflow-hidden group transition-all duration-200 shadow-lg border border-gray-700/50 ${
        isMainView
          ? 'aspect-video'
          : 'aspect-video'
      } ${
        participant.isSpeaking
          ? 'ring-2 ring-green-400 ring-opacity-75 border-green-400/50'
          : 'hover:ring-1 hover:ring-blue-400 hover:ring-opacity-50 hover:border-blue-400/50'
      }`}
    >
      {/* Video Element */}
      <video
        ref={isLocal ? localVideoRef : videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className="w-full h-full object-cover"
      />

      {/* Camera Off State */}
      {!participant.isCameraOn && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div className={`${isMainView ? 'w-24 h-24' : 'w-14 h-14'} bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mb-3 shadow-lg border border-gray-500/30`}>
            <span className={`${isMainView ? 'text-3xl' : 'text-xl'} font-bold text-white`}>
              {(isLocal ? 'You' : participant.name || 'User').charAt(0).toUpperCase()}
            </span>
          </div>
          {isMainView && (
            <span className="text-gray-300 text-base font-medium">
              {isLocal ? 'You' : participant.name}
            </span>
          )}
        </div>
      )}

      {/* Enhanced Participant Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
              <span className={`text-white font-medium truncate ${isMainView ? 'text-base' : 'text-sm'}`}>
                {isLocal ? 'You' : participant.name}
                {isLocal && <span className="ml-1 text-blue-400">•</span>}
              </span>
            </div>
            {participant.uid === room?.hostId && (
              <div className="bg-yellow-500/20 backdrop-blur-sm p-1.5 rounded-lg border border-yellow-400/30">
                <Crown className={`${isMainView ? 'h-4 w-4' : 'h-3 w-3'} text-yellow-400`} />
              </div>
            )}
          </div>

          {/* Enhanced Media Status Icons */}
          <div className="flex items-center gap-2">
            {participant.isMuted ? (
              <div className="bg-red-500/90 backdrop-blur-sm p-1.5 rounded-lg border border-red-400/30">
                <MicOff className={`${isMainView ? 'h-3.5 w-3.5' : 'h-3 w-3'} text-white`} />
              </div>
            ) : (
              participant.isSpeaking && (
                <div className="bg-green-500/90 backdrop-blur-sm p-1.5 rounded-lg border border-green-400/30 animate-pulse">
                  <Mic className={`${isMainView ? 'h-3.5 w-3.5' : 'h-3 w-3'} text-white`} />
                </div>
              )
            )}
            {!participant.isCameraOn && (
              <div className="bg-red-500/90 backdrop-blur-sm p-1.5 rounded-lg border border-red-400/30">
                <VideoOff className={`${isMainView ? 'h-3.5 w-3.5' : 'h-3 w-3'} text-white`} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Speaking Indicator */}
      {participant.isSpeaking && (
        <div className="absolute top-3 left-3">
          <div className="flex items-center gap-1.5 bg-green-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-medium border border-green-400/30">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Speaking
          </div>
        </div>
      )}

      {/* Connection Quality Indicator */}
      <div className="absolute top-3 right-3">
        <div className="flex gap-0.5 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
          <div className="w-1 h-2.5 bg-green-400 rounded-full"></div>
          <div className="w-1 h-2.5 bg-green-400 rounded-full"></div>
          <div className="w-1 h-2.5 bg-yellow-400 rounded-full"></div>
          <div className="w-1 h-2.5 bg-gray-500 rounded-full"></div>
        </div>
      </div>

      {/* Hover effect for thumbnails */}
      {!isMainView && (
        <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-all duration-200 rounded-xl"></div>
      )}
    </div>
  );
}

// Enhanced Google Meet Style Video Grid Component
function VideoGrid({
  participants,
  localVideoRef,
  firebaseUser,
  room,
  sidebarOpen
}: {
  participants: Participant[];
  localVideoRef: React.RefObject<HTMLVideoElement>;
  firebaseUser: any;
  room: any;
  sidebarOpen: boolean;
}) {
  const [mainParticipant, setMainParticipant] = useState<Participant | null>(null);

  // Get all participants
  const allParticipants = participants.filter(p => p.uid || p.userId);
  const totalCount = allParticipants.length;

  // Auto-select main participant (speaking participant or first participant)
  useEffect(() => {
    const speakingParticipant = allParticipants.find(p => p.isSpeaking);
    if (speakingParticipant && speakingParticipant.uid !== mainParticipant?.uid) {
      setMainParticipant(speakingParticipant);
    } else if (!mainParticipant && allParticipants.length > 0) {
      setMainParticipant(allParticipants[0]);
    }
  }, [allParticipants, mainParticipant]);

  // Enhanced grid layout calculations
  const getGridLayout = (count: number) => {
    if (count === 1) return {
      container: 'flex items-center justify-center',
      grid: 'w-full max-w-2xl', // Reduced from max-w-4xl to max-w-2xl for smaller single participant card
      cols: 'grid-cols-1'
    };
    if (count === 2) return {
      container: 'flex items-center justify-center',
      grid: 'w-full max-w-6xl',
      cols: 'grid-cols-1 lg:grid-cols-2'
    };
    if (count === 3) return {
      container: 'flex items-center justify-center',
      grid: 'w-full max-w-5xl',
      cols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    };
    if (count === 4) return {
      container: 'flex items-center justify-center',
      grid: 'w-full max-w-6xl',
      cols: 'grid-cols-2 lg:grid-cols-2'
    };
    if (count <= 6) return {
      container: 'flex items-center justify-center',
      grid: 'w-full max-w-7xl',
      cols: 'grid-cols-2 md:grid-cols-3'
    };
    if (count <= 9) return {
      container: 'flex items-center justify-center',
      grid: 'w-full max-w-7xl',
      cols: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-3'
    };
    return {
      container: 'flex items-center justify-center',
      grid: 'w-full max-w-7xl',
      cols: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
    };
  };

  // For 1-6 participants: Adaptive grid layout
  if (totalCount <= 6) {
    const layout = getGridLayout(totalCount);
    return (
      <div className={`h-[calc(100vh-140px)] ${layout.container} p-2 sm:p-4 lg:p-6 transition-all duration-300 ${
        sidebarOpen ? 'lg:mr-80' : ''
      }`}>
        <div className={`grid gap-4 ${layout.grid} ${layout.cols} ${totalCount === 1 ? 'max-h-96' : ''}`}>
          {allParticipants.map((participant) => {
            const isLocal = participant.uid === firebaseUser?.uid;
            return (
              <ParticipantVideo
                key={participant.uid || participant.userId || 'local'}
                participant={participant}
                room={room}
                isLocal={isLocal}
                localVideoRef={isLocal ? localVideoRef : undefined}
                isMainView={true}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // For 7+ participants: Main view + thumbnail strip (Google Meet style)
  const thumbnailParticipants = allParticipants.filter(p => p.uid !== mainParticipant?.uid);

  return (
    <div className={`h-[calc(100vh-140px)] flex flex-col transition-all duration-300 ${
      sidebarOpen ? 'lg:mr-80' : ''
    }`}>
      {/* Main Video Area */}
      <div className="flex-1 flex items-center justify-center p-6 pb-2">
        <div className="w-full max-w-5xl">
          {mainParticipant && (
            <ParticipantVideo
              key={mainParticipant.uid || mainParticipant.userId || 'main'}
              participant={mainParticipant}
              room={room}
              isLocal={mainParticipant.uid === firebaseUser?.uid}
              localVideoRef={mainParticipant.uid === firebaseUser?.uid ? localVideoRef : undefined}
              isMainView={true}
            />
          )}
        </div>
      </div>

      {/* Enhanced Thumbnail Strip */}
      {thumbnailParticipants.length > 0 && (
        <div className="flex-shrink-0 px-6 pb-6">
          <div className="flex gap-3 justify-center overflow-x-auto pb-2">
            {thumbnailParticipants.map((participant) => {
              const isLocal = participant.uid === firebaseUser?.uid;
              return (
                <div
                  key={participant.uid || participant.userId || 'thumb'}
                  className="flex-shrink-0 w-36 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg"
                  onClick={() => setMainParticipant(participant)}
                >
                  <ParticipantVideo
                    participant={participant}
                    room={room}
                    isLocal={isLocal}
                    localVideoRef={isLocal ? localVideoRef : undefined}
                    isMainView={false}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user, firebaseUser } = useUser();
  const { toast } = useToast();

  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Local media stream state
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadTimeout, setLoadTimeout] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Use the existing WebRTC hook
  const {
    participants,
    localParticipant,
    isJoining,
    toggleMute,
    toggleCamera,
    leaveRoom: handleLeaveRoom
  } = useWebRTC(roomId || '', localStream);

  // Debug participants
  useEffect(() => {
    console.log('🔍 Room participants updated:', participants.length, participants.map(p => ({ name: p.name, uid: p.uid })));
  }, [participants]);

  // Initialize room and media with timeout
  useEffect(() => {
    if (!roomId || !firebaseUser) return;

    const timeoutId = setTimeout(() => {
      setLoadTimeout(true);
    }, 10000); // 10 seconds

    const initializeRoom = async () => {
      try {
        console.log('Initializing room:', roomId);
        
        // Get room data
        const roomData = await roomsService.getRoom(roomId);
        if (!roomData) {
          throw new Error('Room not found');
        }
        setRoom(roomData);

        // Get user media with adaptive quality based on room capacity
        console.log('Getting user media with adaptive quality...');

        // Adaptive video constraints based on expected room size
        const getVideoConstraints = () => {
          const expectedParticipants = room?.participants?.length || 1;

          if (expectedParticipants <= 2) {
            return { width: 1280, height: 720, frameRate: 30 }; // HD for small groups
          } else if (expectedParticipants <= 4) {
            return { width: 960, height: 540, frameRate: 24 }; // Medium quality
          } else if (expectedParticipants <= 8) {
            return { width: 640, height: 360, frameRate: 20 }; // Lower quality for larger groups
          } else {
            return { width: 480, height: 270, frameRate: 15 }; // Minimal quality for very large groups
          }
        };

        const videoConstraints = getVideoConstraints();
        console.log(`📹 Using video constraints for ${room?.participants?.length || 1} participants:`, videoConstraints);

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            ...videoConstraints,
            facingMode: 'user'
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 48000
          }
        });
        setLocalStream(stream);

        // Set local video immediately
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          // Ensure video plays immediately
          localVideoRef.current.play().catch(e => console.log('Video autoplay prevented:', e));
        }

        console.log('✅ Local stream initialized:', {
          videoTracks: stream.getVideoTracks().length,
          audioTracks: stream.getAudioTracks().length,
          videoEnabled: stream.getVideoTracks()[0]?.enabled,
          audioEnabled: stream.getAudioTracks()[0]?.enabled
        });

        setLoading(false);
        if (typeof isJoining !== 'undefined') {
          // If useWebRTC exposes a setter, set isJoining to false
          try {
            // @ts-ignore
            if (typeof setIsJoining === 'function') setIsJoining(false);
          } catch {}
        }
        clearTimeout(timeoutId);
      } catch (error) {
        console.error('Error initializing room:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to initialize room. Please check your camera and microphone permissions."
        });
        setLoading(false);
        clearTimeout(timeoutId);
      }
    };

    initializeRoom();

    return () => {
      clearTimeout(timeoutId);
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [roomId, firebaseUser, user.name, navigate, toast]);

  // Subscribe to messages
  useEffect(() => {
    if (!roomId) return;

    let previousMessageCount = 0;
    let isInitialLoad = true;

    const unsubscribe = roomsService.subscribeToRoomMessages(roomId, (newMessages) => {
      setMessages(newMessages);

      // Only increment unread count for new messages (not initial load or when chat is open)
      if (!isInitialLoad && newMessages.length > previousMessageCount) {
        // Use current showChat state to determine if notification should show
        setUnreadMessages(prev => {
          // Only increment if chat is currently closed
          if (!showChat) {
            const newMessageCount = newMessages.length - previousMessageCount;
            return prev + newMessageCount;
          }
          return prev;
        });
      }

      previousMessageCount = newMessages.length;
      isInitialLoad = false;
    });

    return () => unsubscribe();
  }, [roomId, showChat]);

  // Reset unread messages when chat is opened
  useEffect(() => {
    if (showChat) {
      setUnreadMessages(0);
    }
  }, [showChat]);

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !roomId || !firebaseUser) return;

    try {
      await roomsService.sendMessage(roomId, firebaseUser.uid, user.name || 'Anonymous', newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message"
      });
    }
  };

  const copyRoomKey = () => {
    if (room?.roomKey) {
      navigator.clipboard.writeText(room.roomKey);
      toast({
        title: "Copied!",
        description: "Room key copied to clipboard"
      });
    }
  };

  const clearChatMessages = async () => {
    if (roomId && firebaseUser) {
      try {
        await roomsService.clearRoomMessages(roomId);
        toast({
          title: "Chat cleared!",
          description: "All chat messages have been cleared"
        });
      } catch (error) {
        console.error('Error clearing chat:', error);
        toast({
          title: "Error",
          description: "Failed to clear chat messages",
          variant: "destructive"
        });
      }
    }
  };

  const leaveRoom = async () => {
    if (firebaseUser && roomId) {
      try {
        // Call the enhanced leaveRoom function that clears chats when room becomes empty
        await roomsService.leaveRoom(roomId, firebaseUser.uid);
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    }
    handleLeaveRoom();
    navigate('/rooms');
  };

  // Cleanup when component unmounts or user navigates away
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (firebaseUser && roomId) {
        try {
          await roomsService.leaveRoom(roomId, firebaseUser.uid);
        } catch (error) {
          console.error('Error leaving room on unload:', error);
        }
      }
    };

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden' && firebaseUser && roomId) {
        try {
          await roomsService.leaveRoom(roomId, firebaseUser.uid);
        } catch (error) {
          console.error('Error leaving room on visibility change:', error);
        }
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      // Also leave room when component unmounts
      if (firebaseUser && roomId) {
        roomsService.leaveRoom(roomId, firebaseUser.uid).catch(error => {
          console.error('Error leaving room on unmount:', error);
        });
      }
    };
  }, [firebaseUser, roomId]);

  if (loadTimeout) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-red-500 font-semibold">Unable to connect to room. Please check your network, Firestore index, or permissions.</p>
          <Button onClick={() => navigate('/rooms')} className="mt-4">
            Back to Rooms
          </Button>
        </div>
      </div>
    );
  }
  if (loading || isJoining) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Connecting to room...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Room not found</p>
          <Button onClick={() => navigate('/rooms')} className="mt-4">
            Back to Rooms
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Top Header - Minimal Google Meet Style */}
      <div className="flex-shrink-0 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-3">
          {/* Left side - Room info */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/rooms')}
              className="text-gray-300 hover:text-white hover:bg-gray-800 p-2 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <h1 className="text-sm sm:text-lg font-medium text-white truncate">
                {room?.name || 'Loading...'}
              </h1>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <Badge
                  variant={room?.type === 'public' ? 'default' : 'secondary'}
                  className="bg-gray-700 text-gray-200 text-xs hidden sm:inline-flex"
                >
                  {room?.type === 'public' ? 'Public' : 'Private'}
                </Badge>
                {room?.roomKey && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-mono bg-gray-800 text-gray-300 px-1 sm:px-2 py-1 rounded">
                      {room.roomKey}
                    </span>
                    <Button size="sm" variant="ghost" onClick={copyRoomKey} className="text-gray-400 hover:text-white p-1">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right side - Meeting info with enhanced details */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <div className="text-xs sm:text-sm text-gray-400 hidden sm:block">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="text-xs sm:text-sm text-gray-400">
                {participants.length} participant{participants.length !== 1 ? 's' : ''}
              </div>
              {participants.length > 8 && (
                <div className="px-1 sm:px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30 hidden lg:block">
                  Large Room
                </div>
              )}
              {participants.length > 15 && (
                <div className="px-1 sm:px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30 hidden lg:block">
                  Performance Mode
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Google Meet Style Layout */}
      <div className="relative">
        {/* Main Video Area - Full Screen */}
        <VideoGrid
          participants={participants}
          localVideoRef={localVideoRef}
          firebaseUser={firebaseUser}
          room={room}
          sidebarOpen={showParticipants || showChat}
        />

        {/* Bottom Control Bar - Google Meet Style */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700">
          <div className="flex items-center justify-center py-3 sm:py-4 px-3 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Microphone Control */}
              <Button
                variant="ghost"
                size="lg"
                onClick={toggleMute}
                className={`rounded-full w-10 h-10 sm:w-12 sm:h-12 transition-all duration-200 ${
                  !localParticipant?.isMuted
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {!localParticipant?.isMuted ? (
                  <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <MicOff className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>

              {/* Camera Control */}
              <Button
                variant="ghost"
                size="lg"
                onClick={toggleCamera}
                className={`rounded-full w-10 h-10 sm:w-12 sm:h-12 transition-all duration-200 ${
                  localParticipant?.isCameraOn
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {localParticipant?.isCameraOn ? (
                  <Video className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <VideoOff className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>

              {/* Leave Call */}
              <Button
                variant="ghost"
                size="lg"
                onClick={leaveRoom}
                className="rounded-full w-10 h-10 sm:w-12 sm:h-12 bg-red-600 hover:bg-red-700 text-white transition-all duration-200"
              >
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 rotate-[135deg]" />
              </Button>

              {/* Participants */}
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setShowParticipants(!showParticipants)}
                className={`rounded-full w-10 h-10 sm:w-12 sm:h-12 transition-all duration-200 ${
                  showParticipants
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>

              {/* Chat */}
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setShowChat(!showChat)}
                className={`rounded-full w-10 h-10 sm:w-12 sm:h-12 relative transition-all duration-200 ${
                  showChat
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                {unreadMessages > 0 && (
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white rounded-full min-w-[16px] h-4 sm:min-w-[20px] sm:h-5 flex items-center justify-center text-xs font-bold animate-pulse border-2 border-gray-900">
                    {unreadMessages > 99 ? '99+' : unreadMessages}
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Participants Sidebar - Google Meet Style */}
        {showParticipants && (
          <div className="fixed top-0 right-0 h-full w-80 bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-600" />
                <h3 className="font-medium text-gray-900">People ({participants.length})</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowParticipants(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-8 h-8 p-0"
              >
                ✕
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-2">
                {participants.map((participant) => (
                  <div key={participant.uid || participant.userId || Math.random()} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {(participant.name || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {participant.name}
                            {participant.uid === firebaseUser?.uid && ' (You)'}
                          </span>
                          {participant.uid === room?.hostId && (
                            <Crown className="h-3 w-3 text-yellow-500" />
                          )}
                        </div>
                        {participant.uid === room?.hostId && (
                          <span className="text-xs text-gray-500">Host</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!participant.isMuted ? (
                        <div className="p-1 rounded-full bg-green-100">
                          <Mic className="h-3 w-3 text-green-600" />
                        </div>
                      ) : (
                        <div className="p-1 rounded-full bg-red-100">
                          <MicOff className="h-3 w-3 text-red-600" />
                        </div>
                      )}
                      {participant.isCameraOn ? (
                        <div className="p-1 rounded-full bg-green-100">
                          <Video className="h-3 w-3 text-green-600" />
                        </div>
                      ) : (
                        <div className="p-1 rounded-full bg-red-100">
                          <VideoOff className="h-3 w-3 text-red-600" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Chat Sidebar */}
        {showChat && (
          <div className="fixed top-0 right-0 h-full w-80 bg-white/95 backdrop-blur-sm border-l border-gray-200/50 shadow-2xl z-50 flex flex-col" data-chat-open="true">
            <div className="p-4 border-b border-gray-200/50 flex items-center justify-between bg-white/80 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Chat</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearChatMessages}
                  className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full w-8 h-8 p-0 transition-colors"
                  title="Clear all messages"
                >
                  🗑️
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChat(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-8 h-8 p-0 transition-colors"
                >
                  ✕
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 text-sm mt-12">
                  <div className="p-4 bg-gray-50 rounded-xl mb-4">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium text-gray-600 mb-1">No messages yet</p>
                    <p className="text-xs text-gray-500">Start the conversation!</p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="group">
                    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50/50 transition-colors">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-900 truncate">
                            {message.userName}
                            {message.userId === firebaseUser?.uid && (
                              <span className="ml-1 text-blue-600 font-normal">(You)</span>
                            )}
                          </span>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {message.timestamp?.toDate?.()?.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            }) || 'now'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-700 break-words leading-relaxed">
                          {message.message}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-gray-200/50 bg-white/80 backdrop-blur-sm">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Send a message to everyone"
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white/90 backdrop-blur-sm"
                />
                <Button
                  size="sm"
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Room;
