import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  Calculator,
  Lightbulb,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
} from 'lucide-react';

// Import the services
import { aptitudeService, AptitudeSubject } from '@/lib/firebase-services';
import { practiceDataService } from '@/lib/practice-data-service';

export default function PracticePage() {
  const { user, firebaseUser, loading } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Authentication guard
  useEffect(() => {
    if (!loading && !firebaseUser) {
      navigate('/auth');
    }
  }, [firebaseUser, loading, navigate]);

  // State management
  const [subjects, setSubjects] = useState<AptitudeSubject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<AptitudeSubject | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [view, setView] = useState<'subjects' | 'lessons' | 'practice' | 'results'>('subjects');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load practice data from JSON files
  useEffect(() => {
    const loadPracticeData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('🚀 Loading practice data...');
        const loadedSubjects = await practiceDataService.loadPracticeData();

        setSubjects(loadedSubjects);

        if (loadedSubjects.length > 0) {
          const totalQuestions = loadedSubjects.reduce((sum, subject) =>
            sum + subject.lessons.reduce((lessonSum, lesson) =>
              lessonSum + (lesson.questions?.length || 0), 0
            ), 0
          );

          toast({
            title: "Practice Data Loaded!",
            description: `Successfully loaded ${totalQuestions} questions across ${loadedSubjects.length} subjects.`
          });
        }
      } catch (error) {
        console.error('❌ Error loading practice data:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load practice data';
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Loading Failed",
          description: errorMessage
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPracticeData();
  }, [toast]);

  // Navigation functions
  const selectSubject = (subject: AptitudeSubject) => {
    setSelectedSubject(subject);
    setView('lessons');
  };

  const startLesson = (lesson: any) => {
    setSelectedLesson(lesson);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setView('practice');
  };

  const backToSubjects = () => {
    setSelectedSubject(null);
    setSelectedLesson(null);
    setView('subjects');
  };

  const backToLessons = () => {
    setSelectedLesson(null);
    setView('lessons');
  };

  const finishTest = () => {
    setView('results');
  };


  // Handle answer selection
  const handleAnswerSelect = (questionId: string, answer: string) => {
    // Ensure we always store clean text without prefixes
    const cleanAnswer = answer.replace(/^[A-D]\)\s*/, '').trim();
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: cleanAnswer
    }));
  };

  // Helper function to parse options consistently
  const parseOptions = (options: any): string[] => {
    if (Array.isArray(options)) {
      if (options.length === 1 && typeof options[0] === 'string') {
        // Handle format like ["A) Hostile\n B) Kind\n C) Aggressive\n D) Unjust"]
        const optionString = options[0];
        const rawOptions = optionString.split('\n').map(opt => opt.trim()).filter(opt => opt.length > 0);
        // Clean up options by removing A), B), C), D) prefixes more aggressively
        const cleanedOptions = rawOptions.map((opt) => {
          const cleaned = opt.replace(/^[A-Z]\)\s*/, '').trim();
          return cleaned;
        });
        return cleanedOptions;
      } else {
        // Handle normal array format - data already processed by autoUploadService
        // But still clean each option just in case
        const cleanedOptions = options.map(opt => {
          if (typeof opt === 'string') {
            return opt.replace(/^[A-Z]\)\s*/, '').trim();
          }
          return opt;
        });
        return cleanedOptions;
      }
    }
    return [];
  };

  // Helper function to check if answer matches (case-insensitive, trimmed)
  const isAnswerCorrect = (userAnswer: string, correctAnswer: string): boolean => {
    if (!userAnswer || !correctAnswer) return false;
    return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
  };

  // Helper functions for category styling
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'quantitative-aptitude':
        return 'w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center';
      case 'logical-reasoning':
        return 'w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center';
      case 'verbal-ability':
        return 'w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center';
      default:
        return 'w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'quantitative-aptitude':
        return <Calculator className="h-6 w-6 text-blue-600" />;
      case 'logical-reasoning':
        return <Lightbulb className="h-6 w-6 text-green-600" />;
      case 'verbal-ability':
        return <BookOpen className="h-6 w-6 text-purple-600" />;
      default:
        return <Brain className="h-6 w-6 text-gray-600" />;
    }
  };

  // Show loading state if user context is not ready
  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Card className="p-6">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full"></div>
              <p className="text-muted-foreground">Loading user data...</p>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }



  // Render different views based on current state
  const renderContent = () => {
    switch (view) {
      case 'lessons':
        return renderLessonsView();
      case 'practice':
        return renderPracticeView();
      case 'results':
        return renderResultsView();
      default:
        return renderSubjectsView();
    }
  };

  // Subjects view
  const renderSubjectsView = () => (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Practice Hub</h1>
          <p className="text-muted-foreground mt-2">
            Practice with Quantitative Aptitude, Logical Reasoning, and Verbal Ability questions.
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="p-8 border-red-200 bg-red-50">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <Brain className="h-16 w-16 mx-auto mb-4" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-red-800">Error Loading Practice Data</h3>
            <p className="text-red-700 max-w-2xl mx-auto mb-4">
              {error}
            </p>
          </div>
        </Card>
      )}

      {/* Subjects Grid */}
      {!error && subjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <Card key={subject.id} className="p-6 cursor-pointer hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className={getCategoryColor(subject.category)}>
                  {getCategoryIcon(subject.category)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{subject.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {subject.category.replace('-', ' ')}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Lessons</span>
                  <Badge variant="secondary">{subject.lessons.length}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Questions</span>
                  <Badge variant="secondary">
                    {subject.lessons.reduce((total, lesson) => total + (lesson.questions?.length || 0), 0)}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center">
                <Button variant="outline" size="sm" onClick={() => selectSubject(subject)}>
                  View Lessons →
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Loading State */}
      {!error && isLoading && (
        <Card className="p-8">
          <div className="text-center">
            <div className="animate-spin h-16 w-16 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full"></div>
            <h3 className="text-xl font-semibold mb-3">Loading Practice Content...</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Processing and validating practice questions from JSON files...
            </p>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!error && !isLoading && subjects.length === 0 && (
        <Card className="p-8">
          <div className="text-center">
            <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-3">No Practice Content Found</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-4">
              No valid practice questions were found. Please check your JSON files.
            </p>
          </div>
        </Card>
      )}
    </div>
  );

  // Lessons view
  const renderLessonsView = () => (
    <div className="p-6 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={backToSubjects}>
          ← Back to Subjects
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{selectedSubject?.name}</h1>
          <p className="text-muted-foreground mt-2 capitalize">
            {selectedSubject?.category.replace('-', ' ')} • {selectedSubject?.lessons.length} Lessons
          </p>
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {selectedSubject?.lessons.map((lesson, index) => (
          <Card key={lesson.id} className="p-6 cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold text-lg">{index + 1}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{lesson.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {lesson.questions.length} Questions
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center">
              <Button variant="outline" size="sm" onClick={() => startLesson(lesson)}>
                Start Practice →
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  // Practice view with questions
  const renderPracticeView = () => {
    if (!selectedLesson || !selectedLesson.questions || selectedLesson.questions.length === 0) {
      return (
        <div className="p-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">No Questions Available</h2>
            <p>This lesson doesn't have any questions yet.</p>
            <Button onClick={backToLessons} className="mt-4">Back to Lessons</Button>
          </Card>
        </div>
      );
    }

    const currentQuestion = selectedLesson.questions[currentQuestionIndex];
    const totalQuestions = selectedLesson.questions.length;
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

    // Parse options using helper function
    const options = parseOptions(currentQuestion.options);

    const nextQuestion = () => {
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    };

    const prevQuestion = () => {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
      }
    };

    const selectAnswer = (answer: string) => {
      handleAnswerSelect(currentQuestion.id, answer);
    };

    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={backToLessons}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Lessons
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{selectedLesson.title}</h1>
              <p className="text-muted-foreground">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-48 bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>
            <span className="text-sm text-muted-foreground">
              {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%
            </span>
          </div>
        </div>

        {/* Question Card */}
        <Card className="p-8">
          <div className="space-y-6">
            {/* Question */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {currentQuestionIndex + 1}
                </div>
                <Badge variant="outline" className="capitalize">
                  {currentQuestion.difficulty || 'Medium'}
                </Badge>
              </div>
              <h2 className="text-xl font-semibold leading-relaxed">
                {currentQuestion.question}
              </h2>
              
              {/* Passage for reading comprehension */}
              {currentQuestion.passage && (
                <div className="mt-6 p-4 bg-muted/30 border-l-4 border-primary rounded-r-lg">
                  <h3 className="font-semibold text-lg mb-3 text-primary">Reading Passage:</h3>
                  <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                    {currentQuestion.passage.replace(/\[cite_start\].*?\[cite: \d+(, \d+)*\]/g, '').replace(/\r\n/g, '\n')}
                  </div>
                </div>
              )}
            </div>





            {/* Options */}
            {options.length > 0 ? (
              <div className="space-y-3">
                {options.map((option, index) => {
                  const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
                  const isSelected = userAnswers[currentQuestion.id] === option;

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectAnswer(option)}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all hover:border-primary/50 ${
                        isSelected
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                          isSelected
                            ? 'border-primary bg-primary text-white'
                            : 'border-muted-foreground'
                        }`}>
                          {optionLetter}
                        </div>
                        <span className="flex-1">{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">No options available for this question.</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {Object.keys(userAnswers).length} of {totalQuestions} answered
                </span>
              </div>

              {isLastQuestion ? (
                <Button onClick={finishTest} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Finish Test
                </Button>
              ) : (
                <Button onClick={nextQuestion}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderResultsView = () => {
    if (!selectedLesson || !selectedLesson.questions) {
      return (
        <div className="p-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">No Results Available</h2>
            <Button onClick={backToLessons} className="mt-4">Back to Lessons</Button>
          </Card>
        </div>
      );
    }

    const questions = selectedLesson.questions;
    const totalQuestions = questions.length;
    const answeredQuestions = Object.keys(userAnswers).length;

    // Calculate score
    let correctAnswers = 0;
    questions.forEach((question: any) => {
      const userAnswer = userAnswers[question.id];
      if (userAnswer === question.answer) {
        correctAnswers++;
      }
    });

    const scorePercentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Test Results</h1>
            <p className="text-muted-foreground mt-2">{selectedLesson.title}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={backToLessons}>
              Back to Lessons
            </Button>
            <Button onClick={() => {
              setCurrentQuestionIndex(0);
              setUserAnswers({});
              setView('practice');
            }}>
              Retake Test
            </Button>
          </div>
        </div>

        {/* Score Summary */}
        <Card className="p-8">
          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-primary">{scorePercentage}%</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Your Score</h2>
              <p className="text-muted-foreground">
                {correctAnswers} out of {totalQuestions} questions correct
              </p>
            </div>
            <div className="flex items-center justify-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{totalQuestions - correctAnswers}</div>
                <div className="text-sm text-muted-foreground">Incorrect</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{totalQuestions - answeredQuestions}</div>
                <div className="text-sm text-muted-foreground">Unanswered</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Detailed Results */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-6">Detailed Review</h3>
          <div className="space-y-6">
            {questions.map((question: any, index: number) => {
              const userAnswer = userAnswers[question.id];
              const isCorrect = userAnswer === question.answer;
              const isAnswered = !!userAnswer;
              const options = parseOptions(question.options);





              return (
                <div key={question.id} className="border rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      isCorrect ? 'bg-green-600' : isAnswered ? 'bg-red-600' : 'bg-yellow-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <h4 className="font-semibold text-lg">{question.question}</h4>
                        <Badge variant="outline" className="mt-2 capitalize">
                          {question.difficulty || 'Medium'}
                        </Badge>
                      </div>

                      {options.length > 0 && (
                        <div className="space-y-2">
                          {options.map((option, optIndex) => {
                            const optionLetter = String.fromCharCode(65 + optIndex);

                            // Simple, direct comparison
                            const isUserAnswer = userAnswer === option;
                            const isCorrectAnswer = question.answer === option;

                            return (
                              <div
                                key={optIndex}
                                className={`p-3 rounded-lg border ${
                                  isCorrectAnswer
                                    ? 'border-green-500 bg-green-50 text-green-800'
                                    : isUserAnswer
                                    ? 'border-red-500 bg-red-50 text-red-800'
                                    : 'border-gray-200'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="font-bold">{optionLetter})</span>
                                  <span>{option}</span>
                                  {isCorrectAnswer && (
                                    <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                                  )}
                                  {isUserAnswer && !isCorrectAnswer && (
                                    <span className="text-red-600 ml-auto">Your answer</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Status:</span>
                          {isCorrect ? (
                            <Badge className="bg-green-600">Correct</Badge>
                          ) : isAnswered ? (
                            <Badge variant="destructive">Incorrect</Badge>
                          ) : (
                            <Badge variant="secondary">Not Answered</Badge>
                          )}
                        </div>

                        {/* Show user's answer and correct answer */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <span className="font-semibold text-gray-700">Your Answer:</span>
                            <p className="text-gray-800 mt-1">
                              {isAnswered ? userAnswer : "Not answered"}
                            </p>
                          </div>
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <span className="font-semibold text-green-700">Correct Answer:</span>
                            <p className="text-green-800 mt-1">{question.answer}</p>
                          </div>
                        </div>

                        {question.explanation && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <span className="font-semibold text-blue-800">Explanation:</span>
                            <p className="text-blue-700 mt-1">{question.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!firebaseUser) {
    return null;
  }

  // Main render
  return (
    <DashboardLayout>
      {renderContent()}
    </DashboardLayout>
  );
}
