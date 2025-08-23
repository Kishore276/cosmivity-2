import React from 'react';
import { ResumeData, ResumeTemplate } from '@/lib/firebase-services';
import { ModernCleanTemplate } from './templates/ModernCleanTemplate';
import { BusinessProfessionalTemplate } from './templates/BusinessProfessionalTemplate';
import { AdityaVardhanTemplate } from './templates/AdityaVardhanTemplate';
import { ExperienceFocusedTemplate } from './templates/ExperienceFocusedTemplate';

interface ResumePreviewProps {
  resumeData: Partial<ResumeData>;
  template: ResumeTemplate;
  className?: string;
}

export function ResumePreview({ resumeData, template, className = '' }: ResumePreviewProps) {
  const templateName = template.name.toLowerCase().replace(/\s+/g, '-');

  // Render different templates completely separately
  if (templateName === 'modern-clean') {
    return <ModernCleanTemplate resumeData={resumeData} template={template} className={className} />;
  } else if (templateName === 'business-professional') {
    return <BusinessProfessionalTemplate resumeData={resumeData} template={template} className={className} />;
  } else if (templateName === 'aditya-vardhan') {
    return <AdityaVardhanTemplate resumeData={resumeData} template={template} className={className} />;
  } else if (templateName === 'experience-focused') {
    return <ExperienceFocusedTemplate resumeData={resumeData} template={template} className={className} />;
  }

  // Default fallback
  return <ModernCleanTemplate resumeData={resumeData} template={template} className={className} />;
}
