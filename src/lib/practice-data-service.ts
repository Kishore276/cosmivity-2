/**
 * Practice Data Service
 * Loads and processes practice questions from JSON files
 */

import { AptitudeSubject } from './firebase-services';

interface RawQuestion {
  id: string;
  question: string;
  options: string[];
  answer: string;
  correctOption: string;
  difficulty?: string;
  explanation?: string;
}

interface ProcessedQuestion extends RawQuestion {
  explanation: string;
}

class PracticeDataService {
  private subjects: AptitudeSubject[] = [];
  private isLoaded = false;

  /**
   * Load and process all practice data
   */
  async loadPracticeData(): Promise<AptitudeSubject[]> {
    if (this.isLoaded && this.subjects.length > 0) {
      return this.subjects;
    }

    try {
      console.log('🚀 Loading practice data from JSON files...');
      
      const files = [
        { 
          path: '/practice topics/verbal_ability.json',
          expectedName: 'Verbal Ability',
          category: 'verbal-ability'
        },
        { 
          path: '/practice topics/logical_reasoning.json',
          expectedName: 'Logical Reasoning',
          category: 'logical-reasoning'
        },
        { 
          path: '/practice topics/quantitative_aptitude.json',
          expectedName: 'Quantitative Aptitude',
          category: 'quantitative-aptitude'
        }
      ];

      const loadedSubjects: AptitudeSubject[] = [];

      for (const file of files) {
        try {
          console.log(`📁 Loading: ${file.path}`);
          const response = await fetch(file.path);
          
          if (!response.ok) {
            console.error(`❌ Failed to load ${file.path}: ${response.status}`);
            continue;
          }

          const rawData = await response.json();
          const processedSubject = this.processSubjectData(rawData, file.category);
          
          if (processedSubject) {
            loadedSubjects.push(processedSubject);
            console.log(`✅ Loaded ${processedSubject.name}: ${this.countTotalQuestions(processedSubject)} questions`);
          }
        } catch (error) {
          console.error(`❌ Error loading ${file.path}:`, error);
        }
      }

      this.subjects = loadedSubjects;
      this.isLoaded = true;
      
      const totalQuestions = this.subjects.reduce((sum, subject) => sum + this.countTotalQuestions(subject), 0);
      console.log(`🎯 Successfully loaded ${this.subjects.length} subjects with ${totalQuestions} total questions`);
      
      return this.subjects;
    } catch (error) {
      console.error('❌ Error loading practice data:', error);
      throw error;
    }
  }

  /**
   * Process and clean subject data
   */
  private processSubjectData(rawData: any, category: string): AptitudeSubject | null {
    try {
      if (!rawData || !rawData.lessons || !Array.isArray(rawData.lessons) || rawData.lessons.length === 0) {
        console.error('❌ Invalid data structure');
        return null;
      }

      const rawQuestions = rawData.lessons[0].questions || [];
      const cleanedQuestions = this.cleanQuestions(rawQuestions);
      
      if (cleanedQuestions.length === 0) {
        console.error('❌ No valid questions found');
        return null;
      }

      // Organize questions into lessons based on content type
      const lessons = this.organizeIntoLessons(cleanedQuestions, rawData.name);

      const subject: AptitudeSubject = {
        id: category,
        name: rawData.name,
        category: category,
        description: rawData.description || `Practice questions for ${rawData.name}`,
        lessons: lessons,
        createdBy: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return subject;
    } catch (error) {
      console.error('❌ Error processing subject data:', error);
      return null;
    }
  }

  /**
   * Clean and validate questions
   */
  private cleanQuestions(rawQuestions: RawQuestion[]): ProcessedQuestion[] {
    const cleanedQuestions: ProcessedQuestion[] = [];

    rawQuestions.forEach((question, index) => {
      try {
        // Clean options - remove empty ones and fix formatting
        const validOptions = question.options
          .filter(opt => opt && opt.trim() && !opt.match(/^[A-D]\)\s*$/))
          .map(opt => opt.trim());

        // Skip questions with less than 4 options
        if (validOptions.length < 4) {
          console.log(`⚠️  Skipping Q${index + 1}: Only ${validOptions.length} valid options`);
          return;
        }

        // Ensure we have exactly 4 options with proper A), B), C), D) format
        const formattedOptions = validOptions.slice(0, 4).map((opt, i) => {
          const letter = String.fromCharCode(65 + i); // A, B, C, D
          if (opt.match(/^[A-D]\)/)) {
            return opt;
          } else {
            return `${letter}) ${opt}`;
          }
        });

        // Fix answer and correctOption
        let answer = question.answer?.trim() || '';
        let correctOption = question.correctOption?.trim() || '';

        // If answer is missing but correctOption exists, try to derive answer
        if (!answer && correctOption) {
          const optionIndex = correctOption.charCodeAt(0) - 65; // A=0, B=1, etc.
          if (optionIndex >= 0 && optionIndex < formattedOptions.length) {
            answer = formattedOptions[optionIndex].replace(/^[A-D]\)\s*/, '').trim();
          }
        }

        // If correctOption is missing but answer exists, try to find it
        if (!correctOption && answer) {
          const answerIndex = formattedOptions.findIndex(opt => 
            opt.toLowerCase().includes(answer.toLowerCase())
          );
          if (answerIndex >= 0) {
            correctOption = String.fromCharCode(65 + answerIndex);
          }
        }

        // Skip if we still don't have both answer and correctOption
        if (!answer || !correctOption) {
          console.log(`⚠️  Skipping Q${index + 1}: Missing answer or correctOption`);
          return;
        }

        // Generate explanation if missing
        const explanation = question.explanation || 
          `The correct answer is ${correctOption}) ${answer}`;

        const cleanedQuestion: ProcessedQuestion = {
          id: question.id || `q${index + 1}`,
          question: question.question.trim(),
          options: formattedOptions,
          answer: answer,
          correctOption: correctOption,
          difficulty: question.difficulty || 'Medium',
          explanation: explanation
        };

        cleanedQuestions.push(cleanedQuestion);
      } catch (error) {
        console.error(`❌ Error processing question ${index + 1}:`, error);
      }
    });

    return cleanedQuestions;
  }

  /**
   * Organize questions into lessons
   */
  private organizeIntoLessons(questions: ProcessedQuestion[], subjectName: string): any[] {
    const questionsPerLesson = 20;
    const lessons: any[] = [];
    
    for (let i = 0; i < questions.length; i += questionsPerLesson) {
      const lessonQuestions = questions.slice(i, i + questionsPerLesson);
      const lessonNumber = Math.floor(i / questionsPerLesson) + 1;
      
      lessons.push({
        id: `lesson-${lessonNumber}`,
        title: `${subjectName} - Lesson ${lessonNumber}`,
        description: `Practice questions ${i + 1} to ${Math.min(i + questionsPerLesson, questions.length)}`,
        content: '',
        order: lessonNumber - 1,
        questions: lessonQuestions
      });
    }

    return lessons;
  }

  /**
   * Count total questions in a subject
   */
  private countTotalQuestions(subject: AptitudeSubject): number {
    return subject.lessons.reduce((total, lesson) => 
      total + (lesson.questions?.length || 0), 0
    );
  }

  /**
   * Get loaded subjects
   */
  getSubjects(): AptitudeSubject[] {
    return this.subjects;
  }

  /**
   * Check if data is loaded
   */
  isDataLoaded(): boolean {
    return this.isLoaded && this.subjects.length > 0;
  }

  /**
   * Force reload data
   */
  async reloadData(): Promise<AptitudeSubject[]> {
    this.isLoaded = false;
    this.subjects = [];
    return this.loadPracticeData();
  }
}

export const practiceDataService = new PracticeDataService();
