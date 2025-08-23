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

  const addCertification = () => {
    setResumeData(prev => ({
      ...prev,
      certifications: [
        ...(prev.certifications || []),
        {
          id: Date.now().toString(),
          name: '',
          issuer: '',
          date: '',
          link: ''
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
            
            {resumeData.experience && resumeData.experience.length > 0 ? (
              <div className="space-y-4">
                {resumeData.experience.map((exp, index) => (
                  <div key={exp.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Experience {index + 1}</h4>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setResumeData(prev => ({
                          ...prev,
                          experience: prev.experience?.filter((_, i) => i !== index) || []
                        }))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Company</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            experience: prev.experience?.map((item, i) => 
                              i === index ? { ...item, company: e.target.value } : item
                            ) || []
                          }))}
                          placeholder="Company name"
                        />
                      </div>
                      <div>
                        <Label>Position</Label>
                        <Input
                          value={exp.position}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            experience: prev.experience?.map((item, i) => 
                              i === index ? { ...item, position: e.target.value } : item
                            ) || []
                          }))}
                          placeholder="Job title"
                        />
                      </div>
                      <div>
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={exp.startDate}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            experience: prev.experience?.map((item, i) => 
                              i === index ? { ...item, startDate: e.target.value } : item
                            ) || []
                          }))}
                        />
                      </div>
                      <div>
                        <Label>End Date</Label>
                        <div className="space-y-2">
                          <Input
                            type="date"
                            value={exp.endDate}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              experience: prev.experience?.map((item, i) => 
                                i === index ? { ...item, endDate: e.target.value } : item
                              ) || []
                            }))}
                            disabled={exp.current}
                          />
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`current-${index}`}
                              checked={exp.current}
                              onChange={(e) => setResumeData(prev => ({
                                ...prev,
                                experience: prev.experience?.map((item, i) => 
                                  i === index ? { ...item, current: e.target.checked, endDate: e.target.checked ? '' : item.endDate } : item
                                ) || []
                              }))}
                              className="rounded"
                              aria-label="Currently working here"
                            />
                            <Label htmlFor={`current-${index}`} className="text-sm">Current Position</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Job Description</Label>
                      <Textarea
                        value={exp.description}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          experience: prev.experience?.map((item, i) => 
                            i === index ? { ...item, description: e.target.value } : item
                          ) || []
                        }))}
                        placeholder="Describe your responsibilities and achievements..."
                        rows={3}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
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
            
            {resumeData.education && resumeData.education.length > 0 ? (
              <div className="space-y-4">
                {resumeData.education.map((edu, index) => (
                  <div key={edu.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Education {index + 1}</h4>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setResumeData(prev => ({
                          ...prev,
                          education: prev.education?.filter((_, i) => i !== index) || []
                        }))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Institution</Label>
                        <Input
                          value={edu.institution}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            education: prev.education?.map((item, i) => 
                              i === index ? { ...item, institution: e.target.value } : item
                            ) || []
                          }))}
                          placeholder="University/College name"
                        />
                      </div>
                      <div>
                        <Label>Degree</Label>
                        <Input
                          value={edu.degree}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            education: prev.education?.map((item, i) => 
                              i === index ? { ...item, degree: e.target.value } : item
                            ) || []
                          }))}
                          placeholder="e.g., Bachelor of Science"
                        />
                      </div>
                      <div>
                        <Label>Field of Study</Label>
                        <Input
                          value={edu.field}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            education: prev.education?.map((item, i) => 
                              i === index ? { ...item, field: e.target.value } : item
                            ) || []
                          }))}
                          placeholder="e.g., Computer Science"
                        />
                      </div>
                      <div>
                        <Label>GPA (Optional)</Label>
                        <Input
                          value={edu.gpa}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            education: prev.education?.map((item, i) => 
                              i === index ? { ...item, gpa: e.target.value } : item
                            ) || []
                          }))}
                          placeholder="e.g., 3.8/4.0"
                        />
                      </div>
                      <div>
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={edu.startDate}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            education: prev.education?.map((item, i) => 
                              i === index ? { ...item, startDate: e.target.value } : item
                            ) || []
                          }))}
                        />
                      </div>
                      <div>
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={edu.endDate}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            education: prev.education?.map((item, i) => 
                              i === index ? { ...item, endDate: e.target.value } : item
                            ) || []
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
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
            
            {resumeData.skills && resumeData.skills.length > 0 ? (
              <div className="space-y-4">
                {resumeData.skills.map((skillGroup, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Skill Group {index + 1}</h4>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setResumeData(prev => ({
                          ...prev,
                          skills: prev.skills?.filter((_, i) => i !== index) || []
                        }))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label>Category</Label>
                        <Input
                          value={skillGroup.category}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            skills: prev.skills?.map((item, i) => 
                              i === index ? { ...item, category: e.target.value } : item
                            ) || []
                          }))}
                          placeholder="e.g., Programming Languages, Frameworks, Tools"
                        />
                      </div>
                      <div>
                        <Label>Skills (comma-separated)</Label>
                        <Input
                          value={skillGroup.items.join(', ')}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            skills: prev.skills?.map((item, i) => 
                              i === index ? { ...item, items: e.target.value.split(',').map(s => s.trim()).filter(s => s) } : item
                            ) || []
                          }))}
                          placeholder="e.g., React, TypeScript, Node.js, Python"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {skillGroup.items.map((skill, skillIndex) => (
                          <Badge key={skillIndex} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
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
            
            {resumeData.projects && resumeData.projects.length > 0 ? (
              <div className="space-y-4">
                {resumeData.projects.map((project, index) => (
                  <div key={project.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Project {index + 1}</h4>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setResumeData(prev => ({
                          ...prev,
                          projects: prev.projects?.filter((_, i) => i !== index) || []
                        }))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Project Name</Label>
                        <Input
                          value={project.name}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            projects: prev.projects?.map((item, i) => 
                              i === index ? { ...item, name: e.target.value } : item
                            ) || []
                          }))}
                          placeholder="Project title"
                        />
                      </div>
                      <div>
                        <Label>Technologies (comma-separated)</Label>
                        <Input
                          value={project.technologies.join(', ')}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            projects: prev.projects?.map((item, i) => 
                              i === index ? { ...item, technologies: e.target.value.split(',').map(s => s.trim()).filter(s => s) } : item
                            ) || []
                          }))}
                          placeholder="e.g., React, Node.js, MongoDB"
                        />
                      </div>
                      <div>
                        <Label>Live Link (Optional)</Label>
                        <Input
                          value={project.link}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            projects: prev.projects?.map((item, i) => 
                              i === index ? { ...item, link: e.target.value } : item
                            ) || []
                          }))}
                          placeholder="https://example.com"
                        />
                      </div>
                      <div>
                        <Label>GitHub Link (Optional)</Label>
                        <Input
                          value={project.github}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            projects: prev.projects?.map((item, i) => 
                              i === index ? { ...item, github: e.target.value } : item
                            ) || []
                          }))}
                          placeholder="https://github.com/username/repo"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Project Description</Label>
                      <Textarea
                        value={project.description}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          projects: prev.projects?.map((item, i) => 
                            i === index ? { ...item, description: e.target.value } : item
                          ) || []
                        }))}
                        placeholder="Describe the project, your role, and key achievements..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, techIndex) => (
                        <Badge key={techIndex} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No projects added yet. Click "Add Project" to get started.
              </p>
            )}
          </Card>

          {/* Certifications Section */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Certifications</h3>
              </div>
              <Button onClick={addCertification} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Certification
              </Button>
            </div>
            
            {resumeData.certifications && resumeData.certifications.length > 0 ? (
              <div className="space-y-4">
                {resumeData.certifications.map((cert, index) => (
                  <div key={cert.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Certification {index + 1}</h4>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setResumeData(prev => ({
                          ...prev,
                          certifications: prev.certifications?.filter((_, i) => i !== index) || []
                        }))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Certification Name</Label>
                        <Input
                          value={cert.name}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            certifications: prev.certifications?.map((item, i) => 
                              i === index ? { ...item, name: e.target.value } : item
                            ) || []
                          }))}
                          placeholder="e.g., AWS Certified Solutions Architect"
                        />
                      </div>
                      <div>
                        <Label>Issuing Organization</Label>
                        <Input
                          value={cert.issuer}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            certifications: prev.certifications?.map((item, i) => 
                              i === index ? { ...item, issuer: e.target.value } : item
                            ) || []
                          }))}
                          placeholder="e.g., Amazon Web Services"
                        />
                      </div>
                      <div>
                        <Label>Date Obtained</Label>
                        <Input
                          type="date"
                          value={cert.date}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            certifications: prev.certifications?.map((item, i) => 
                              i === index ? { ...item, date: e.target.value } : item
                            ) || []
                          }))}
                        />
                      </div>
                      <div>
                        <Label>Credential Link (Optional)</Label>
                        <Input
                          value={cert.link}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            certifications: prev.certifications?.map((item, i) => 
                              i === index ? { ...item, link: e.target.value } : item
                            ) || []
                          }))}
                          placeholder="https://credential-link.com"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No certifications added yet. Click "Add Certification" to get started.
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
