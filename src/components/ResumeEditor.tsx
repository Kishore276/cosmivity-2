import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/components/ui/use-toast';
import { resumeService, ResumeData, templateService, ResumeTemplate } from '@/lib/firebase-services';
import { downloadResumeAsHTML, downloadResumeAsPDF } from '@/lib/resume-download';
import { ResumePreview } from '@/components/ResumePreview';
import {
  Save,
  Download,
  Plus,
  Trash2,
  Eye,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  FileText,
  Printer
} from 'lucide-react';

interface ResumeEditorProps {
  resumeId?: string;
  templateId: string;
  onSave?: (resumeId: string) => void;
}

export function ResumeEditor({ resumeId, templateId, onSave }: ResumeEditorProps) {
  const { user, firebaseUser } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<ResumeTemplate | null>(null);
  const [resumeData, setResumeData] = useState<Partial<ResumeData>>({
    name: 'My Resume',
    templateId,
    personalInfo: {
      fullName: user.name || '',
      email: user.email || '',
      phone: '',
      location: '',
      website: user.website || '',
      linkedin: user.linkedin || '',
      github: user.github || ''
    },
    summary: user.bio || '',
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: []
  });

  // Load existing resume if editing
  useEffect(() => {
    if (resumeId) {
      // In a real app, load the resume data from Firebase
      // For now, we'll use the default structure
    }
  }, [resumeId]);

  // Load template data
  useEffect(() => {
    const unsubscribe = templateService.subscribeToTemplates((templates) => {
      const template = templates.find(t => t.id === templateId);
      setCurrentTemplate(template || null);
    });

    return () => unsubscribe();
  }, [templateId]);

  const handleSave = async () => {
    if (!firebaseUser) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to save a resume."
      });
      return;
    }

    setLoading(true);
    try {
      const dataToSave = {
        ...resumeData,
        userId: firebaseUser.uid
      } as Omit<ResumeData, 'id' | 'createdAt' | 'updatedAt'>;

      let savedResumeId: string;
      if (resumeId) {
        await resumeService.updateResume(resumeId, dataToSave);
        savedResumeId = resumeId;
      } else {
        savedResumeId = await resumeService.createResume(dataToSave);
      }

      toast({
        title: "Success",
        description: "Resume saved successfully!"
      });

      onSave?.(savedResumeId);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save resume. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (format: 'html' | 'pdf' = 'html') => {
    const completeResumeData = resumeData as ResumeData;

    if (!completeResumeData.personalInfo?.fullName) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please add your name before downloading."
      });
      return;
    }

    try {
      if (format === 'pdf') {
        downloadResumeAsPDF(completeResumeData, currentTemplate || undefined);
        toast({
          title: "Opening Print Dialog",
          description: "Your resume is ready for printing or saving as PDF."
        });
      } else {
        downloadResumeAsHTML(completeResumeData, currentTemplate || undefined);
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



  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [
        ...(prev.experience || []),
        {
          id: Date.now().toString(),
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          current: false,
          description: '',
          achievements: []
        }
      ]
    }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [
        ...(prev.education || []),
        {
          id: Date.now().toString(),
          institution: '',
          degree: '',
          field: '',
          startDate: '',
          endDate: '',
          gpa: '',
          achievements: []
        }
      ]
    }));
  };

  const addSkillGroup = () => {
    setResumeData(prev => ({
      ...prev,
      skills: [
        ...(prev.skills || []),
        {
          category: '',
          items: []
        }
      ]
    }));
  };

  const addProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [
        ...(prev.projects || []),
        {
          id: Date.now().toString(),
          name: '',
          description: '',
          technologies: [],
          link: '',
          github: ''
        }
      ]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Resume Editor</h2>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowPreview(!showPreview)}
            variant={showPreview ? "default" : "outline"}
          >
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button onClick={() => handleDownload('html')} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download HTML
          </Button>
          <Button onClick={() => handleDownload('pdf')} variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print/PDF
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className={`grid gap-6 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Editor Section */}
        <div className="space-y-6">{/* Form content will go here */}

          {/* Personal Information */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={resumeData.personalInfo?.fullName || ''}
                  onChange={(e) => setResumeData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo!, fullName: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={resumeData.personalInfo?.email || ''}
                  onChange={(e) => setResumeData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo!, email: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={resumeData.personalInfo?.phone || ''}
                  onChange={(e) => setResumeData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo!, phone: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={resumeData.personalInfo?.location || ''}
                  onChange={(e) => setResumeData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo!, location: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={resumeData.personalInfo?.linkedin || ''}
                  onChange={(e) => setResumeData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo!, linkedin: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="github">GitHub</Label>
                <Input
                  id="github"
                  value={resumeData.personalInfo?.github || ''}
                  onChange={(e) => setResumeData(prev => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo!, github: e.target.value }
                  }))}
                />
              </div>
            </div>
          </Card>

          {/* Professional Summary */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Professional Summary</h3>
            </div>
            <Textarea
              value={resumeData.summary || ''}
              onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
              placeholder="Write a brief professional summary..."
              rows={4}
            />
          </Card>

          {/* Experience Section */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Experience</h3>
              </div>
              <Button onClick={addExperience} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Experience
              </Button>
            </div>
            {resumeData.experience?.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                No experience added yet. Click "Add Experience" to get started.
              </p>
            )}
          </Card>

          {/* Education Section */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Education</h3>
              </div>
              <Button onClick={addEducation} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Education
              </Button>
            </div>
            {resumeData.education?.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                No education added yet. Click "Add Education" to get started.
              </p>
            )}
          </Card>

          {/* Skills Section */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Code className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Skills</h3>
              </div>
              <Button onClick={addSkillGroup} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Skill Group
              </Button>
            </div>
            {resumeData.skills?.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                No skills added yet. Click "Add Skill Group" to get started.
              </p>
            )}
          </Card>

          {/* Projects Section */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Projects</h3>
              </div>
              <Button onClick={addProject} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </div>
            {resumeData.projects?.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                No projects added yet. Click "Add Project" to get started.
              </p>
            )}
          </Card>
        </div>

        {/* Preview Section */}
        {showPreview && currentTemplate && (
          <div className="space-y-4">
            <div className="sticky top-6">
              <div className="bg-muted px-4 py-2 rounded-t-lg">
                <h3 className="font-semibold text-sm">Live Preview - {currentTemplate.name}</h3>
              </div>
              <div className="border border-t-0 rounded-b-lg overflow-hidden">
                <div className="max-h-[80vh] overflow-y-auto">
                  <ResumePreview
                    resumeData={resumeData}
                    template={currentTemplate}
                    className="border-0 shadow-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
