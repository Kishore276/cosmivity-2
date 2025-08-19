import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResumeData, ResumeTemplate } from '@/lib/firebase-services';

interface ResumePreviewProps {
  resumeData: Partial<ResumeData>;
  template: ResumeTemplate;
  className?: string;
}

export function ResumePreview({ resumeData, template, className = '' }: ResumePreviewProps) {
  const getTemplateStyles = (template: ResumeTemplate) => {
    const templateName = template.name.toLowerCase().replace(/\s+/g, '-');
    switch (templateName) {
      case 'ats-professional':
        return {
          container: 'bg-white text-gray-900 font-serif border-2 border-blue-100',
          header: 'text-center border-b-3 border-blue-600 pb-6 mb-8 bg-blue-50 -mx-6 -mt-6 px-6 pt-6',
          name: 'text-3xl font-bold text-blue-800 mb-3 tracking-wide',
          contact: 'text-sm text-blue-700 flex justify-center gap-6 flex-wrap font-medium',
          sectionTitle: 'text-lg font-bold text-blue-800 border-b-2 border-blue-300 pb-2 mb-4 uppercase tracking-widest',
          itemTitle: 'font-bold text-gray-900 text-base',
          itemSubtitle: 'text-blue-600 italic text-sm font-medium',
          itemDate: 'text-blue-500 text-sm font-semibold',
          description: 'text-gray-700 text-sm mt-2 leading-relaxed'
        };
      case 'modern-minimalist':
        return {
          container: 'bg-white text-gray-800 font-sans border-l-8 border-green-400 pl-8',
          header: 'text-left mb-8',
          name: 'text-4xl font-extralight text-gray-900 mb-2 tracking-tight',
          contact: 'text-sm text-gray-500 space-y-1 font-light',
          sectionTitle: 'text-sm font-semibold text-green-600 mb-4 pb-1 border-b border-green-200 uppercase tracking-wider',
          itemTitle: 'font-medium text-gray-900 text-base',
          itemSubtitle: 'text-green-600 text-sm font-normal',
          itemDate: 'text-gray-400 text-xs font-light',
          description: 'text-gray-600 text-sm mt-1 font-light leading-relaxed'
        };
      case 'technical-focus':
        return {
          container: 'bg-gray-900 text-green-400 font-mono border border-green-500',
          header: 'bg-black text-green-400 p-6 mb-6 border-b-2 border-green-500 -mx-6 -mt-6',
          name: 'text-2xl font-bold mb-2 text-green-300 font-mono',
          contact: 'text-xs text-green-400 space-y-1 font-mono',
          sectionTitle: 'text-sm font-bold text-green-300 bg-gray-800 px-3 py-2 mb-4 border-l-4 border-green-500 font-mono uppercase',
          itemTitle: 'font-bold text-green-300 font-mono',
          itemSubtitle: 'text-green-400 text-xs font-mono',
          itemDate: 'text-green-500 text-xs font-mono',
          description: 'text-green-400 text-xs mt-1 font-mono leading-relaxed'
        };
      case 'academic-cv':
        return {
          container: 'bg-white text-gray-900 font-serif border border-gray-300',
          header: 'text-center mb-10 pb-6 border-b border-gray-400',
          name: 'text-4xl font-bold text-gray-900 mb-4 tracking-wide',
          contact: 'text-sm text-gray-600 space-y-2 font-serif',
          sectionTitle: 'text-xl font-bold text-gray-900 mb-6 text-center border-b-2 border-gray-400 pb-2',
          itemTitle: 'font-bold text-gray-900 text-base',
          itemSubtitle: 'text-gray-600 italic text-sm',
          itemDate: 'text-gray-500 text-sm',
          description: 'text-gray-700 text-sm mt-3 leading-loose text-justify'
        };
      case 'creative-professional':
        return {
          container: 'bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100 text-gray-900 font-sans border-4 border-purple-200 rounded-lg',
          header: 'text-center bg-white rounded-xl p-8 mb-8 shadow-lg border border-purple-200 -mx-6 -mt-6 mx-2 mt-2',
          name: 'text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-3',
          contact: 'text-sm text-purple-700 flex justify-center gap-4 flex-wrap font-medium',
          sectionTitle: 'text-xl font-bold text-purple-700 mb-4 pb-3 border-b-4 border-gradient-to-r from-purple-400 to-pink-400 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-border',
          itemTitle: 'font-bold text-gray-900 text-base',
          itemSubtitle: 'text-purple-600 text-sm font-medium',
          itemDate: 'text-pink-500 text-sm font-medium',
          description: 'text-gray-700 text-sm mt-2 leading-relaxed'
        };
      default:
        return {
          container: 'bg-white text-gray-900 font-sans',
          header: 'text-center border-b pb-4 mb-6',
          name: 'text-2xl font-bold mb-2',
          contact: 'text-sm text-gray-600 flex justify-center gap-4 flex-wrap',
          sectionTitle: 'text-lg font-bold mb-3 pb-1 border-b',
          itemTitle: 'font-bold',
          itemSubtitle: 'text-gray-600 text-sm',
          itemDate: 'text-gray-500 text-sm',
          description: 'text-gray-700 text-sm mt-1'
        };
    }
  };

  const styles = getTemplateStyles(template);
  const templateName = template.name.toLowerCase().replace(/\s+/g, '-');

  // Sample data for preview
  const sampleData = {
    personalInfo: {
      fullName: resumeData.personalInfo?.fullName || 'John Doe',
      email: resumeData.personalInfo?.email || 'john.doe@email.com',
      phone: resumeData.personalInfo?.phone || '+1 (555) 123-4567',
      location: resumeData.personalInfo?.location || 'New York, NY',
      linkedin: resumeData.personalInfo?.linkedin || 'linkedin.com/in/johndoe',
      github: resumeData.personalInfo?.github || 'github.com/johndoe'
    },
    summary: resumeData.summary || 'Experienced software engineer with 5+ years of expertise in full-stack development, specializing in React, Node.js, and cloud technologies.',
    experience: resumeData.experience?.length ? resumeData.experience : [
      {
        id: '1',
        company: 'Tech Company Inc.',
        position: 'Senior Software Engineer',
        startDate: '2022',
        endDate: 'Present',
        current: true,
        description: 'Led development of scalable web applications serving 100K+ users.',
        achievements: ['Improved performance by 40%', 'Mentored 3 junior developers']
      }
    ],
    education: resumeData.education?.length ? resumeData.education : [
      {
        id: '1',
        institution: 'University of Technology',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startDate: '2018',
        endDate: '2022',
        gpa: '3.8',
        achievements: ['Magna Cum Laude', 'Dean\'s List']
      }
    ],
    skills: resumeData.skills?.length ? resumeData.skills : [
      { category: 'Programming', items: ['JavaScript', 'Python', 'Java', 'TypeScript'] },
      { category: 'Frameworks', items: ['React', 'Node.js', 'Express', 'Next.js'] }
    ]
  };

  return (
    <div className={`${className} ${styles.container} p-6 rounded-lg shadow-sm border text-xs leading-tight`}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.name}>{sampleData.personalInfo.fullName}</h1>
        <div className={styles.contact}>
          {templateName === 'modern-minimalist' ? (
            <div className="space-y-1">
              <div>{sampleData.personalInfo.email}</div>
              <div>{sampleData.personalInfo.phone}</div>
              <div>{sampleData.personalInfo.location}</div>
            </div>
          ) : templateName === 'academic-cv' ? (
            <div className="space-y-2 text-center">
              <div>{sampleData.personalInfo.email}</div>
              <div>{sampleData.personalInfo.phone}</div>
              <div>{sampleData.personalInfo.location}</div>
            </div>
          ) : (
            <>
              <span>{sampleData.personalInfo.email}</span>
              <span>{sampleData.personalInfo.phone}</span>
              <span>{sampleData.personalInfo.location}</span>
            </>
          )}
        </div>
      </div>

      {/* Summary */}
      {sampleData.summary && (
        <div className="mb-4">
          <h2 className={styles.sectionTitle}>Professional Summary</h2>
          <p className={styles.description}>{sampleData.summary}</p>
        </div>
      )}

      {/* Experience */}
      <div className="mb-4">
        <h2 className={styles.sectionTitle}>
          {templateName === 'technical-focus' ? '>> EXPERIENCE' :
           templateName === 'academic-cv' ? 'PROFESSIONAL EXPERIENCE' :
           'Experience'}
        </h2>
        {sampleData.experience.slice(0, 1).map((exp, index) => (
          <div key={index} className="mb-3">
            {templateName === 'technical-focus' ? (
              <div className="bg-gray-800 p-3 border-l-2 border-green-500">
                <div className={styles.itemTitle}>[{exp.position}]</div>
                <div className={styles.itemSubtitle}>@ {exp.company}</div>
                <div className={styles.itemDate}>
                  {exp.startDate} - {exp.current ? 'CURRENT' : exp.endDate}
                </div>
                <div className={styles.description}>// {exp.description}</div>
                {exp.achievements.length > 0 && (
                  <div className="mt-2">
                    {exp.achievements.slice(0, 2).map((achievement, i) => (
                      <div key={i} className={`${styles.description} ml-2`}>- {achievement}</div>
                    ))}
                  </div>
                )}
              </div>
            ) : templateName === 'academic-cv' ? (
              <div className="text-center mb-4">
                <div className={styles.itemTitle}>{exp.position}</div>
                <div className={styles.itemSubtitle}>{exp.company}</div>
                <div className={styles.itemDate}>
                  {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                </div>
                <p className={styles.description}>{exp.description}</p>
                {exp.achievements.length > 0 && (
                  <ul className="list-none mt-2 text-center">
                    {exp.achievements.slice(0, 2).map((achievement, i) => (
                      <li key={i} className={styles.description}>• {achievement}</li>
                    ))}
                  </ul>
                )}
              </div>
            ) : templateName === 'creative-professional' ? (
              <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-200">
                <div className="flex justify-between items-start">
                  <div>
                    <div className={styles.itemTitle}>✨ {exp.position}</div>
                    <div className={styles.itemSubtitle}>🏢 {exp.company}</div>
                  </div>
                  <div className={`${styles.itemDate} bg-gradient-to-r from-purple-100 to-pink-100 px-2 py-1 rounded`}>
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </div>
                </div>
                <p className={styles.description}>{exp.description}</p>
                {exp.achievements.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {exp.achievements.slice(0, 2).map((achievement, i) => (
                      <div key={i} className={`${styles.description} flex items-start`}>
                        <span className="text-purple-500 mr-2">🎯</span>
                        {achievement}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <div className={styles.itemTitle}>{exp.position}</div>
                    <div className={styles.itemSubtitle}>{exp.company}</div>
                  </div>
                  <div className={styles.itemDate}>
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </div>
                </div>
                <p className={styles.description}>{exp.description}</p>
                {exp.achievements.length > 0 && (
                  <ul className="list-disc list-inside mt-1 text-xs">
                    {exp.achievements.slice(0, 2).map((achievement, i) => (
                      <li key={i} className={styles.description}>{achievement}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Education */}
      <div className="mb-4">
        <h2 className={styles.sectionTitle}>Education</h2>
        {sampleData.education.slice(0, 1).map((edu, index) => (
          <div key={index} className="mb-2">
            <div className="flex justify-between items-start">
              <div>
                <div className={styles.itemTitle}>{edu.degree} in {edu.field}</div>
                <div className={styles.itemSubtitle}>{edu.institution}</div>
              </div>
              <div className={styles.itemDate}>{edu.startDate} - {edu.endDate}</div>
            </div>
            {edu.gpa && <p className={styles.description}>GPA: {edu.gpa}</p>}
          </div>
        ))}
      </div>

      {/* Skills */}
      <div>
        <h2 className={styles.sectionTitle}>
          {templateName === 'technical-focus' ? '>> TECH_STACK' :
           templateName === 'academic-cv' ? 'COMPETENCIES' :
           'Skills'}
        </h2>
        {templateName === 'technical-focus' ? (
          <div className="bg-gray-800 p-3 border border-green-500">
            {sampleData.skills.slice(0, 2).map((skillGroup, index) => (
              <div key={index} className="mb-2">
                <span className={styles.itemTitle}>{skillGroup.category.toUpperCase()}: </span>
                <span className={styles.description}>[{skillGroup.items.slice(0, 3).join('] [')}]</span>
              </div>
            ))}
          </div>
        ) : templateName === 'creative-professional' ? (
          <div className="grid grid-cols-2 gap-3">
            {sampleData.skills.slice(0, 2).map((skillGroup, index) => (
              <div key={index} className="bg-white rounded-lg p-3 shadow-sm border border-purple-200">
                <div className={`${styles.itemTitle} text-purple-600 mb-2`}>🎨 {skillGroup.category}</div>
                <div className="flex flex-wrap gap-1">
                  {skillGroup.items.slice(0, 3).map((skill, i) => (
                    <span key={i} className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : templateName === 'modern-minimalist' ? (
          <div className="space-y-3">
            {sampleData.skills.slice(0, 2).map((skillGroup, index) => (
              <div key={index} className="border-l-2 border-green-400 pl-3">
                <div className={styles.itemTitle}>{skillGroup.category}</div>
                <div className={styles.description}>{skillGroup.items.slice(0, 3).join(' • ')}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {sampleData.skills.slice(0, 2).map((skillGroup, index) => (
              <div key={index}>
                <span className={styles.itemTitle}>{skillGroup.category}: </span>
                <span className={styles.description}>{skillGroup.items.slice(0, 3).join(', ')}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Template Info */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            ATS Score: {template.atsScore}%
          </Badge>
          <span className="text-xs text-gray-500">{template.name}</span>
        </div>
      </div>
    </div>
  );
}
