import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/context/UserContext';
import PortfolioEditForm from '@/components/PortfolioEditForm';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Linkedin,
  Github,
  Globe,
  Edit,
  ExternalLink,
  MapPin,
  Phone,
  Calendar,
  Building
} from 'lucide-react';

export default function ProfilePage() {
  const { user, firebaseUser, loading } = useUser();
  const navigate = useNavigate();
  const [showEditForm, setShowEditForm] = useState(false);

  // Authentication guard
  useEffect(() => {
    if (!loading && !firebaseUser) {
      navigate('/auth');
    }
  }, [firebaseUser, loading, navigate]);

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

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header with Edit Button */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">Portfolio</h1>
          <Button onClick={() => setShowEditForm(true)} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Portfolio
          </Button>
        </div>

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
                    {user.title || 'Your Title or Tagline'}
                  </p>
                  {user.location && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {user.location}
                    </p>
                  )}
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
                  {user.phone && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user.linkedin && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Linkedin className="h-4 w-4" />
                      <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                  {user.github && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Github className="h-4 w-4" />
                      <a href={user.github} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                        GitHub Profile
                      </a>
                    </div>
                  )}
                  {user.website && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      <a href={user.website} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                        Personal Website
                      </a>
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
                {user.skills && user.skills.length > 0 ? (
                  user.skills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="px-3 py-1 text-sm font-medium"
                    >
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No skills added yet. Click "Edit Portfolio" to add your skills.</p>
                )}
              </div>
            </Card>

            {/* Projects Section */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-foreground">Projects</h2>
              <div className="space-y-4">
                {user.projects && user.projects.length > 0 ? (
                  user.projects.map((project, index) => (
                    <div key={project.id || index} className="space-y-2 p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium text-foreground">{project.name}</h3>
                        <div className="flex gap-2">
                          {project.link && (
                            <a href={project.link} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </a>
                          )}
                          {project.github && (
                            <a href={project.github} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="sm">
                                <Github className="h-4 w-4" />
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.technologies.map((tech, techIndex) => (
                            <Badge key={techIndex} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No projects added yet. Click "Edit Portfolio" to showcase your work.</p>
                )}
              </div>
            </Card>

            {/* Experience Section */}
            {user.experience && user.experience.length > 0 && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Experience
                </h2>
                <div className="space-y-4">
                  {user.experience.map((exp, index) => (
                    <div key={exp.id || index} className="space-y-2 p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-foreground">{exp.position}</h3>
                          <p className="text-sm text-muted-foreground">{exp.company}</p>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                        </div>
                      </div>
                      {exp.description && (
                        <p className="text-sm text-muted-foreground">{exp.description}</p>
                      )}
                      {exp.achievements && exp.achievements.length > 0 && (
                        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                          {exp.achievements.map((achievement, achIndex) => (
                            <li key={achIndex}>{achievement}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Certifications Section */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-foreground">Certifications</h2>
              <div className="space-y-4">
                {user.certifications && user.certifications.length > 0 ? (
                  user.certifications.map((cert, index) => (
                    <div key={cert.id || index} className="space-y-1 p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-foreground">{cert.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {cert.organization} | {cert.year}
                          </p>
                          {cert.description && (
                            <p className="text-sm text-muted-foreground mt-1">{cert.description}</p>
                          )}
                        </div>
                        {cert.link && (
                          <a href={cert.link} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No certifications added yet. Click "Edit Portfolio" to add your achievements.</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Form Modal */}
      {showEditForm && (
        <PortfolioEditForm onClose={() => setShowEditForm(false)} />
      )}
    </DashboardLayout>
  );
}
