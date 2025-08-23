/**
 * Practice Data Service
 * Loads and processes practice questions from JSON files
 */

import { AptitudeSubject } from './firebase-services';

interface RawQuestion {
  id: string;
  question: string;
  options: string[] | { [key: string]: string };
  answer: string;
  correctOption: string;
  difficulty?: string;
  explanation?: string;
  passage?: string; // For reading comprehension questions
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
      // Handle different JSON formats
      let subjectName = '';
      let description = '';
      let questionsData: any[] = [];

      if (rawData.quantitativeAptitude) {
        // Handle quantitative aptitude format - create lessons by topic
        subjectName = 'Quantitative Aptitude';
        description = 'Quantitative aptitude questions covering various mathematical concepts';
        
        const processedLessons: any[] = [];
        let lessonOrder = 0;

        Object.keys(rawData.quantitativeAptitude).forEach(topic => {
          const topicQuestions = rawData.quantitativeAptitude[topic];
          if (Array.isArray(topicQuestions) && topicQuestions.length > 0) {
            const questionsData = topicQuestions.map(q => ({
              id: `${topic}_${q.id}`,
              question: q.question,
              options: Object.entries(q.options).map(([key, value]) => `${key}) ${value}`),
              answer: q.options[q.correctOption],
              correctOption: q.correctOption,
              difficulty: 'Medium',
              explanation: q.explanation
            }));

            const cleanedQuestions = this.cleanQuestions(questionsData);
            
            if (cleanedQuestions.length > 0) {
              processedLessons.push({
                id: `lesson-${topic}`,
                title: topic.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                description: `Practice questions for ${topic.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
                content: '',
                order: lessonOrder++,
                questions: cleanedQuestions
              });
            }
          }
        });

        // Map category to expected type
        let mappedCategory: 'quantitative' | 'logical' | 'verbal' = 'quantitative';

        const subject: AptitudeSubject = {
          id: category,
          name: subjectName,
          category: mappedCategory,
          description: description,
          lessons: processedLessons,
          createdBy: 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        return subject;
      } else if (rawData.logicalReasoning) {
        // Handle logical reasoning format - create lessons by topic
        subjectName = 'Logical Reasoning';
        description = 'Logical reasoning questions covering various analytical concepts';
        
        const processedLessons: any[] = [];
        let lessonOrder = 0;

        Object.keys(rawData.logicalReasoning).forEach(topic => {
          const topicQuestions = rawData.logicalReasoning[topic];
          if (Array.isArray(topicQuestions) && topicQuestions.length > 0) {
            const questionsData = topicQuestions.map(q => ({
              id: `${topic}_${q.id}`,
              question: q.question,
              options: Object.entries(q.options).map(([key, value]) => `${key}) ${value}`),
              answer: q.options[q.correctOption],
              correctOption: q.correctOption,
              difficulty: 'Medium',
              explanation: q.explanation
            }));

            const cleanedQuestions = this.cleanQuestions(questionsData);
            
            if (cleanedQuestions.length > 0) {
              processedLessons.push({
                id: `lesson-${topic}`,
                title: topic.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                description: `Practice questions for ${topic.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
                content: '',
                order: lessonOrder++,
                questions: cleanedQuestions
              });
            }
          }
        });

        // Map category to expected type
        let mappedCategory: 'quantitative' | 'logical' | 'verbal' = 'logical';

        const subject: AptitudeSubject = {
          id: category,
          name: subjectName,
          category: mappedCategory,
          description: description,
          lessons: processedLessons,
          createdBy: 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        return subject;
      } else if (rawData.verbalAbility) {
        // Handle verbal ability format - create lessons by topic
        subjectName = 'Verbal Ability';
        description = 'Verbal ability questions covering various language concepts';
        
        const processedLessons: any[] = [];
        let lessonOrder = 0;

        Object.keys(rawData.verbalAbility).forEach(topic => {
          const topicQuestions = rawData.verbalAbility[topic];
          if (Array.isArray(topicQuestions) && topicQuestions.length > 0) {
            const questionsData = topicQuestions.map(q => ({
              id: `${topic}_${q.id}`,
              question: q.question,
              options: Object.entries(q.options).map(([key, value]) => `${key}) ${value}`),
              answer: q.options[q.correctOption],
              correctOption: q.correctOption,
              difficulty: 'Medium',
              explanation: q.explanation,
              passage: q.passage // Preserve passage for reading comprehension
            }));

            const cleanedQuestions = this.cleanQuestions(questionsData);
            
            if (cleanedQuestions.length > 0) {
              processedLessons.push({
                id: `lesson-${topic}`,
                title: topic.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                description: `Practice questions for ${topic.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
                content: '',
                order: lessonOrder++,
                questions: cleanedQuestions
              });
            }
          }
        });

        // Map category to expected type
        let mappedCategory: 'quantitative' | 'logical' | 'verbal' = 'verbal';

        const subject: AptitudeSubject = {
          id: category,
          name: subjectName,
          category: mappedCategory,
          description: description,
          lessons: processedLessons,
          createdBy: 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        return subject;
      } else if (rawData.lessons && Array.isArray(rawData.lessons)) {
        // Handle standard format (logical reasoning, verbal ability)
        subjectName = rawData.name;
        description = rawData.description || `Practice questions for ${rawData.name}`;
        
        // Process all lessons and preserve their original structure
        const processedLessons = rawData.lessons.map((lesson: any) => {
          const cleanedQuestions = this.cleanQuestions(lesson.questions || []);
          return {
            id: lesson.id,
            title: lesson.title,
            description: lesson.description,
            content: lesson.content || '',
            order: lesson.order || 0,
            questions: cleanedQuestions
          };
        }).filter((lesson: any) => lesson.questions.length > 0);

        // Map category to expected type
        let mappedCategory: 'quantitative' | 'logical' | 'verbal';
        if (category === 'quantitative-aptitude') mappedCategory = 'quantitative';
        else if (category === 'logical-reasoning') mappedCategory = 'logical';
        else mappedCategory = 'verbal';

        const subject: AptitudeSubject = {
          id: category,
          name: subjectName,
          category: mappedCategory,
          description: description,
          lessons: processedLessons,
          createdBy: 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        return subject;
      } else {
        console.error('❌ Invalid data structure - no recognized format');
        return null;
      }
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
        // Handle different option formats
        let validOptions: string[] = [];
        
        if (Array.isArray(question.options)) {
          // Array format (like logical reasoning)
          validOptions = question.options
            .filter(opt => opt && opt.trim() && !opt.match(/^[A-D]\)\s*$/))
            .map(opt => opt.trim());
        } else if (typeof question.options === 'object') {
          // Object format (like quantitative aptitude)
          validOptions = Object.entries(question.options)
            .map(([key, value]) => `${key}) ${value}`)
            .filter(opt => opt && opt.trim());
        }

        // Skip questions with less than 2 options (allow for true/false type questions)
        if (validOptions.length < 2) {
          console.log(`⚠️  Skipping Q${index + 1}: Only ${validOptions.length} valid options`);
          return;
        }

        // Ensure proper A), B), C), D) format for options
        const formattedOptions = validOptions.map((opt, i) => {
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
          explanation: explanation,
          passage: question.passage // Preserve passage for reading comprehension
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
