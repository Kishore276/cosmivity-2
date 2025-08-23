/**
 * Enhanced Practice Data Management Service
 * Provides comprehensive practice data management with analytics and progress tracking
 */

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
  getDocs,
  getDoc,
  setDoc,
  writeBatch,
  increment
} from 'firebase/firestore';
import { db } from './firebase';
import {
  PracticeSubject,
  PracticeLesson,
  EnhancedQuestion,
  UserProgress,
  PracticeSession,
  StudyPlan,
  Achievement,
  UserAchievement,
  enhancedPracticeData,
  defaultAchievements
} from './enhanced-practice-data';

class EnhancedPracticeService {
  private subjects: PracticeSubject[] = [];
  private isInitialized = false;

  /**
   * Initialize the service with enhanced practice data
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load existing subjects from Firebase or create default ones
      const subjectsSnapshot = await getDocs(collection(db, 'practiceSubjects'));
      
      if (subjectsSnapshot.empty) {
        // Initialize with default enhanced data
        await this.createDefaultSubjects();
      } else {
        this.subjects = subjectsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as PracticeSubject));
      }

      // Initialize achievements if they don't exist
      await this.initializeAchievements();
      
      this.isInitialized = true;
      console.log('✅ Enhanced Practice Service initialized');
    } catch (error) {
      console.error('❌ Error initializing Enhanced Practice Service:', error);
      throw error;
    }
  }

  /**
   * Create default subjects with enhanced structure
   */
  private async createDefaultSubjects(): Promise<void> {
    const batch = writeBatch(db);

    for (const subject of enhancedPracticeData) {
      const subjectRef = doc(db, 'practiceSubjects', subject.id);
      batch.set(subjectRef, {
        ...subject,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    await batch.commit();
    this.subjects = enhancedPracticeData;
  }

  /**
   * Initialize default achievements
   */
  private async initializeAchievements(): Promise<void> {
    const achievementsSnapshot = await getDocs(collection(db, 'achievements'));
    
    if (achievementsSnapshot.empty) {
      const batch = writeBatch(db);
      
      for (const achievement of defaultAchievements) {
        const achievementRef = doc(db, 'achievements', achievement.id);
        batch.set(achievementRef, {
          ...achievement,
          createdAt: serverTimestamp()
        });
      }
      
      await batch.commit();
    }
  }

  /**
   * Get all practice subjects
   */
  async getSubjects(): Promise<PracticeSubject[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.subjects;
  }

  /**
   * Get a specific subject by ID
   */
  async getSubject(subjectId: string): Promise<PracticeSubject | null> {
    const subjectDoc = await getDoc(doc(db, 'practiceSubjects', subjectId));
    return subjectDoc.exists() ? { id: subjectDoc.id, ...subjectDoc.data() } as PracticeSubject : null;
  }

  /**
   * Update subject analytics
   */
  async updateSubjectAnalytics(subjectId: string, analytics: Partial<PracticeSubject['analytics']>): Promise<void> {
    const subjectRef = doc(db, 'practiceSubjects', subjectId);
    await updateDoc(subjectRef, {
      analytics: analytics,
      updatedAt: serverTimestamp()
    });
  }

  /**
   * Create a new practice session
   */
  async createPracticeSession(sessionData: Omit<PracticeSession, 'id' | 'startTime'>): Promise<string> {
    const sessionRef = await addDoc(collection(db, 'practiceSessions'), {
      ...sessionData,
      startTime: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    return sessionRef.id;
  }

  /**
   * Update practice session
   */
  async updatePracticeSession(sessionId: string, updates: Partial<PracticeSession>): Promise<void> {
    const sessionRef = doc(db, 'practiceSessions', sessionId);
    await updateDoc(sessionRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }

  /**
   * Get user progress for a subject
   */
  async getUserProgress(userId: string, subjectId: string): Promise<UserProgress[]> {
    const progressQuery = query(
      collection(db, 'userProgress'),
      where('userId', '==', userId),
      where('subjectId', '==', subjectId)
    );
    
    const progressSnapshot = await getDocs(progressQuery);
    return progressSnapshot.docs.map(doc => ({
      ...doc.data()
    } as UserProgress));
  }

  /**
   * Update user progress
   */
  async updateUserProgress(progressData: UserProgress): Promise<void> {
    const progressId = `${progressData.userId}_${progressData.subjectId}_${progressData.lessonId}_${progressData.questionId}`;
    const progressRef = doc(db, 'userProgress', progressId);
    
    await setDoc(progressRef, {
      ...progressData,
      lastAttemptDate: serverTimestamp()
    }, { merge: true });
  }

  /**
   * Create or update study plan
   */
  async createStudyPlan(planData: Omit<StudyPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const planRef = await addDoc(collection(db, 'studyPlans'), {
      ...planData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return planRef.id;
  }

  /**
   * Get user's study plans
   */
  async getUserStudyPlans(userId: string): Promise<StudyPlan[]> {
    const plansQuery = query(
      collection(db, 'studyPlans'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const plansSnapshot = await getDocs(plansQuery);
    return plansSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as StudyPlan));
  }

  /**
   * Update study plan progress
   */
  async updateStudyPlanProgress(planId: string, progress: Partial<StudyPlan['progress']>): Promise<void> {
    const planRef = doc(db, 'studyPlans', planId);
    await updateDoc(planRef, {
      progress: progress,
      updatedAt: serverTimestamp()
    });
  }

  /**
   * Get user achievements
   */
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const achievementsQuery = query(
      collection(db, 'userAchievements'),
      where('userId', '==', userId)
    );
    
    const achievementsSnapshot = await getDocs(achievementsQuery);
    return achievementsSnapshot.docs.map(doc => ({
      ...doc.data()
    } as UserAchievement));
  }

  /**
   * Award achievement to user
   */
  async awardAchievement(userId: string, achievementId: string): Promise<void> {
    const userAchievementId = `${userId}_${achievementId}`;
    const userAchievementRef = doc(db, 'userAchievements', userAchievementId);
    
    await setDoc(userAchievementRef, {
      userId,
      achievementId,
      unlockedAt: serverTimestamp(),
      progress: 100,
      isCompleted: true
    });
  }

  /**
   * Get practice session analytics
   */
  async getSessionAnalytics(userId: string, timeframe: 'week' | 'month' | 'year' = 'month'): Promise<any> {
    const startDate = new Date();
    switch (timeframe) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const sessionsQuery = query(
      collection(db, 'practiceSessions'),
      where('userId', '==', userId),
      where('startTime', '>=', startDate),
      orderBy('startTime', 'desc')
    );

    const sessionsSnapshot = await getDocs(sessionsQuery);
    const sessions = sessionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PracticeSession));

    // Calculate analytics
    const totalSessions = sessions.length;
    const totalTimeSpent = sessions.reduce((sum, session) => sum + session.duration, 0);
    const averageScore = sessions.reduce((sum, session) => sum + session.score, 0) / totalSessions || 0;
    const totalQuestions = sessions.reduce((sum, session) => sum + session.totalQuestions, 0);
    const correctAnswers = sessions.reduce((sum, session) => sum + session.correctAnswers, 0);

    return {
      totalSessions,
      totalTimeSpent,
      averageScore,
      totalQuestions,
      correctAnswers,
      accuracy: totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0,
      sessions: sessions.slice(0, 10) // Recent 10 sessions
    };
  }

  /**
   * Subscribe to real-time updates for a subject
   */
  subscribeToSubject(subjectId: string, callback: (subject: PracticeSubject | null) => void): () => void {
    const subjectRef = doc(db, 'practiceSubjects', subjectId);
    return onSnapshot(subjectRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as PracticeSubject);
      } else {
        callback(null);
      }
    });
  }

  /**
   * Subscribe to user progress updates
   */
  subscribeToUserProgress(userId: string, callback: (progress: UserProgress[]) => void): () => void {
    const progressQuery = query(
      collection(db, 'userProgress'),
      where('userId', '==', userId)
    );
    
    return onSnapshot(progressQuery, (snapshot) => {
      const progress = snapshot.docs.map(doc => ({
        ...doc.data()
      } as UserProgress));
      callback(progress);
    });
  }
}

export const enhancedPracticeService = new EnhancedPracticeService();
