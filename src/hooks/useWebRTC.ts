


import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/lib/firebase';
import {
  doc,
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
  Unsubscribe,
  serverTimestamp,
  addDoc,
  query,
  where,
  writeBatch,
  getDocs,
} from 'firebase/firestore';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';

// Enhanced WebRTC configuration for better connectivity and scalability
const servers: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    // Additional STUN servers for better connectivity
    { urls: 'stun:stun.services.mozilla.com' },
    { urls: 'stun:stun.stunprotocol.org:3478' },
  ],
  iceCandidatePoolSize: 15, // Increased for better connectivity
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require',
  // Optimize for multiple connections
  iceTransportPolicy: 'all',
};

export type Participant = {
    uid: string;
    userId?: string; // For compatibility with RoomParticipant
    name: string;
    userName?: string; // For compatibility with RoomParticipant
    avatarUrl: string;
    isMuted: boolean;
    isCameraOn: boolean;
    isSharingScreen: boolean;
    isHost?: boolean; // For compatibility with RoomParticipant
    micEnabled?: boolean; // For compatibility with RoomParticipant
    cameraEnabled?: boolean; // For compatibility with RoomParticipant
    stream?: MediaStream;
    isSpeaking?: boolean;
    joinedAt?: any; // For compatibility with RoomParticipant
}

type SignalingMessage = {
    type: 'offer' | 'answer' | 'iceCandidate' | 'participant-left';
    sender: string;
    recipient: string;
    payload: any;
    createdAt: any;
}

export function useWebRTC(roomId: string, localStream: MediaStream | null) {
  const { user: currentUser, firebaseUser } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isJoining, setIsJoining] = useState(true);

  const setupCompleteRef = useRef(false);

  // Connection management for scalability
  const maxDirectConnections = 8; // Limit direct P2P connections
  const connectionHealthRef = useRef<Map<string, { lastActivity: number; quality: 'good' | 'poor' | 'failed' }>>(new Map());
  const reconnectAttemptsRef = useRef<Map<string, number>>(new Map());

  // Add connection timeout with better handling
  useEffect(() => {
    if (isJoining && roomId && firebaseUser && !setupCompleteRef.current) {
      const timeout = setTimeout(() => {
        if (isJoining && !setupCompleteRef.current) {
          console.warn('Connection setup taking longer than expected, but continuing...');
          setIsJoining(false);
          toast({
            title: 'Room Ready',
            description: 'You can now interact with the room. Connection may still be establishing in the background.'
          });
        }
      }, 8000); // Reduced to 8 seconds

      return () => clearTimeout(timeout);
    }
  }, [isJoining, roomId, firebaseUser, toast]);

  // Periodic connection health monitoring for scalability
  useEffect(() => {
    const healthCheckInterval = setInterval(() => {
      const now = Date.now();
      const staleThreshold = 30000; // 30 seconds

      // Check for stale connections
      for (const [uid, health] of connectionHealthRef.current.entries()) {
        if (now - health.lastActivity > staleThreshold && health.quality !== 'failed') {
          console.log(`⚠️ Stale connection detected for ${uid}, marking as poor`);
          connectionHealthRef.current.set(uid, { ...health, quality: 'poor' });

          // Attempt to refresh the connection
          const pc = peerConnectionsRef.current.get(uid);
          if (pc && pc.connectionState === 'connected') {
            // Restart ICE to refresh connection
            pc.restartIce();
          }
        }
      }

      // Clean up failed connections that are too old
      const failedThreshold = 60000; // 1 minute
      for (const [uid, health] of connectionHealthRef.current.entries()) {
        if (health.quality === 'failed' && now - health.lastActivity > failedThreshold) {
          console.log(`🧹 Cleaning up old failed connection for ${uid}`);
          connectionHealthRef.current.delete(uid);
          reconnectAttemptsRef.current.delete(uid);

          const pc = peerConnectionsRef.current.get(uid);
          if (pc) {
            pc.close();
            peerConnectionsRef.current.delete(uid);
          }
        }
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(healthCheckInterval);
  }, []);

  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const firestoreUnsubsRef = useRef<Unsubscribe[]>([]);
  const localScreenStreamRef = useRef<MediaStream | null>(null);
  
  const isLeavingRef = useRef(false);
  const isJoiningRef = useRef(false);

  const localParticipant = participants.find(p => p.uid === firebaseUser?.uid);

    // Active speaker detection
    useEffect(() => {
        const interval = setInterval(() => {
            setParticipants(prev => prev.map(p => {
                if (!p.stream) return { ...p, isSpeaking: false };
                let speaking = false;
                try {
                    const audioTracks = p.stream.getAudioTracks();
                    if (audioTracks.length > 0) {
                        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
                        const analyser = context.createAnalyser();
                        const source = context.createMediaStreamSource(p.stream);
                        source.connect(analyser);
                        const data = new Uint8Array(analyser.frequencyBinCount);
                        analyser.getByteFrequencyData(data);
                        const volume = data.reduce((a, b) => a + b, 0) / data.length;
                        speaking = volume > 20; // Threshold
                        source.disconnect();
                        analyser.disconnect();
                        context.close();
                    }
                } catch {}
                return { ...p, isSpeaking: speaking };
            }));
        }, 1000);
        return () => clearInterval(interval);
    }, [participants]);

  const leaveRoom = useCallback(async () => {
    if (!firebaseUser || isLeavingRef.current) return;
    isLeavingRef.current = true;
    console.log("Leaving room:", roomId);

    localStream?.getTracks().forEach(track => track.stop());
    localScreenStreamRef.current?.getTracks().forEach(track => track.stop());

    firestoreUnsubsRef.current.forEach(unsub => unsub());
    firestoreUnsubsRef.current = [];

    const signalingPromises: Promise<any>[] = [];
    const signalingRef = collection(db, 'rooms', roomId, 'signaling');

    peerConnectionsRef.current.forEach((pc, remoteUid) => {
        const leaveMessage: SignalingMessage = {
            type: 'participant-left',
            sender: firebaseUser.uid,
            recipient: remoteUid,
            payload: {},
            createdAt: serverTimestamp()
        };
        signalingPromises.push(addDoc(signalingRef, leaveMessage));
        pc.close();
    });

    await Promise.all(signalingPromises);
    peerConnectionsRef.current.clear();

    // Use the enhanced leaveRoom service that handles chat cleanup
    try {
        const { roomsService } = await import('../lib/firebase-services');
        await roomsService.leaveRoom(roomId, firebaseUser.uid);
    } catch (error) {
        console.error("Error using enhanced leave room service:", error);
        // Fallback to manual cleanup
        const participantRef = doc(db, 'rooms', roomId, 'participants', firebaseUser.uid);
        try {
            await deleteDoc(participantRef);
        } catch (fallbackError) {
            console.error("Cleanup error: Could not delete participant doc.", fallbackError);
        }
    }

    navigate('/rooms');
  }, [roomId, firebaseUser, localStream, navigate]);

  const createPeerConnection = useCallback((remoteUid: string) => {
      if (!firebaseUser || !localStream) {
          console.log(`⚠️ Cannot create peer connection - missing firebaseUser or localStream`);
          return null;
      }
      if (peerConnectionsRef.current.has(remoteUid)) {
          console.log(`♻️ Reusing existing peer connection for ${remoteUid}`);
          return peerConnectionsRef.current.get(remoteUid)!;
      }

      console.log(`🆕 Creating new peer connection for ${remoteUid}`);
      const pc = new RTCPeerConnection(servers);
      peerConnectionsRef.current.set(remoteUid, pc);

      const isSharingScreen = participants.find(p => p.uid === firebaseUser.uid)?.isSharingScreen;
      const streamToUse = isSharingScreen && localScreenStreamRef.current ? localScreenStreamRef.current : localStream;

      console.log(`🎵 Adding ${streamToUse.getTracks().length} tracks to peer connection for ${remoteUid}`);
      streamToUse.getTracks().forEach(track => {
        try {
          // Ensure track is enabled before adding
          if (track.kind === 'video') {
            track.enabled = localParticipant?.isCameraOn ?? true;

            // Apply adaptive video constraints based on participant count
            const participantCount = participants.length;
            if (participantCount > 4) {
              // Reduce video quality for better performance with many participants
              const videoTrack = track as MediaStreamTrack;
              if (videoTrack.getSettings) {
                const settings = videoTrack.getSettings();
                console.log(`📹 Current video settings for ${participantCount} participants:`, {
                  width: settings.width,
                  height: settings.height,
                  frameRate: settings.frameRate
                });
                // Note: Actual constraint application would need to be done at stream creation
                // For future enhancement: implement dynamic bitrate adjustment
              }
            }
          } else if (track.kind === 'audio') {
            track.enabled = !(localParticipant?.isMuted ?? false);
          }
          pc.addTrack(track, streamToUse);
          console.log(`✅ Added ${track.kind} track (enabled: ${track.enabled}) for ${remoteUid}`);
        } catch (e) {
          console.error(`❌ Error adding track for ${remoteUid}:`, e);
        }
      });

      pc.ontrack = (event) => {
          console.log(`🎥 Received remote stream from ${remoteUid}:`, event.streams[0]);
          const remoteStream = event.streams[0];
          if (remoteStream && remoteStream.getTracks().length > 0) {
              console.log(`📺 Stream has ${remoteStream.getTracks().length} tracks:`,
                  remoteStream.getTracks().map(t => `${t.kind}: ${t.enabled}`));

              // Ensure the stream is active and has tracks
              const videoTracks = remoteStream.getVideoTracks();
              const audioTracks = remoteStream.getAudioTracks();

              console.log(`🎬 Video tracks: ${videoTracks.length}, Audio tracks: ${audioTracks.length}`);

              setParticipants(prev => {
                  const updated = prev.map(p => {
                      if (p.uid === remoteUid) {
                          console.log(`✅ Updating participant ${p.name} with new stream`);
                          return { ...p, stream: remoteStream };
                      }
                      return p;
                  });

                  // If participant doesn't exist yet, add them with the stream
                  if (!updated.find(p => p.uid === remoteUid)) {
                      console.log(`➕ Adding new participant with stream: ${remoteUid}`);
                      updated.push({
                          uid: remoteUid,
                          name: `User ${remoteUid.slice(0, 6)}`,
                          avatarUrl: "",
                          isMuted: false,
                          isCameraOn: true,
                          isSharingScreen: false,
                          stream: remoteStream
                      });
                  }

                  console.log(`✅ Updated participants with stream for ${remoteUid}`);
                  return updated;
              });
          } else {
              console.warn(`⚠️ Received empty or invalid stream from ${remoteUid}`);
          }
      };

      pc.onicecandidate = (event) => {
          if (event.candidate && firebaseUser) {
              const signalingRef = collection(db, 'rooms', roomId, 'signaling');
              const candidatePayload: SignalingMessage = {
                  type: 'iceCandidate',
                  sender: firebaseUser.uid,
                  recipient: remoteUid,
                  payload: event.candidate.toJSON(),
                  createdAt: serverTimestamp(),
              };
              addDoc(signalingRef, candidatePayload);
          }
      };
      
      pc.onconnectionstatechange = () => {
        console.log(`🔗 Connection state for ${remoteUid}: ${pc.connectionState}`);

        // Update connection health tracking
        const now = Date.now();
        if (pc.connectionState === 'connected') {
          console.log(`✅ Successfully connected to ${remoteUid}`);
          connectionHealthRef.current.set(remoteUid, { lastActivity: now, quality: 'good' });
          reconnectAttemptsRef.current.delete(remoteUid);
        } else if (pc.connectionState === 'connecting') {
          connectionHealthRef.current.set(remoteUid, { lastActivity: now, quality: 'poor' });
        } else if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
          console.log(`❌ Connection lost with ${remoteUid}, cleaning up`);
          connectionHealthRef.current.set(remoteUid, { lastActivity: now, quality: 'failed' });

          // Implement smart reconnection logic
          const attempts = reconnectAttemptsRef.current.get(remoteUid) || 0;
          if (attempts < 3 && participants.length <= maxDirectConnections) {
            console.log(`🔄 Attempting reconnection ${attempts + 1}/3 for ${remoteUid}`);
            reconnectAttemptsRef.current.set(remoteUid, attempts + 1);

            // Attempt reconnection after a delay
            setTimeout(() => {
              if (peerConnectionsRef.current.has(remoteUid)) {
                peerConnectionsRef.current.get(remoteUid)?.close();
                peerConnectionsRef.current.delete(remoteUid);
              }
              // Trigger reconnection through participant refresh
              const participant = participants.find(p => p.uid === remoteUid);
              if (participant) {
                createPeerConnection(remoteUid);
              }
            }, Math.min(1000 * Math.pow(2, attempts), 5000)); // Exponential backoff, max 5s
          } else {
            // Clean up failed connection
            peerConnectionsRef.current.get(remoteUid)?.close();
            peerConnectionsRef.current.delete(remoteUid);
            setParticipants(prev => prev.filter(p => p.uid !== remoteUid));
          }
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log(`🧊 ICE connection state for ${remoteUid}: ${pc.iceConnectionState}`);
      };

      return pc;
  }, [firebaseUser, localStream, roomId, currentUser.name, currentUser.avatarUrl, participants]);

  // Enhanced function to manage peer connections with scalability optimizations
  const ensureAllPeerConnections = useCallback(async (allParticipants: Participant[]) => {
    if (!firebaseUser || !localStream) return;

    console.log('🔗 Ensuring all peer connections are established...');

    // Prioritize connections based on participant count and connection health
    const remoteParticipants = allParticipants.filter(p => p.uid !== firebaseUser.uid);
    const totalParticipants = remoteParticipants.length;

    // If we have too many participants, implement selective connection strategy
    if (totalParticipants > maxDirectConnections) {
      console.log(`⚠️ Too many participants (${totalParticipants}), implementing selective connections`);

      // Sort participants by priority (host first, then by join time, then by connection health)
      const prioritizedParticipants = remoteParticipants
        .sort((a, b) => {
          // Host gets highest priority
          if (a.isHost && !b.isHost) return -1;
          if (!a.isHost && b.isHost) return 1;

          // Then by connection health
          const healthA = connectionHealthRef.current.get(a.uid)?.quality || 'poor';
          const healthB = connectionHealthRef.current.get(b.uid)?.quality || 'poor';
          const healthScore = { good: 3, poor: 2, failed: 1 };

          return healthScore[healthB] - healthScore[healthA];
        })
        .slice(0, maxDirectConnections); // Limit to max connections

      // Connect only to prioritized participants
      for (const participant of prioritizedParticipants) {
        await createConnectionIfNeeded(participant, allParticipants);
      }
    } else {
      // Connect to all participants if under the limit
      for (const participant of remoteParticipants) {
        await createConnectionIfNeeded(participant, allParticipants);
      }
    }
  }, [firebaseUser, localStream, roomId, currentUser.name, currentUser.avatarUrl, createPeerConnection, maxDirectConnections, connectionHealthRef]);

  // Helper function to create connection if needed
  const createConnectionIfNeeded = async (participant: Participant, allParticipants: Participant[]) => {
    if (!peerConnectionsRef.current.has(participant.uid)) {
      console.log(`🆕 Creating missing peer connection for ${participant.name} (${participant.uid})`);
      const pc = createPeerConnection(participant.uid);

      if (pc && pc.signalingState === 'stable') {
        // Small delay to ensure proper initialization
        setTimeout(async () => {
          try {
            console.log(`📞 Creating offer for missing connection to ${participant.uid}`);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            const currentLocalParticipant = allParticipants.find(p => p.uid === firebaseUser?.uid);
            const meDataForOffer: Participant = {
              uid: firebaseUser!.uid,
              name: currentUser.name || "Anonymous",
              avatarUrl: currentUser.avatarUrl || "",
              isMuted: !localStream!.getAudioTracks()[0]?.enabled,
              isCameraOn: localStream!.getVideoTracks()[0]?.enabled,
              isSharingScreen: currentLocalParticipant?.isSharingScreen ?? false,
            };

            const offerPayload: SignalingMessage = {
              type: 'offer',
              sender: firebaseUser!.uid,
              recipient: participant.uid,
              payload: {
                offer: pc.localDescription!.toJSON(),
                participantData: meDataForOffer,
              },
              createdAt: serverTimestamp(),
            };

            const signalingRef = collection(db, 'rooms', roomId, 'signaling');
            await addDoc(signalingRef, offerPayload);
            console.log(`📤 Sent offer for missing connection to ${participant.uid}`);
          } catch (error) {
            console.error(`Error creating offer for missing connection to ${participant.uid}:`, error);
          }
        }, 200);
      }
    }
  };

  // Function to refresh all peer connections (useful after page refresh)
  const refreshPeerConnections = useCallback(async () => {
    if (!firebaseUser || !localStream) return;

    console.log('🔄 Refreshing all peer connections...');

    // Get current participants from Firestore
    const participantsRef = collection(db, 'rooms', roomId, 'participants');
    const snapshot = await getDocs(participantsRef);

    const allParticipants: Participant[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const participant: Participant = {
        uid: data.uid || data.userId,
        name: data.name || data.userName,
        avatarUrl: data.avatarUrl || "",
        isMuted: data.isMuted ?? !data.micEnabled,
        isCameraOn: data.isCameraOn ?? data.cameraEnabled,
        isSharingScreen: data.isSharingScreen ?? false,
      };
      if (participant.uid !== firebaseUser.uid) {
        allParticipants.push(participant);
      }
    });

    // Ensure connections with all participants
    await ensureAllPeerConnections(allParticipants);
  }, [firebaseUser, localStream, roomId, ensureAllPeerConnections]);

  useEffect(() => {
    // Early returns for missing requirements
    if (!firebaseUser || !currentUser.name || !roomId) {
        console.log('⚠️ Skipping setup - missing basic requirements:', {
          firebaseUser: !!firebaseUser,
          firebaseUserUid: firebaseUser?.uid,
          userName: !!currentUser.name,
          userNameValue: currentUser.name,
          roomId: !!roomId,
          roomIdValue: roomId
        });
        return;
    }

    // If localStream is not available yet, wait for it
    if (!localStream) {
        console.log('Waiting for local stream to be available...');
        return;
    }

    // Prevent multiple setups
    if (isJoiningRef.current || setupCompleteRef.current) {
        console.log('Setup already in progress or complete, skipping...');
        return;
    }

    console.log('🚀 Starting room setup for user:', currentUser.name, 'in room:', roomId);
    console.log('🔐 Firebase User:', {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName
    });
    isJoiningRef.current = true;

    const meData: Participant = {
        uid: firebaseUser.uid,
        name: currentUser.name || "Anonymous",
        avatarUrl: currentUser.avatarUrl || "",
        isMuted: !localStream.getAudioTracks()[0]?.enabled,
        isCameraOn: localStream.getVideoTracks()[0]?.enabled,
        isSharingScreen: false,
        stream: localStream
    };

    // Immediately set local participant to show own video
    setParticipants([meData]);
    console.log('✅ Set local participant with stream:', {
      name: meData.name,
      hasStream: !!meData.stream,
      videoTracks: meData.stream?.getVideoTracks().length || 0,
      audioTracks: meData.stream?.getAudioTracks().length || 0
    });
    
    const setupSignalingListener = () => {
        if(!firebaseUser) return null;

        const signalingRef = collection(db, 'rooms', roomId, 'signaling');
        // Simplified query to avoid index requirement - we'll filter in memory
        const q = query(signalingRef, where("recipient", "==", firebaseUser.uid));

        const unsub = onSnapshot(q, async (snapshot) => {
            if(isLeavingRef.current) return;
            const batch = writeBatch(db);
            for (const docChange of snapshot.docChanges()) {
                if (docChange.type === 'added') {
                    const message = docChange.doc.data() as SignalingMessage;
                    const remoteUid = message.sender;
                    
                    try {
                         if (message.type === 'participant-left') {
                            peerConnectionsRef.current.get(remoteUid)?.close();
                            peerConnectionsRef.current.delete(remoteUid);
                            setParticipants(prev => prev.filter(p => p.uid !== remoteUid));
                            batch.delete(docChange.doc.ref);
                            continue;
                        }
                        
                        const pc = createPeerConnection(remoteUid);
                        if (!pc) continue;

                        if (message.type === 'offer') {
                            console.log(`📥 Received offer from ${remoteUid}`);
                            const offerData = message.payload.participantData as Participant;

                            // Add or update participant data
                            setParticipants(prev => {
                                if (prev.some(p => p.uid === remoteUid)) {
                                    return prev.map(p => p.uid === remoteUid ? { ...p, ...offerData } : p);
                                }
                                console.log(`➕ Adding new participant from offer: ${offerData.name}`);
                                return [...prev, offerData];
                            });

                            // Handle offer with proper collision detection
                            const isPolite = firebaseUser.uid > remoteUid;
                            if (pc.signalingState !== 'stable' && !isPolite) {
                                console.log("⚠️ Ignoring impolite offer from", remoteUid);
                                continue;
                            }

                            try {
                                await pc.setRemoteDescription(new RTCSessionDescription(message.payload.offer));
                                const answer = await pc.createAnswer();
                                await pc.setLocalDescription(answer);
                                console.log(`📤 Created answer for ${remoteUid}`);

                                const answerPayload: SignalingMessage = {
                                    type: 'answer',
                                    sender: firebaseUser.uid,
                                    recipient: remoteUid,
                                    payload: pc.localDescription!.toJSON(),
                                    createdAt: serverTimestamp(),
                                };
                                await addDoc(signalingRef, answerPayload);
                                console.log(`✅ Sent answer to ${remoteUid}`);
                            } catch (error) {
                                console.error(`❌ Error handling offer from ${remoteUid}:`, error);
                            }

                        } else if (message.type === 'answer') {
                            console.log(`📥 Received answer from ${remoteUid}`);
                            try {
                                if (pc.signalingState === 'have-local-offer') {
                                    await pc.setRemoteDescription(new RTCSessionDescription(message.payload));
                                    console.log(`✅ Set remote description for answer from ${remoteUid}`);
                                } else {
                                    console.log(`⚠️ Ignoring answer from ${remoteUid} - wrong signaling state: ${pc.signalingState}`);
                                }
                            } catch (error) {
                                console.error(`❌ Error handling answer from ${remoteUid}:`, error);
                            }
                        } else if (message.type === 'iceCandidate') {
                            console.log(`🧊 Received ICE candidate from ${remoteUid}`);
                            try {
                                if (pc.remoteDescription) {
                                    await pc.addIceCandidate(new RTCIceCandidate(message.payload));
                                    console.log(`✅ Added ICE candidate from ${remoteUid}`);
                                } else {
                                    console.log(`⚠️ Cannot add ICE candidate - no remote description yet for ${remoteUid}`);
                                }
                            } catch (error) {
                                console.error(`❌ Error adding ICE candidate from ${remoteUid}:`, error);
                            }
                        }
                    } catch (error) {
                        console.error(`Error processing signaling message from ${remoteUid}:`, error);
                    } finally {
                        batch.delete(docChange.doc.ref);
                    }
                }
            }
             if (!snapshot.empty) {
                await batch.commit().catch(err => console.error("Batch delete failed", err));
            }
        }, (error) => {
            console.error("Signaling listener error:", error);
            // Don't throw the error, just log it to prevent crashes
        });
        return unsub;
    };

    const setupParticipantsListener = () => {
        if (!firebaseUser) return null;
        const participantsRef = collection(db, 'rooms', roomId, 'participants');

        const unsub = onSnapshot(participantsRef, (snapshot) => {
            if (isLeavingRef.current) return;

            console.log('👥 Participants snapshot received, total docs:', snapshot.size);

            // Track changes to detect who left
            const currentParticipantIds = new Set(participants.map(p => p.uid));
            const newParticipantIds = new Set<string>();

            // Get all current participants to avoid duplicates
            const allParticipants: Participant[] = [];
            snapshot.forEach((doc) => {
                const participantData = doc.data() as Participant;
                const uid = participantData.uid || participantData.userId;
                if (uid) {
                    // Ensure we have a consistent uid field and proper name
                    participantData.uid = uid;
                    // Use userName from participant data if name is missing
                    if (!participantData.name && participantData.userName) {
                        participantData.name = participantData.userName;
                    }
                    allParticipants.push(participantData);
                    newParticipantIds.add(uid);
                    console.log('👤 Found participant:', participantData.name, 'uid:', uid);
                }
            });

            // Detect participants who left
            const leftParticipants = Array.from(currentParticipantIds).filter(uid => !newParticipantIds.has(uid));
            leftParticipants.forEach(uid => {
                console.log('👋 Participant left:', uid);
                // Clean up peer connection
                const pc = peerConnectionsRef.current.get(uid);
                if (pc) {
                    pc.close();
                    peerConnectionsRef.current.delete(uid);
                }
            });

            console.log('👥 Total participants found:', allParticipants.length);

            // Merge with existing participants to preserve local stream and other local state
            setParticipants(prev => {
                const merged: Participant[] = [];

                // First, add all participants from Firestore
                allParticipants.forEach(firestoreParticipant => {
                    const existingParticipant = prev.find(p => p.uid === firestoreParticipant.uid);
                    if (existingParticipant) {
                        // Merge Firestore data with existing local data (preserve stream)
                        merged.push({
                            ...firestoreParticipant,
                            stream: existingParticipant.stream // Keep existing stream
                        });
                    } else {
                        merged.push(firestoreParticipant);
                    }
                });

                // Add any local participants not in Firestore (shouldn't happen but safety check)
                prev.forEach(localParticipant => {
                    if (!merged.find(p => p.uid === localParticipant.uid)) {
                        merged.push(localParticipant);
                    }
                });

                console.log('👥 Merged participants:', merged.length, merged.map(p => ({ name: p.name, uid: p.uid, hasStream: !!p.stream })));

                // Ensure all peer connections are established immediately and with a backup
                ensureAllPeerConnections(merged);
                setTimeout(() => {
                    ensureAllPeerConnections(merged);
                }, 1000); // Backup check after 1 second

                return merged;
            });

            snapshot.docChanges().forEach(async (change) => {
                const participantData = change.doc.data() as Participant;
                const remoteUid = participantData.uid || participantData.userId;

                if (!remoteUid) {
                    console.warn('Participant data missing uid/userId:', participantData);
                    return;
                }

                if (remoteUid === firebaseUser.uid) return;

                if (change.type === 'added') {
                    console.log(`🆕 New participant added: ${participantData.name} (${remoteUid})`);

                    // Create peer connection for the new participant
                    const pc = createPeerConnection(remoteUid);
                    if (pc) {
                        // Wait a bit to ensure the peer connection is properly initialized
                        setTimeout(async () => {
                            if (pc.signalingState === 'stable') {
                                try {
                                    console.log(`📞 Creating offer for new participant ${remoteUid}`);
                                    const offer = await pc.createOffer();
                                    await pc.setLocalDescription(offer);

                                    const meDataForOffer: Participant = {
                                        uid: firebaseUser.uid,
                                        name: currentUser.name || "Anonymous",
                                        avatarUrl: currentUser.avatarUrl || "",
                                        isMuted: !localStream.getAudioTracks()[0]?.enabled,
                                        isCameraOn: localStream.getVideoTracks()[0]?.enabled,
                                        isSharingScreen: localParticipant?.isSharingScreen ?? false,
                                    };

                                    const offerPayload: SignalingMessage = {
                                        type: 'offer',
                                        sender: firebaseUser.uid,
                                        recipient: remoteUid,
                                        payload: {
                                            offer: pc.localDescription!.toJSON(),
                                            participantData: meDataForOffer,
                                        },
                                        createdAt: serverTimestamp(),
                                    };
                                    const signalingRef = collection(db, 'rooms', roomId, 'signaling');
                                    await addDoc(signalingRef, offerPayload);
                                    console.log(`📤 Sent offer to new participant ${remoteUid}`);
                                } catch (error) {
                                    console.error(`Error creating offer for ${remoteUid}:`, error);
                                }
                            }
                        }, 100); // Small delay to ensure proper initialization
                    }
                } else if (change.type === 'removed') {
                    peerConnectionsRef.current.get(remoteUid)?.close();
                    peerConnectionsRef.current.delete(remoteUid);
                    setParticipants(prev => prev.filter(p => p.uid !== remoteUid));
                } else if (change.type === 'modified') {
                    setParticipants(prev => prev.map(p => p.uid === remoteUid ? {...p, ...participantData} : p));
                }
            });
        });
        return unsub;
    };


    const setup = async () => {
        try {
          console.log('🚀 Setting up room connection for user:', currentUser.name, 'in room:', roomId);

          // Check if participant already exists to avoid duplicates
          console.log('📄 Checking participant document in Firestore...');
          const participantRef = doc(db, 'rooms', roomId, 'participants', firebaseUser.uid);
          const participantSnap = await getDoc(participantRef);
          console.log('📄 Participant document exists:', participantSnap.exists());

          if (!participantSnap.exists()) {
            console.log('✅ Creating new participant entry...');
            // Only create if doesn't exist
            await setDoc(participantRef, {
                uid: meData.uid,
                userId: meData.uid, // Add userId for compatibility
                name: meData.name,
                userName: meData.name, // Add userName for compatibility
                avatarUrl: meData.avatarUrl,
                isMuted: meData.isMuted,
                isCameraOn: meData.isCameraOn,
                isSharingScreen: meData.isSharingScreen,
                isHost: false,
                micEnabled: !meData.isMuted,
                cameraEnabled: meData.isCameraOn,
                joinedAt: serverTimestamp(),
            });
          } else {
            console.log('🔄 Updating existing participant entry...');
            // Update existing participant data
            await updateDoc(participantRef, {
                name: meData.name,
                userName: meData.name, // Add userName for compatibility
                avatarUrl: meData.avatarUrl,
                isMuted: meData.isMuted,
                isCameraOn: meData.isCameraOn,
                isSharingScreen: meData.isSharingScreen,
                micEnabled: !meData.isMuted,
                cameraEnabled: meData.isCameraOn,
            });
          }

          console.log('🔗 Setting up listeners...');
          const participantsUnsub = setupParticipantsListener();
          if (participantsUnsub) firestoreUnsubsRef.current.push(participantsUnsub);

          const signalingUnsub = setupSignalingListener();
          if (signalingUnsub) firestoreUnsubsRef.current.push(signalingUnsub);

          console.log('✅ Room setup complete, setting isJoining to false');
          setupCompleteRef.current = true;
          setIsJoining(false);

          // Refresh peer connections after a short delay to ensure all participants are loaded
          setTimeout(() => {
            refreshPeerConnections();
          }, 2000);

          // Periodic check to ensure all participants have streams
          const streamCheckInterval = setInterval(() => {
            setParticipants(prev => {
              const participantsWithoutStreams = prev.filter(p => p.uid !== firebaseUser.uid && !p.stream);
              if (participantsWithoutStreams.length > 0) {
                console.log(`🔄 Found ${participantsWithoutStreams.length} participants without streams, refreshing connections...`);
                refreshPeerConnections();
              }
              return prev;
            });
          }, 5000); // Check every 5 seconds

          // Clear interval on cleanup
          return () => {
            clearInterval(streamCheckInterval);
          };
        } catch (error) {
          console.error("Failed to setup room connection:", error);
          toast({ variant: 'destructive', title: 'Connection Error', description: 'Failed to join the room. Please try again.' });
          setupCompleteRef.current = true;
          setIsJoining(false);
        }
    };

    setup();
    
    const handleBeforeUnload = () => {
        leaveRoom();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Only cleanup if we're actually leaving the component, not just re-running the effect
      if (!firebaseUser || !roomId) {
        setupCompleteRef.current = false;
        isJoiningRef.current = false;
        leaveRoom();
      }
    };
  }, [firebaseUser, currentUser.name, roomId, localStream]); // Re-run when these dependencies change


  const toggleMedia = async (kind: 'audio' | 'video', forceState?: boolean) => {
    if (!firebaseUser || !localStream) return;
    
    const isSharing = localParticipant?.isSharingScreen ?? false;
    const streamToToggle = isSharing && kind === 'audio' && localScreenStreamRef.current 
      ? localScreenStreamRef.current 
      : localStream;

    const track = kind === 'audio' 
        ? streamToToggle.getAudioTracks()[0] 
        : localStream.getVideoTracks()[0];

    if (!track) return;
    if (isSharing && kind === 'video') return;
    
    const newState = forceState !== undefined ? forceState : !track.enabled;
    track.enabled = newState;

    const isMuted = !localStream.getAudioTracks()[0]?.enabled;
    const isCameraOn = localStream.getVideoTracks()[0]?.enabled;

    setParticipants(prev => prev.map(p => p.uid === firebaseUser.uid ? {...p, isMuted, isCameraOn } : p));
    
    const participantRef = doc(db, 'rooms', roomId, 'participants', firebaseUser.uid);
    await updateDoc(participantRef, {
      isMuted,
      isCameraOn,
      micEnabled: !isMuted,
      cameraEnabled: isCameraOn
    }).catch(e => console.error("Failed to update media state in Firestore:", e));
  }

  const toggleMute = () => toggleMedia('audio');
  const toggleCamera = () => toggleMedia('video');
  
  const toggleScreenShare = async () => {
      if (!firebaseUser || !localStream) return;
      
      const wasSharing = localParticipant?.isSharingScreen ?? false;
      const participantRef = doc(db, 'rooms', roomId, 'participants', firebaseUser.uid);
      
      if (wasSharing) {
        localScreenStreamRef.current?.getTracks().forEach(track => track.stop());
        localScreenStreamRef.current = null;
        
        const originalVideoTrack = localStream.getVideoTracks()[0];
        if (originalVideoTrack) originalVideoTrack.enabled = true;
        
        for (const pc of peerConnectionsRef.current.values()) {
            const sender = pc.getSenders().find(s => s.track?.kind === 'video');
            if (sender && originalVideoTrack) {
                await sender.replaceTrack(originalVideoTrack);
            }
        }
        
        setParticipants(prev => prev.map(p => p.uid === firebaseUser.uid ? { ...p, isSharingScreen: false, isCameraOn: true, stream: localStream } : p));
        await updateDoc(participantRef, { isSharingScreen: false, isCameraOn: true });
      } else {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
            localScreenStreamRef.current = screenStream;
            
            const screenVideoTrack = screenStream.getVideoTracks()[0];
            localStream.getVideoTracks()[0].enabled = false;

            screenVideoTrack.onended = () => {
                if (localParticipant?.isSharingScreen) {
                    toggleScreenShare();
                }
            };
            
            for (const pc of peerConnectionsRef.current.values()) {
                const videoSender = pc.getSenders().find(s => s.track?.kind === 'video');
                if (videoSender) await videoSender.replaceTrack(screenVideoTrack);
            }

            setParticipants(prev => prev.map(p => p.uid === firebaseUser.uid ? { ...p, isSharingScreen: true, isCameraOn: false, stream: screenStream } : p));
            await updateDoc(participantRef, { isSharingScreen: true, isCameraOn: false });
        } catch (error) {
            console.error("Screen sharing failed:", error);
            localStream.getVideoTracks()[0].enabled = true;
            toast({ variant: 'destructive', title: 'Error', description: 'Could not start screen sharing.' });
        }
      }
  }

  return { 
    participants, 
    localParticipant, 
    isJoining,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
    leaveRoom
  };
}
