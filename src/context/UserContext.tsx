
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export type Project = {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  github?: string;
  startDate?: string;
  endDate?: string;
};

export type Certification = {
  id: string;
  name: string;
  organization: string;
  year: string;
  link?: string;
  description?: string;
};

export type Experience = {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  achievements: string[];
};

export type ProfileData = {
  name: string;
  email: string;
  bio: string;
  college: string;
  avatarUrl: string;
  github: string;
  linkedin: string;
  website: string;
  skills: string[];
  experience: Experience[];
  projects: Project[];
  certifications: Certification[];
  title?: string;
  location?: string;
  phone?: string;
};

const defaultProfileData: ProfileData = {
    name: 'Guest User',
    email: '',
    bio: '',
    college: '',
    avatarUrl: '/avatar.png',
    github: '',
    linkedin: '',
    website: '',
    skills: [],
    experience: [],
    projects: [],
    certifications: [],
    title: '',
    location: '',
    phone: '',
};

interface UserContextType {
  user: ProfileData;
  setUser: React.Dispatch<React.SetStateAction<ProfileData>>;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ProfileData>(defaultProfileData);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true); // Represents the initial auth check

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (userAuth) => {
      let unsubSnapshot: () => void = () => {};

      if (userAuth) {
        setFirebaseUser(userAuth);
        const userDocRef = doc(db, 'users', userAuth.uid);
        
        unsubSnapshot = onSnapshot(userDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as ProfileData;
            // Always use the default avatar URL
            setUser({ ...defaultProfileData, ...data, avatarUrl: "/avatar.png" });
          } else {
            const newUserProfile: ProfileData = {
              name: userAuth.displayName || userAuth.email?.split('@')[0] || 'User',
              email: userAuth.email || '',
              avatarUrl: "/avatar.png",
              bio: '',
              college: '',
              github: '',
              linkedin: '',
              website: '',
              skills: [],
              experience: [],
              projects: [],
              certifications: [],
              title: '',
              location: '',
              phone: '',
            };
            try {
              await setDoc(userDocRef, newUserProfile);
              setUser(newUserProfile);
            } catch (error) {
              console.error("Error creating user document:", error);
            }
          }
          setLoading(false); 
        }, (error) => {
            console.error("Error with snapshot listener:", error);
            setLoading(false);
        });

      } else {
        setFirebaseUser(null);
        setUser(defaultProfileData);
        setLoading(false);
      }
      
      return () => {
        unsubSnapshot();
      };
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, firebaseUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
