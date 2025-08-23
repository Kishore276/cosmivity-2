import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  getDocs,
  getDoc,
  setDoc,
  writeBatch
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import { mockFirebaseService } from './mock-firebase';

// Helper function to check if we should use mock Firebase
function shouldUseMockFirebase(): boolean {
  try {
    const hasApiKey = !!import.meta.env.VITE_FIREBASE_API_KEY;
    const hasProjectId = !!import.meta.env.VITE_FIREBASE_PROJECT_ID;
    const dbInstance = getFirebaseDb();
    return !hasApiKey || !hasProjectId || !dbInstance || !dbInstance.app;
  } catch (error) {
    return true;
  }
}

// Room Types
export interface Room {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private';
  topic: string;
  hostId: string;
  hostName: string;
  participants: string[];
  maxParticipants: number;
  roomKey?: string;
  createdAt: any;
  isActive: boolean;
}

export interface RoomParticipant {
  userId: string;
  userName: string;
  isHost: boolean;
  micEnabled: boolean;
  cameraEnabled: boolean;
  joinedAt: any;
}

export interface RoomMessage {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: any;
}



// Room Services
export const roomsService = {
  // Create a new room
  async createRoom(roomData: Omit<Room, 'id' | 'createdAt' | 'participants'>) {
    try {
      const docRef = await addDoc(collection(getFirebaseDb(), 'rooms'), {
        ...roomData,
        participants: [roomData.hostId],
        createdAt: serverTimestamp(),
        isActive: true
      });

      // Add host as participant
      const participantRef = doc(getFirebaseDb(), 'rooms', docRef.id, 'participants', roomData.hostId);
      await setDoc(participantRef, {
        userId: roomData.hostId,
        userName: roomData.hostName,
        isHost: true,
        micEnabled: true,
        cameraEnabled: true,
        joinedAt: serverTimestamp()
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  },

  // Join a room
  async joinRoom(roomId: string, userId: string, userName: string) {
    try {
      console.log('[joinRoom] Attempting to join room:', roomId, 'as', userId, userName);
      // First check if room exists and has capacity
      const roomRef = doc(getFirebaseDb(), 'rooms', roomId);
      const roomSnap = await getDoc(roomRef);

      if (!roomSnap.exists()) {
        console.error('[joinRoom] Room not found:', roomId);
        throw new Error('Room not found');
      }

      const roomData = roomSnap.data() as Room;
      console.log('[joinRoom] Room data:', roomData);

      // Check if room is at capacity
      if (roomData.participants.length >= roomData.maxParticipants) {
        console.warn('[joinRoom] Room is at maximum capacity:', roomId);
        throw new Error('Room is at maximum capacity');
      }

      // Check if user is already in the room
      if (roomData.participants.includes(userId)) {
        // User already in room, just update participant details
        const participantRef = doc(getFirebaseDb(), 'rooms', roomId, 'participants', userId);
        console.log('[joinRoom] User already in room, updating participant details:', userId);
        await setDoc(participantRef, {
          uid: userId,
          userId,
          name: userName,
          userName,
          isHost: roomData.hostId === userId,
          micEnabled: true,
          cameraEnabled: true,
          joinedAt: serverTimestamp()
        });
        console.log('[joinRoom] Participant details updated for existing user:', userId);
        return;
      }

      console.log('[joinRoom] Adding user to participants array:', userId);
      await updateDoc(roomRef, {
        participants: arrayUnion(userId)
      });
      console.log('[joinRoom] User added to participants array:', userId);

      // Add participant details
      const participantRef = doc(getFirebaseDb(), 'rooms', roomId, 'participants', userId);
      console.log('[joinRoom] Creating participant document for:', userId);
      await setDoc(participantRef, {
        uid: userId,
        userId,
        name: userName,
        userName,
        isHost: false,
        micEnabled: true,
        cameraEnabled: true,
        joinedAt: serverTimestamp()
      });
      console.log('[joinRoom] Participant document created for:', userId);
    } catch (error) {
      console.error('[joinRoom] Error joining room:', error);
      throw error;
    }
  },



  // Delete a room (only host can delete)
  async deleteRoom(roomId: string) {
    try {
      await deleteDoc(doc(getFirebaseDb(), 'rooms', roomId));
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  },

  // Get real-time public rooms with accurate participant counts
  subscribeToPublicRooms(callback: (rooms: Room[]) => void) {
    const q = query(
      collection(getFirebaseDb(), 'rooms'),
      where('type', '==', 'public'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    // Map to store participant count listeners for each room
    const participantListeners = new Map<string, () => void>();

    const mainUnsubscribe = onSnapshot(q, (snapshot) => {
      const roomsMap = new Map<string, Room>();

      // Initialize rooms from main collection
      snapshot.docs.forEach(docSnap => {
        const roomData = docSnap.data() as Room;
        const roomId = docSnap.id;
        roomsMap.set(roomId, { ...roomData, id: roomId });

        // Set up real-time participant count listener for each room
        if (!participantListeners.has(roomId)) {
          const participantsRef = collection(getFirebaseDb(), 'rooms', roomId, 'participants');
          const participantUnsub = onSnapshot(participantsRef, (participantSnapshot) => {
            const actualParticipantCount = participantSnapshot.size;
            const participantIds = participantSnapshot.docs.map(doc => doc.data().userId || doc.data().uid);

            // Update room in our map
            const currentRoom = roomsMap.get(roomId);
            if (currentRoom) {
              currentRoom.participants = participantIds;
              roomsMap.set(roomId, currentRoom);

              // Trigger callback with updated rooms
              callback(Array.from(roomsMap.values()));
            }

            // Update main room document if needed (async, don't wait)
            if (actualParticipantCount !== (roomData.participants?.length || 0)) {
              updateDoc(doc(getFirebaseDb(), 'rooms', roomId), {
                participants: participantIds
              }).catch(error => console.warn(`Error updating room ${roomId} participants:`, error));
            }
          });

          participantListeners.set(roomId, participantUnsub);
        }
      });

      // Clean up listeners for rooms that no longer exist
      participantListeners.forEach((unsub, roomId) => {
        if (!roomsMap.has(roomId)) {
          unsub();
          participantListeners.delete(roomId);
        }
      });

      // Initial callback with current rooms
      callback(Array.from(roomsMap.values()));
    });

    // Return cleanup function
    return () => {
      mainUnsubscribe();
      participantListeners.forEach(unsub => unsub());
      participantListeners.clear();
    };
  },

  // Get room by key (for private rooms)
  async getRoomByKey(roomKey: string) {
    try {
      const q = query(
        collection(getFirebaseDb(), 'rooms'),
        where('roomKey', '==', roomKey),
        where('type', '==', 'private'),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Room;
      }
      return null;
    } catch (error) {
      console.error('Error getting room by key:', error);
      throw error;
    }
  },

  // Get user's joined rooms
  subscribeToUserRooms(userId: string, callback: (rooms: Room[]) => void) {
    const q = query(
      collection(getFirebaseDb(), 'rooms'),
      where('participants', 'array-contains', userId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const rooms: Room[] = [];
      snapshot.forEach((doc) => {
        rooms.push({ id: doc.id, ...doc.data() } as Room);
      });
      callback(rooms);
    });
  },

  // Get room participants
  subscribeToRoomParticipants(roomId: string, callback: (participants: RoomParticipant[]) => void) {
    const q = query(
      collection(getFirebaseDb(), 'rooms', roomId, 'participants'),
      orderBy('joinedAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const participants: RoomParticipant[] = [];
      snapshot.forEach((doc) => {
        participants.push({ ...doc.data() } as RoomParticipant);
      });
      callback(participants);
    });
  },

  // Update participant media status
  async updateParticipantMedia(roomId: string, userId: string, micEnabled: boolean, cameraEnabled: boolean) {
    try {
      const participantRef = doc(getFirebaseDb(), 'rooms', roomId, 'participants', userId);
      await updateDoc(participantRef, {
        micEnabled,
        cameraEnabled
      });
    } catch (error) {
      console.error('Error updating participant media:', error);
      throw error;
    }
  },

  // Send message to room
  async sendMessage(roomId: string, userId: string, userName: string, message: string) {
    try {
      await addDoc(collection(getFirebaseDb(), 'rooms', roomId, 'messages'), {
        userId,
        userName,
        message,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Subscribe to room messages
  subscribeToRoomMessages(roomId: string, callback: (messages: RoomMessage[]) => void) {
    const q = query(
      collection(getFirebaseDb(), 'rooms', roomId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const messages: RoomMessage[] = [];
      snapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() } as RoomMessage);
      });
      callback(messages);
    });
  },

  // Clear all messages from a room (for testing/cleanup)
  async clearRoomMessages(roomId: string) {
    try {
      const messagesRef = collection(getFirebaseDb(), 'rooms', roomId, 'messages');
      const messagesSnap = await getDocs(messagesRef);

      if (messagesSnap.empty) {
        console.log(`No messages to clear in room ${roomId}`);
        return;
      }

      const batch = writeBatch(getFirebaseDb());
      messagesSnap.forEach(doc => batch.delete(doc.ref));

      await batch.commit();
      console.log(`Cleared ${messagesSnap.size} messages from room ${roomId}`);
    } catch (error) {
      console.error('Error clearing room messages:', error);
      throw error;
    }
  },

  // Leave room
  async leaveRoom(roomId: string, userId: string) {
    try {
      const roomRef = doc(getFirebaseDb(), 'rooms', roomId);

      // Remove from participants array
      await updateDoc(roomRef, {
        participants: arrayRemove(userId)
      });

      // Remove participant details
      const participantRef = doc(getFirebaseDb(), 'rooms', roomId, 'participants', userId);
      await deleteDoc(participantRef);

      // Check if room is now empty and clean up if needed
      const roomSnap = await getDoc(roomRef);
      if (roomSnap.exists()) {
        const roomData = roomSnap.data();
        const remainingParticipants = roomData.participants || [];

        if (remainingParticipants.length === 0) {
          console.log(`Room ${roomId} is now empty, cleaning up...`);

          // Clear all messages when room becomes empty
          await this.clearRoomMessages(roomId);
        }
      }

      // Clean up any signaling data for this user
      try {
        const signalingRef = collection(getFirebaseDb(), 'rooms', roomId, 'signaling');
        const q1 = query(signalingRef, where('sender', '==', userId));
        const q2 = query(signalingRef, where('recipient', '==', userId));

        const [senderDocs, recipientDocs] = await Promise.all([
          getDocs(q1),
          getDocs(q2)
        ]);

        const batch = writeBatch(getFirebaseDb());
        senderDocs.forEach(doc => batch.delete(doc.ref));
        recipientDocs.forEach(doc => batch.delete(doc.ref));

        if (!senderDocs.empty || !recipientDocs.empty) {
          await batch.commit();
        }
      } catch (cleanupError) {
        console.warn('Error cleaning up signaling data:', cleanupError);
      }
    } catch (error) {
      console.error('Error leaving room:', error);
      throw error;
    }
  },

  // Get single room
  async getRoom(roomId: string) {
    try {
      const roomRef = doc(getFirebaseDb(), 'rooms', roomId);
      const roomSnap = await getDoc(roomRef);
      if (roomSnap.exists()) {
        return { id: roomSnap.id, ...roomSnap.data() } as Room;
      }
      return null;
    } catch (error) {
      console.error('Error getting room:', error);
      throw error;
    }
  },

  // Clean up stale participants (participants in subcollection but not in main room array)
  async cleanupStaleParticipants(roomId: string) {
    try {
      const roomRef = doc(getFirebaseDb(), 'rooms', roomId);
      const roomSnap = await getDoc(roomRef);

      if (!roomSnap.exists()) return;

      const roomData = roomSnap.data() as Room;
      const activeParticipants = roomData.participants || [];

      // Get all participants in subcollection
      const participantsRef = collection(getFirebaseDb(), 'rooms', roomId, 'participants');
      const participantsSnap = await getDocs(participantsRef);

      const batch = writeBatch(getFirebaseDb());
      let hasChanges = false;
      const actualParticipants: string[] = [];

      participantsSnap.forEach((doc) => {
        const participantData = doc.data();
        const participantId = participantData.userId || participantData.uid;

        if (!activeParticipants.includes(participantId)) {
          // This participant is stale, remove them
          batch.delete(doc.ref);
          hasChanges = true;
        } else {
          actualParticipants.push(participantId);
        }
      });

      // Update the main room document with accurate participant list
      if (actualParticipants.length !== activeParticipants.length) {
        batch.update(roomRef, { participants: actualParticipants });
        hasChanges = true;
      }

      // If room is now empty, clear messages
      if (actualParticipants.length === 0 && activeParticipants.length > 0) {
        console.log(`Room ${roomId} became empty during cleanup, clearing messages...`);
        const messagesRef = collection(getFirebaseDb(), 'rooms', roomId, 'messages');
        const messagesSnap = await getDocs(messagesRef);
        messagesSnap.forEach(doc => batch.delete(doc.ref));
      }

      if (hasChanges) {
        await batch.commit();
        console.log(`Cleaned up stale participants in room ${roomId}. Active: ${actualParticipants.length}`);
      }
    } catch (error) {
      console.error('Error cleaning up stale participants:', error);
    }
  },

  // Auto-delete empty rooms after 10 minutes
  async autoDeleteEmptyRooms() {
    try {
      console.log('🧹 Running auto-delete check for empty rooms...');
      
      const now = new Date();
      const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

      // Query active rooms
      const q = query(
        collection(getFirebaseDb(), 'rooms'),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log('No active rooms found');
        return;
      }

      console.log(`Found ${snapshot.size} active rooms to check`);
      let deletedCount = 0;

      for (const roomDoc of snapshot.docs) {
        const room = { id: roomDoc.id, ...roomDoc.data() } as Room;
        
        // Check if room is empty (no participants)
        if (!room.participants || room.participants.length === 0) {
          // Check if room was created more than 10 minutes ago
          const createdAt = room.createdAt?.toDate() || new Date(0);
          
          if (createdAt < tenMinutesAgo) {
            console.log(`🗑️ Deleting empty room: ${room.name} (ID: ${room.id})`);
            
            try {
              // Delete all subcollections first
              const batch = writeBatch(getFirebaseDb());
              
              // Delete participants subcollection
              const participantsQuery = await getDocs(collection(getFirebaseDb(), 'rooms', room.id, 'participants'));
              participantsQuery.forEach(doc => batch.delete(doc.ref));
              
              // Delete messages subcollection  
              const messagesQuery = await getDocs(collection(getFirebaseDb(), 'rooms', room.id, 'messages'));
              messagesQuery.forEach(doc => batch.delete(doc.ref));
              
              await batch.commit();
              
              // Delete the room document itself
              await deleteDoc(doc(getFirebaseDb(), 'rooms', room.id));
              
              deletedCount++;
              console.log(`✅ Successfully deleted empty room: ${room.name}`);
            } catch (error) {
              console.error(`❌ Failed to delete room ${room.id}:`, error);
            }
          } else {
            console.log(`⏳ Room ${room.name} is empty but was created recently (${Math.round((now.getTime() - createdAt.getTime()) / 60000)} minutes ago)`);
          }
        } else {
          console.log(`👥 Room ${room.name} has ${room.participants.length} participants - keeping`);
        }
      }

      if (deletedCount > 0) {
        console.log(`🧹 Auto-deletion completed: Deleted ${deletedCount} empty rooms`);
      } else {
        console.log('🧹 Auto-deletion completed: No rooms needed deletion');
      }
    } catch (error) {
      console.error('❌ Error in auto-delete empty rooms:', error);
    }
  },

  // Start the auto-delete service
  startAutoDeleteService() {
    console.log('🚀 Starting room auto-deletion service...');
    
    // Run immediately
    this.autoDeleteEmptyRooms();
    
    // Run every 10 minutes
    const intervalId = setInterval(() => {
      this.autoDeleteEmptyRooms();
    }, 10 * 60 * 1000); // 10 minutes
    
    console.log('✅ Room auto-deletion service started (runs every 10 minutes)');
    
    // Return cleanup function
    return () => {
      clearInterval(intervalId);
      console.log('🛑 Room auto-deletion service stopped');
    };
  }
};

// Aptitude Practice Types
export interface AptitudeQuestion {
  id: string;
  question: string;
  options?: string[]; // For multiple choice
  answer: string;
  explanation?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimit?: number; // in seconds
  passage?: string; // For reading comprehension questions
}

export interface AptitudeLesson {
  id: string;
  title: string;
  description?: string;
  content?: string; // Lesson content/theory
  questions: AptitudeQuestion[];
  order: number;
}

export interface AptitudeSubject {
  id: string;
  name: string;
  category: 'quantitative' | 'logical' | 'verbal';
  description?: string;
  lessons: AptitudeLesson[];
  createdBy: string;
  createdAt: any;
  updatedAt: any;
}

// Aptitude Practice Services
export const aptitudeService = {
  // Add a new subject with lessons
  async addSubject(subjectData: Omit<AptitudeSubject, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const docRef = await addDoc(collection(getFirebaseDb(), 'aptitude-subjects'), {
        ...subjectData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding subject:', error);
      throw error;
    }
  },

  // Get subjects by user
  async getUserSubjects(userId: string) {
    try {
      const q = query(
        collection(getFirebaseDb(), 'aptitude-subjects'),
        where('createdBy', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const subjects: AptitudeSubject[] = [];
      snapshot.forEach((doc) => {
        subjects.push({ id: doc.id, ...doc.data() } as AptitudeSubject);
      });
      return subjects;
    } catch (error) {
      console.error('Error getting subjects:', error);
      throw error;
    }
  },

  // Subscribe to all subjects (for display only)
  subscribeToAllSubjects(callback: (subjects: AptitudeSubject[]) => void) {
    if (shouldUseMockFirebase()) {
      console.log('🔧 Using mock Firebase for subscribeToAllSubjects');
      return mockFirebaseService.onSnapshot('aptitude-subjects', (subjects) => {
        console.log('📚 Mock Firebase subjects received:', subjects);
        callback(subjects);
      });
    } else {
      const q = query(
        collection(getFirebaseDb(), 'aptitude-subjects')
      );

      return onSnapshot(q, (snapshot) => {
        console.log('🔥 Firebase snapshot received. Documents count:', snapshot.size);
        const subjects: AptitudeSubject[] = [];
        snapshot.forEach((doc) => {
          console.log('📄 Document data:', { id: doc.id, data: doc.data() });
          subjects.push({ id: doc.id, ...doc.data() } as AptitudeSubject);
        });
        console.log('📚 Final subjects array:', subjects);
        callback(subjects);
      });
    }
  },

  // Update a subject
  async updateSubject(subjectId: string, updates: Partial<AptitudeSubject>) {
    try {
      await updateDoc(doc(getFirebaseDb(), 'aptitude-subjects', subjectId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating subject:', error);
      throw error;
    }
  },

  // Delete a subject
  async deleteSubject(subjectId: string) {
    try {
      await deleteDoc(doc(getFirebaseDb(), 'aptitude-subjects', subjectId));
    } catch (error) {
      console.error('Error deleting subject:', error);
      throw error;
    }
  }
};



// Resume Types
export interface ResumeData {
  id: string;
  userId: string;
  templateId: string;
  name: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
    linkedin?: string;
    github?: string;
  };
  summary: string;
  experience: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
    achievements: string[];
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    gpa?: string;
    achievements: string[];
  }>;
  skills: Array<{
    category: string;
    items: string[];
  }>;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
    link?: string;
    github?: string;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    link?: string;
  }>;
  createdAt: any;
  updatedAt: any;
}

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  atsScore: number;
  category: 'professional' | 'creative' | 'technical' | 'academic';
  preview: string;
  isDefault: boolean;
  createdAt: any;
}

// Resume Services
export const resumeService = {
  // Create a new resume
  async createResume(resumeData: Omit<ResumeData, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const docRef = await addDoc(collection(getFirebaseDb(), 'resumes'), {
        ...resumeData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating resume:', error);
      throw error;
    }
  },

  // Update resume
  async updateResume(resumeId: string, updates: Partial<ResumeData>) {
    try {
      const resumeRef = doc(getFirebaseDb(), 'resumes', resumeId);
      await updateDoc(resumeRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating resume:', error);
      throw error;
    }
  },

  // Delete resume
  async deleteResume(resumeId: string) {
    try {
      await deleteDoc(doc(getFirebaseDb(), 'resumes', resumeId));
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw error;
    }
  },

  // Get user's resumes
  subscribeToUserResumes(userId: string, callback: (resumes: ResumeData[]) => void) {
    const q = query(
      collection(getFirebaseDb(), 'resumes'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const resumes: ResumeData[] = [];
      snapshot.forEach((doc) => {
        resumes.push({ id: doc.id, ...doc.data() } as ResumeData);
      });
      callback(resumes);
    });
  },

  // Get resume by ID
  async getResume(resumeId: string): Promise<ResumeData | null> {
    try {
      const docRef = doc(getFirebaseDb(), 'resumes', resumeId);
      const docSnap = await getDocs(query(collection(getFirebaseDb(), 'resumes'), where('__name__', '==', resumeId)));
      if (!docSnap.empty) {
        const doc = docSnap.docs[0];
        return { id: doc.id, ...doc.data() } as ResumeData;
      }
      return null;
    } catch (error) {
      console.error('Error getting resume:', error);
      throw error;
    }
  }
};

// Template Services
export const templateService = {
  // Get all templates
  subscribeToTemplates(callback: (templates: ResumeTemplate[]) => void) {
    const q = query(
      collection(getFirebaseDb(), 'resume-templates'),
      orderBy('atsScore', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const templates: ResumeTemplate[] = [];
      snapshot.forEach((doc) => {
        templates.push({ id: doc.id, ...doc.data() } as ResumeTemplate);
      });
      callback(templates);
    });
  },

  // Add default templates (run once)
  async addDefaultTemplates() {
    const defaultTemplates: Omit<ResumeTemplate, 'id' | 'createdAt'>[] = [
      {
        name: 'Modern Clean',
        description: 'A contemporary, clean design with clear sections and professional formatting. Ideal for technical professionals and recent graduates.',
        atsScore: 78,
        category: 'professional',
        preview: '/templates/modern-clean.png',
        isDefault: true
      },
      {
        name: 'Business Professional',
        description: 'A traditional, text-focused format emphasizing professional experience and achievements. Perfect for business professionals and managers.',
        atsScore: 92,
        category: 'professional',
        preview: '/templates/business-professional.png',
        isDefault: true
      },
      {
        name: 'Aditya Vardhan',
        description: 'A comprehensive format with detailed sections for projects, certifications, and extra-curricular activities. Perfect for students and recent graduates with diverse experiences.',
        atsScore: 90,
        category: 'academic',
        preview: '/templates/aditya-vardhan.png',
        isDefault: true
      },
      {
        name: 'Experience Focused',
        description: 'A traditional, experience-focused format with detailed professional history and achievements. Perfect for experienced professionals with extensive work history.',
        atsScore: 88,
        category: 'professional',
        preview: '/templates/experience-focused.png',
        isDefault: true
      }
    ];

    try {
      for (const template of defaultTemplates) {
        await addDoc(collection(getFirebaseDb(), 'resume-templates'), {
          ...template,
          createdAt: serverTimestamp()
        });
      }
      console.log('Default templates added successfully');
    } catch (error) {
      console.error('Error adding default templates:', error);
      throw error;
    }
  },

  // Clear all templates and add new ones
  async resetToDefaultTemplates() {
    try {
      // Delete all existing templates
      const templatesSnapshot = await getDocs(collection(getFirebaseDb(), 'resume-templates'));
      const deletePromises = templatesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Add new default templates
      await this.addDefaultTemplates();
      console.log('Templates reset successfully');
    } catch (error) {
      console.error('Error resetting templates:', error);
      throw error;
    }
  }
};

// Generate random room key for private rooms
export const generateRoomKey = async (): Promise<string> => {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    let key = '';
    while (key.length < 6) {
      key += Math.random().toString(36).substring(2);
    }
    key = key.substring(0, 6).toUpperCase();

    // Check if key already exists
    try {
      const existingRoom = await roomsService.getRoomByKey(key);
      if (!existingRoom) {
        return key; // Key is unique
      }
    } catch (error) {
      console.error('Error checking room key uniqueness:', error);
      return key; // Return key anyway if check fails
    }

    attempts++;
  }

  // Fallback: return a key even if we couldn't verify uniqueness
  let key = '';
  while (key.length < 6) {
    key += Math.random().toString(36).substring(2);
  }
  return key.substring(0, 6).toUpperCase();
};
