import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useUser, ProfileData, Project, Certification, Experience } from '@/context/UserContext';
import { useToast } from '@/components/ui/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Plus, 
  Trash2, 
  Save, 
  X, 
  Github, 
  ExternalLink,
  Building,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe
} from 'lucide-react';

interface PortfolioEditFormProps {
  onClose: () => void;
}

export default function PortfolioEditForm({ onClose }: PortfolioEditFormProps) {
  const { user, setUser, firebaseUser } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProfileData>({
    defaultValues: user
  });

  const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({
    control,
    name: 'projects'
  });

  const { fields: certificationFields, append: appendCertification, remove: removeCertification } = useFieldArray({
    control,
    name: 'certifications'
  });

  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control,
    name: 'experience'
  });

  const watchedSkills = watch('skills') || [];

  const addSkill = () => {
    if (newSkill.trim() && !watchedSkills.includes(newSkill.trim())) {
      setValue('skills', [...watchedSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setValue('skills', watchedSkills.filter(skill => skill !== skillToRemove));
  };

  const addProject = () => {
    appendProject({
      id: Date.now().toString(),
      name: '',
      description: '',
      technologies: [],
      link: '',
      github: '',
      startDate: '',
      endDate: ''
    });
  };

  const addCertification = () => {
    appendCertification({
      id: Date.now().toString(),
      name: '',
      organization: '',
      year: new Date().getFullYear().toString(),
      link: '',
      description: ''
    });
  };

  const addExperience = () => {
    appendExperience({
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      achievements: []
    });
  };

  const onSubmit = async (data: ProfileData) => {
    if (!firebaseUser) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to update your profile."
      });
      return;
    }

    setLoading(true);
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await updateDoc(userDocRef, data);
      setUser(data);
      toast({
        title: "Success",
        description: "Portfolio updated successfully!"
      });
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update portfolio. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Edit Portfolio</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    {...register('name', { required: 'Name is required' })}
                    placeholder="Your full name"
                  />
                  {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="title">Professional Title</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="e.g., Software Engineer, Designer"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email', { required: 'Email is required' })}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    {...register('location')}
                    placeholder="City, State/Country"
                  />
                </div>
                <div>
                  <Label htmlFor="college">Education/College</Label>
                  <Input
                    id="college"
                    {...register('college')}
                    placeholder="Your university or college"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="bio">Bio/Summary</Label>
                <Textarea
                  id="bio"
                  {...register('bio')}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>
            </Card>

            {/* Social Links */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Social Links
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    {...register('github')}
                    placeholder="https://github.com/username"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    {...register('linkedin')}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    {...register('website')}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </Card>

            {/* Skills Section */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Skills</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" onClick={addSkill} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {watchedSkills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>

            {/* Projects Section */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Github className="h-5 w-5" />
                  Projects
                </h3>
                <Button type="button" onClick={addProject} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
              </div>
              <div className="space-y-4">
                {projectFields.map((field, index) => (
                  <Card key={field.id} className="p-4 border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium">Project {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProject(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`projects.${index}.name`}>Project Name</Label>
                        <Input
                          {...register(`projects.${index}.name` as const)}
                          placeholder="Project name"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`projects.${index}.technologies`}>Technologies (comma-separated)</Label>
                        <Input
                          {...register(`projects.${index}.technologies` as const)}
                          placeholder="React, Node.js, MongoDB"
                          onChange={(e) => {
                            const techs = e.target.value.split(',').map(t => t.trim()).filter(t => t);
                            setValue(`projects.${index}.technologies`, techs);
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`projects.${index}.link`}>Live Demo URL</Label>
                        <Input
                          {...register(`projects.${index}.link` as const)}
                          placeholder="https://project-demo.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`projects.${index}.github`}>GitHub URL</Label>
                        <Input
                          {...register(`projects.${index}.github` as const)}
                          placeholder="https://github.com/username/project"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label htmlFor={`projects.${index}.description`}>Description</Label>
                      <Textarea
                        {...register(`projects.${index}.description` as const)}
                        placeholder="Describe your project..."
                        rows={3}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Experience Section */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Experience
                </h3>
                <Button type="button" onClick={addExperience} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              </div>
              <div className="space-y-4">
                {experienceFields.map((field, index) => (
                  <Card key={field.id} className="p-4 border-l-4 border-l-green-500">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium">Experience {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExperience(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`experience.${index}.company`}>Company</Label>
                        <Input
                          {...register(`experience.${index}.company` as const)}
                          placeholder="Company name"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`experience.${index}.position`}>Position</Label>
                        <Input
                          {...register(`experience.${index}.position` as const)}
                          placeholder="Job title"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`experience.${index}.startDate`}>Start Date</Label>
                        <Input
                          {...register(`experience.${index}.startDate` as const)}
                          placeholder="MM/YYYY"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`experience.${index}.endDate`}>End Date</Label>
                        <Input
                          {...register(`experience.${index}.endDate` as const)}
                          placeholder="MM/YYYY or Present"
                          disabled={watch(`experience.${index}.current`)}
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label htmlFor={`experience.${index}.description`}>Description</Label>
                      <Textarea
                        {...register(`experience.${index}.description` as const)}
                        placeholder="Describe your role and responsibilities..."
                        rows={3}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Certifications Section */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Certifications
                </h3>
                <Button type="button" onClick={addCertification} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Certification
                </Button>
              </div>
              <div className="space-y-4">
                {certificationFields.map((field, index) => (
                  <Card key={field.id} className="p-4 border-l-4 border-l-purple-500">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium">Certification {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCertification(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`certifications.${index}.name`}>Certification Name</Label>
                        <Input
                          {...register(`certifications.${index}.name` as const)}
                          placeholder="Certification name"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`certifications.${index}.organization`}>Organization</Label>
                        <Input
                          {...register(`certifications.${index}.organization` as const)}
                          placeholder="Issuing organization"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`certifications.${index}.year`}>Year</Label>
                        <Input
                          {...register(`certifications.${index}.year` as const)}
                          placeholder="YYYY"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`certifications.${index}.link`}>Certificate URL</Label>
                        <Input
                          {...register(`certifications.${index}.link` as const)}
                          placeholder="https://certificate-url.com"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Portfolio'}
                <Save className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
