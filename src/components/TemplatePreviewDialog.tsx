import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ResumePreview } from '@/components/ResumePreview';
import { ResumeData, ResumeTemplate } from '@/lib/firebase-services';
import { useUser } from '@/context/UserContext';
import { Eye, Star, FileText } from 'lucide-react';

interface TemplatePreviewDialogProps {
  template: ResumeTemplate;
  onSelectTemplate: (templateId: string) => void;
  userResumeData?: Partial<ResumeData>;
}

export function TemplatePreviewDialog({ 
  template, 
  onSelectTemplate, 
  userResumeData 
}: TemplatePreviewDialogProps) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);

  // Create sample resume data based on user profile
  const getSampleResumeData = (): Partial<ResumeData> => {
    if (userResumeData) return userResumeData;

    return {
      personalInfo: {
        fullName: user.name || 'John Doe',
        email: user.email || 'john.doe@email.com',
        phone: '+1 (555) 123-4567',
        location: 'New York, NY',
        linkedin: user.linkedin || 'linkedin.com/in/johndoe',
        github: user.github || 'github.com/johndoe',
        website: user.website || 'johndoe.com'
      },
      summary: user.bio || 'Experienced professional with expertise in modern technologies and a passion for creating innovative solutions. Proven track record of delivering high-quality projects and collaborating effectively with cross-functional teams.',
      experience: [
        {
          id: '1',
          company: 'Tech Innovations Inc.',
          position: 'Senior Software Engineer',
          startDate: '2022',
          endDate: 'Present',
          current: true,
          description: 'Led development of scalable web applications serving 100K+ users daily. Architected microservices infrastructure and implemented CI/CD pipelines.',
          achievements: [
            'Improved application performance by 40% through optimization',
            'Mentored 3 junior developers and conducted code reviews',
            'Implemented automated testing reducing bugs by 60%'
          ]
        },
        {
          id: '2',
          company: 'Digital Solutions LLC',
          position: 'Software Developer',
          startDate: '2020',
          endDate: '2022',
          current: false,
          description: 'Developed and maintained full-stack applications using modern frameworks. Collaborated with design and product teams to deliver user-centric solutions.',
          achievements: [
            'Built responsive web applications with React and Node.js',
            'Integrated third-party APIs and payment systems',
            'Participated in agile development processes'
          ]
        }
      ],
      education: [
        {
          id: '1',
          institution: user.college || 'University of Technology',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          startDate: '2016',
          endDate: '2020',
          gpa: '3.8',
          achievements: [
            'Magna Cum Laude',
            'Dean\'s List for 6 semesters',
            'Computer Science Honor Society'
          ]
        }
      ],
      skills: [
        {
          category: 'Programming Languages',
          items: ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go']
        },
        {
          category: 'Frontend Technologies',
          items: ['React', 'Vue.js', 'HTML5', 'CSS3', 'Tailwind CSS']
        },
        {
          category: 'Backend Technologies',
          items: ['Node.js', 'Express', 'Django', 'PostgreSQL', 'MongoDB']
        },
        {
          category: 'Tools & Platforms',
          items: ['Git', 'Docker', 'AWS', 'Firebase', 'Vercel']
        }
      ],
      projects: [
        {
          id: '1',
          name: 'E-Commerce Platform',
          description: 'Full-stack e-commerce solution with real-time inventory management, payment processing, and admin dashboard.',
          technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe API'],
          link: 'https://ecommerce-demo.com',
          github: 'https://github.com/johndoe/ecommerce-platform'
        },
        {
          id: '2',
          name: 'Task Management App',
          description: 'Collaborative task management application with real-time updates, file sharing, and team communication features.',
          technologies: ['Vue.js', 'Firebase', 'WebSocket', 'PWA'],
          link: 'https://taskmanager-demo.com',
          github: 'https://github.com/johndoe/task-manager'
        }
      ],
      certifications: [
        {
          id: '1',
          name: 'AWS Certified Solutions Architect',
          issuer: 'Amazon Web Services',
          date: '2023',
          link: 'https://aws.amazon.com/certification/'
        },
        {
          id: '2',
          name: 'Google Cloud Professional Developer',
          issuer: 'Google Cloud',
          date: '2022',
          link: 'https://cloud.google.com/certification'
        }
      ]
    };
  };

  const handleSelectTemplate = () => {
    onSelectTemplate(template.id);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Eye className="h-3 w-3 mr-2" />
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <FileText className="h-5 w-5" />
            {template.name} Template Preview
            {template.atsScore >= 90 && (
              <Badge className="bg-green-600">
                <Star className="h-3 w-3 mr-1" />
                Recommended
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {template.description} • ATS Score: {template.atsScore}%
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Template Info */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Template Features</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• ATS-friendly formatting</li>
                <li>• Professional typography</li>
                <li>• Clean, readable layout</li>
                <li>• Print-optimized design</li>
                <li>• Mobile-responsive preview</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">ATS Compatibility</h3>
              <div className="flex items-center gap-2 mb-2">
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
                <span className="text-sm font-medium">{template.atsScore}%</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {template.atsScore >= 90 ? 'Excellent ATS compatibility' :
                 template.atsScore >= 80 ? 'Good ATS compatibility' :
                 'Fair ATS compatibility'}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Best For</h3>
              <p className="text-sm text-muted-foreground">
                {template.category === 'professional' ? 'Corporate roles, business positions, traditional industries' :
                 template.category === 'technical' ? 'Software engineering, IT roles, technical positions' :
                 template.category === 'academic' ? 'Research positions, academic roles, PhD applications' :
                 template.category === 'creative' ? 'Design roles, marketing positions, creative industries' :
                 'General purpose, versatile for most positions'}
              </p>
            </div>
          </div>

          {/* Resume Preview */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted px-3 py-2 text-sm font-medium">
              Live Preview
            </div>
            <div className="max-h-96 overflow-y-auto">
              <ResumePreview 
                resumeData={getSampleResumeData()} 
                template={template}
                className="border-0 shadow-none"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button onClick={handleSelectTemplate}>
            Use This Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
