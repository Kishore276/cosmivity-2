// Mock Firebase service for development when Firebase credentials are not available
import { AptitudeSubject } from './firebase-services';

class MockFirebaseService {
  private storageKey = 'cosmivity-practice-data';
  private listeners: Array<(subjects: AptitudeSubject[]) => void> = [];

  // Get data from localStorage
  private getData(): AptitudeSubject[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  }

  // Save data to localStorage
  private saveData(subjects: AptitudeSubject[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(subjects));
      this.notifyListeners(subjects);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  // Notify all listeners
  private notifyListeners(subjects: AptitudeSubject[]): void {
    this.listeners.forEach(callback => callback(subjects));
  }

  // Mock addDoc function
  async addDoc(collection: string, data: any): Promise<{ id: string }> {
    const subjects = this.getData();
    const newSubject: AptitudeSubject = {
      id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    subjects.push(newSubject);
    this.saveData(subjects);
    
    return { id: newSubject.id };
  }

  // Mock query function
  async getDocs(collection: string): Promise<{ empty: boolean; size: number }> {
    const subjects = this.getData();
    return {
      empty: subjects.length === 0,
      size: subjects.length
    };
  }

  // Mock onSnapshot function
  onSnapshot(collection: string, callback: (subjects: AptitudeSubject[]) => void): () => void {
    // Add listener
    this.listeners.push(callback);
    
    // Immediately call with current data
    const subjects = this.getData();
    callback(subjects);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Clear all data (for testing)
  clearData(): void {
    localStorage.removeItem(this.storageKey);
    this.notifyListeners([]);
  }

  // Clear specific collection (for compatibility with auto-upload service)
  async clearCollection(collection: string): Promise<void> {
    console.log(`🗑️ Clearing mock collection: ${collection}`);
    this.clearData();
  }

  // Check if we're in mock mode
  isMockMode(): boolean {
    return true;
  }
}

export const mockFirebaseService = new MockFirebaseService();
