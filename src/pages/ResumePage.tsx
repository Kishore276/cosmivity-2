import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/components/ui/use-toast';
import { resumeService, templateService, ResumeData, ResumeTemplate } from '@/lib/firebase-services';
import { ResumeEditor } from '@/components/ResumeEditor';
import { TemplatePreviewDialog } from '@/components/TemplatePreviewDialog';
import { ResumeQuickPreview } from '@/components/ResumeQuickPreview';
import { downloadResumeAsHTML, downloadResumeAsPDF } from '@/lib/resume-download';
import {
  FileText,
  Plus,
  CheckCircle,
  User,
  School,
  Briefcase,
  Award,
  Target,
  Star,
  Zap,
  Edit,
  Download,
  Eye,
  Trash2,
  ArrowLeft,
  Printer
} from 'lucide-react';

export default function ResumePage() {
  const { user, firebaseUser } = useUser();
  const { toast } = useToast();
  const [view, setView] = useState<'list' | 'templates' | 'editor'>('list');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [editingResumeId, setEditingResumeId] = useState<string>('');
  const [userResumes, setUserResumes] = useState<ResumeData[]>([]);
  const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  // Subscribe to user's resumes and templates
  useEffect(() => {
    if (!firebaseUser) return;

    const unsubscribeResumes = resumeService.subscribeToUserResumes(firebaseUser.uid, (resumes) => {
      setUserResumes(resumes);
    });

    const unsubscribeTemplates = templateService.subscribeToTemplates((templates) => {
      setTemplates(templates);
    });

    return () => {
      unsubscribeResumes();
      unsubscribeTemplates();
    };
  }, [firebaseUser]);

  // Add default templates if none exist
  const addDefaultTemplates = async () => {
    if (templates.length === 0) {
      setLoading(true);
      try {
        await templateService.addDefaultTemplates();
        toast({
          title: "Success",
          description: "Default templates added successfully!"
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add default templates."
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCreateResume = (templateId: string) => {
    setSelectedTemplate(templateId);
    setEditingResumeId('');
    setView('editor');
  };

  const handleEditResume = (resumeId: string) => {
    const resume = userResumes.find(r => r.id === resumeId);
    if (resume) {
      setSelectedTemplate(resume.templateId);
      setEditingResumeId(resumeId);
      setView('editor');
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    if (confirm('Are you sure you want to delete this resume?')) {
      try {
        await resumeService.deleteResume(resumeId);
        toast({
          title: "Success",
          description: "Resume deleted successfully!"
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete resume."
        });
      }
    }
  };

  const handleDownloadResume = (resume: ResumeData, format: 'html' | 'pdf' = 'html') => {
    try {
      const template = templates.find(t => t.id === resume.templateId);
      if (format === 'pdf') {
        downloadResumeAsPDF(resume, template);
        toast({
          title: "Opening Print Dialog",
          description: "Your resume is ready for printing or saving as PDF."
        });
      } else {
        downloadResumeAsHTML(resume, template);
        toast({
          title: "Download Started",
          description: "Your resume is being downloaded as HTML file."
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "There was an error downloading your resume."
      });
    }
  };

  const calculateProfileCompletion = () => {
    const sections = [
      { name: 'Personal Info', completed: !!(user.name && user.email) },
      { name: 'Education', completed: !!user.college },
      { name: 'Bio/Summary', completed: !!user.bio },
      { name: 'Skills', completed: user.skills && user.skills.length > 0 },
      { name: 'Experience', completed: !!user.experience },
      { name: 'Projects', completed: !!user.projects }
    ];

    const completedSections = sections.filter(section => section.completed).length;
    return {
      percentage: Math.round((completedSections / sections.length) * 100),
      sections
    };
  };

  const profileData = calculateProfileCompletion();

  // Show editor view
  if (view === 'editor') {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView('list')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Resumes
            </Button>
          </div>
          <ResumeEditor
            resumeId={editingResumeId || undefined}
            templateId={selectedTemplate}
            onSave={(resumeId) => {
              setView('list');
              toast({
                title: "Success",
                description: "Resume saved successfully!"
              });
            }}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Resume Builder</h1>
            <p className="text-muted-foreground mt-2">
              Create and manage your professional resumes with real-time templates.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setView('templates')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Resume
            </Button>
            {templates.length === 0 && (
              <Button onClick={addDefaultTemplates} disabled={loading}>
                <Plus className="h-4 w-4 mr-2" />
                {loading ? 'Adding...' : 'Add Templates'}
              </Button>
            )}
          </div>
        </div>

        {/* Show Templates View */}
        {view === 'templates' && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setView('list')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h2 className="text-xl font-semibold">Choose a Template</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="space-y-3">
                    <div className="relative">
                      <div className="w-full h-40 bg-muted rounded border flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                        <FileText className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <div className="absolute top-2 left-2 flex gap-1">
                        {template.atsScore >= 90 && (
                          <Badge className="text-xs bg-green-600">
                            <Star className="h-3 w-3 mr-1" />
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge variant="outline" className="text-xs">
                          ATS: {template.atsScore}%
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 bg-muted rounded-full h-2 relative overflow-hidden">
                          <div
                            className={`h-2 rounded-full absolute left-0 top-0 ${
                              template.atsScore >= 90 ? 'bg-green-600' :
                              template.atsScore >= 80 ? 'bg-yellow-600' : 'bg-red-600'
                            } ${
                              template.atsScore >= 95 ? 'w-full' :
                              template.atsScore >= 90 ? 'w-11/12' :
                              template.atsScore >= 85 ? 'w-5/6' :
                              template.atsScore >= 80 ? 'w-4/5' :
                              template.atsScore >= 75 ? 'w-3/4' :
                              template.atsScore >= 60 ? 'w-3/5' : 'w-1/2'
                            }`}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{template.atsScore}%</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <TemplatePreviewDialog
                        template={template}
                        onSelectTemplate={handleCreateResume}
                      />
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleCreateResume(template.id)}
                      >
                        Use Template
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Show Resume List View */}
        {view === 'list' && (
          <>
            {/* Your Resumes */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Your Resumes</h2>
                <Badge variant="secondary">{userResumes.length} resumes</Badge>
              </div>

              {userResumes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userResumes.map((resume) => (
                    <Card key={resume.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium truncate">{resume.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {templates.find(t => t.id === resume.templateId)?.name || 'Unknown Template'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Updated {resume.updatedAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleEditResume(resume.id)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <ResumeQuickPreview resume={resume} />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadResume(resume, 'html')}
                            title="Download as HTML"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadResume(resume, 'pdf')}
                            title="Print/Save as PDF"
                          >
                            <Printer className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteResume(resume.id)}
                            title="Delete resume"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No resumes yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first resume to get started with your job search.
                  </p>
                  <Button onClick={() => setView('templates')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Resume
                  </Button>
                </div>
              )}
            </Card>

            {/* Profile Completion */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Profile Completion</h3>
                <span className="text-sm text-muted-foreground">{profileData.percentage}% Complete</span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Completion</span>
                    <span>{profileData.percentage}%</span>
                  </div>
                  <Progress value={profileData.percentage} className="h-3" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profileData.sections.map((section, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        {section.completed ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-muted" />
                        )}
                        <span className="text-sm font-medium">{section.name}</span>
                      </div>
                      {!section.completed && (
                        <Button size="sm" variant="outline" asChild>
                          <a href="/profile">Add</a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </>
        )}

        {/* ATS Tips */}
        {view === 'list' && (
          <Card className="p-6 bg-green-50 border-green-200">
            <h3 className="font-semibold mb-3 text-green-800">🎯 ATS Optimization Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2 text-green-800">Format Guidelines</h4>
                <ul className="space-y-1 text-green-700">
                  <li>• Use standard fonts (Arial, Calibri, Times New Roman)</li>
                  <li>• Avoid images, graphics, and complex formatting</li>
                  <li>• Use standard section headings</li>
                  <li>• Save as .docx or .pdf format</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2 text-green-800">Content Tips</h4>
                <ul className="space-y-1 text-green-700">
                  <li>• Include relevant keywords from job description</li>
                  <li>• Use bullet points for easy scanning</li>
                  <li>• Include contact information in header</li>
                  <li>• Use action verbs and quantify achievements</li>
                </ul>
              </div>
            </div>
          </Card>
        )}

      </div>
    </DashboardLayout>
  );
}
