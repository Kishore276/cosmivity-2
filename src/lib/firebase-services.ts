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
import { db } from './firebase';
import { mockFirebaseService } from './mock-firebase';

// Helper function to check if we should use mock Firebase
function shouldUseMockFirebase(): boolean {
  try {
    const hasApiKey = !!import.meta.env.VITE_FIREBASE_API_KEY;
    const hasProjectId = !!import.meta.env.VITE_FIREBASE_PROJECT_ID;
    return !hasApiKey || !hasProjectId || !db || !db.app;
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
      const docRef = await addDoc(collection(db, 'rooms'), {
        ...roomData,
        participants: [roomData.hostId],
        createdAt: serverTimestamp(),
        isActive: true
      });

      // Add host as participant
      const participantRef = doc(db, 'rooms', docRef.id, 'participants', roomData.hostId);
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
      // First check if room exists and has capacity
      const roomRef = doc(db, 'rooms', roomId);
      const roomSnap = await getDoc(roomRef);

      if (!roomSnap.exists()) {
        throw new Error('Room not found');
      }

      const roomData = roomSnap.data() as Room;

      // Check if room is at capacity
      if (roomData.participants.length >= roomData.maxParticipants) {
        throw new Error('Room is at maximum capacity');
      }

      // Check if user is already in the room
      if (roomData.participants.includes(userId)) {
        // User already in room, just update participant details
        const participantRef = doc(db, 'rooms', roomId, 'participants', userId);
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
        return;
      }

      await updateDoc(roomRef, {
        participants: arrayUnion(userId)
      });

      // Add participant details
      const participantRef = doc(db, 'rooms', roomId, 'participants', userId);
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
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    }
  },



  // Delete a room (only host can delete)
  async deleteRoom(roomId: string) {
    try {
      await deleteDoc(doc(db, 'rooms', roomId));
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  },

  // Get real-time public rooms with accurate participant counts
  subscribeToPublicRooms(callback: (rooms: Room[]) => void) {
    const q = query(
      collection(db, 'rooms'),
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
          const participantsRef = collection(db, 'rooms', roomId, 'participants');
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
              updateDoc(doc(db, 'rooms', roomId), {
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
        collection(db, 'rooms'),
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
      collection(db, 'rooms'),
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
      collection(db, 'rooms', roomId, 'participants'),
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
      const participantRef = doc(db, 'rooms', roomId, 'participants', userId);
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
      await addDoc(collection(db, 'rooms', roomId, 'messages'), {
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
      collection(db, 'rooms', roomId, 'messages'),
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
      const messagesRef = collection(db, 'rooms', roomId, 'messages');
      const messagesSnap = await getDocs(messagesRef);

      if (messagesSnap.empty) {
        console.log(`No messages to clear in room ${roomId}`);
        return;
      }

      const batch = writeBatch(db);
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
      const roomRef = doc(db, 'rooms', roomId);

      // Remove from participants array
      await updateDoc(roomRef, {
        participants: arrayRemove(userId)
      });

      // Remove participant details
      const participantRef = doc(db, 'rooms', roomId, 'participants', userId);
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
        const signalingRef = collection(db, 'rooms', roomId, 'signaling');
        const q1 = query(signalingRef, where('sender', '==', userId));
        const q2 = query(signalingRef, where('recipient', '==', userId));

        const [senderDocs, recipientDocs] = await Promise.all([
          getDocs(q1),
          getDocs(q2)
        ]);

        const batch = writeBatch(db);
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
      const roomRef = doc(db, 'rooms', roomId);
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
      const roomRef = doc(db, 'rooms', roomId);
      const roomSnap = await getDoc(roomRef);

      if (!roomSnap.exists()) return;

      const roomData = roomSnap.data() as Room;
      const activeParticipants = roomData.participants || [];

      // Get all participants in subcollection
      const participantsRef = collection(db, 'rooms', roomId, 'participants');
      const participantsSnap = await getDocs(participantsRef);

      const batch = writeBatch(db);
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
        const messagesRef = collection(db, 'rooms', roomId, 'messages');
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
      const docRef = await addDoc(collection(db, 'aptitude-subjects'), {
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
        collection(db, 'aptitude-subjects'),
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
        collection(db, 'aptitude-subjects')
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
      await updateDoc(doc(db, 'aptitude-subjects', subjectId), {
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
      await deleteDoc(doc(db, 'aptitude-subjects', subjectId));
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
      const docRef = await addDoc(collection(db, 'resumes'), {
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
      const resumeRef = doc(db, 'resumes', resumeId);
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
      await deleteDoc(doc(db, 'resumes', resumeId));
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw error;
    }
  },

  // Get user's resumes
  subscribeToUserResumes(userId: string, callback: (resumes: ResumeData[]) => void) {
    const q = query(
      collection(db, 'resumes'),
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
      const docRef = doc(db, 'resumes', resumeId);
      const docSnap = await getDocs(query(collection(db, 'resumes'), where('__name__', '==', resumeId)));
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
      collection(db, 'resume-templates'),
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
        name: 'ATS Professional',
        description: 'Clean, ATS-friendly design perfect for corporate roles',
        atsScore: 95,
        category: 'professional',
        preview: '/templates/ats-professional.png',
        isDefault: true
      },
      {
        name: 'Modern Minimalist',
        description: 'Simple, elegant design with excellent readability',
        atsScore: 90,
        category: 'professional',
        preview: '/templates/modern-minimalist.png',
        isDefault: true
      },
      {
        name: 'Technical Focus',
        description: 'Optimized for software engineers and technical roles',
        atsScore: 88,
        category: 'technical',
        preview: '/templates/technical-focus.png',
        isDefault: true
      },
      {
        name: 'Academic CV',
        description: 'Comprehensive format for academic and research positions',
        atsScore: 85,
        category: 'academic',
        preview: '/templates/academic-cv.png',
        isDefault: true
      },
      {
        name: 'Creative Professional',
        description: 'Stylish design for creative industries',
        atsScore: 75,
        category: 'creative',
        preview: '/templates/creative-professional.png',
        isDefault: true
      }
    ];

    try {
      for (const template of defaultTemplates) {
        await addDoc(collection(db, 'resume-templates'), {
          ...template,
          createdAt: serverTimestamp()
        });
      }
      console.log('Default templates added successfully');
    } catch (error) {
      console.error('Error adding default templates:', error);
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
