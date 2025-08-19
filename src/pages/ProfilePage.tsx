import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/context/UserContext';
import { Mail, Linkedin } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useUser();

  // Mock data for skills, projects, and certifications
  const skills = ['React', 'Next.js', 'TypeScript', 'Tailwind', 'Node.js', 'Firebase'];

  const projects = [
    {
      name: 'Project One',
      description: 'A short description of your project.'
    },
    {
      name: 'Project Two',
      description: 'Another short description of another project.'
    }
  ];

  const certifications = [
    {
      name: 'Certified Pro',
      organization: 'Certification Body',
      year: '2023'
    }
  ];



  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left Column - Profile Info */}
          <div className="space-y-6">
            <Card className="p-8">
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-border">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback className="text-2xl bg-muted">
                      {user.name?.split(" ").map((n) => n[0]).join("") || "UN"}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Name and Title */}
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-foreground">
                    {user.name || 'Your Name'}
                  </h1>
                  <p className="text-muted-foreground">
                    Your Title or Tagline
                  </p>
                </div>

                {/* Bio */}
                <div className="w-full">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {user.bio || "I'm a passionate creator and developer, always exploring new technologies and building cool projects."}
                  </p>
                </div>

                {/* Contact Info */}
                <div className="w-full space-y-3 pt-4">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{user.email || 'your.email@example.com'}</span>
                  </div>
                  {user.linkedin && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Linkedin className="h-4 w-4" />
                      <span>linkedin.com/in/your-username</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Skills, Projects, Certifications */}
          <div className="space-y-6">
            {/* Skills Section */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-foreground">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="px-3 py-1 text-sm font-medium"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Projects Section */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-foreground">Projects</h2>
              <div className="space-y-4">
                {projects.map((project, index) => (
                  <div key={index} className="space-y-2">
                    <h3 className="font-medium text-foreground">{project.name}</h3>
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Certifications Section */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-foreground">Certifications</h2>
              <div className="space-y-4">
                {certifications.map((cert, index) => (
                  <div key={index} className="space-y-1">
                    <h3 className="font-medium text-foreground">{cert.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {cert.organization} | {cert.year}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
