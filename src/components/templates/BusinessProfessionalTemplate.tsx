import { Badge } from '@/components/ui/badge';

interface TemplateProps {
  resumeData: any;
  template: any;
  className?: string;
}

export function BusinessProfessionalTemplate({ resumeData, template, className = '' }: TemplateProps) {
  // Map resumeData to template format with fallback values
  const sampleData = {
    personalInfo: {
      fullName: resumeData.personalInfo?.fullName || 'FIRST LAST [To edit, click File -> Make a Copy]',
      email: resumeData.personalInfo?.email || 'first.last@resumeworded.com',
      phone: resumeData.personalInfo?.phone || '(212) 123-4567',
      location: resumeData.personalInfo?.location || 'New York, NY',
      linkedin: resumeData.personalInfo?.linkedin || 'linkedin.com/in/username'
    },
    summary: resumeData.summary || '',
    experience: resumeData.experience?.length ? resumeData.experience : [
      {
        company: 'RESUME WORDED CO.',
        position: 'Product Manager',
        subPosition: 'Lead Business Analyst',
        startDate: '2017',
        endDate: 'Present',
        location: 'New York, NY',
        description: 'Launched Miami office with lead Director and recruited a new team of 10 employees; grew office revenue by 200% in first nine months (representing 20% of company revenue). Led redesign of mobile app and website. Promoted within 15 months due to strong performance and organizational impact (one year ahead of schedule).',
        achievements: [
          'Analyzed data from 25000 monthly active users and used outputs to guide marketing and product strategies; increased average app engagement time by 2x and 30% decrease in drop off rate',
          'Drove redevelopment of internal tracking system in use by 125 employees, resulting in 20+ new features, reduction of 20% in save/load time and 15% operation time',
          'Identified steps to reduce return rates by 10% resulting in an eventual $75k cost savings',
          'Overhauled the obsolete legacy source code of two production applications, resulting in increased usability and reduced run time performance by 50%',
          'Spearheaded a major pricing restructure by redirecting focus on consumer willingness to pay instead of product cost; implemented a three-tiered pricing model which increased average sale 35% and margin 12%'
        ]
      },
      {
        company: 'INSTAMAKE',
        position: 'Business Analyst',
        subPosition: '',
        startDate: '2013',
        endDate: '2015',
        location: 'Beijing, China',
        description: 'First hire on the analytics team of RW Ventures funded startup ($10mm Series A). Developed product strategies for lead Director and trained the team as it grew to 25 employees. Led redesign of mobile app and website.',
        achievements: [
          'Spearheaded a major pricing restructure by redirecting focus on consumer willingness to pay instead of product cost; implemented a three-tiered pricing model which increased average sale 35% and margin 12%',
          'Identified steps to reduce return rates by 10% resulting in an eventual $75k cost savings',
          'Designed training and peer-mentoring programs for the incoming class of 25 analysts in 2017; reduced onboarding time for new hires by 50%'
        ]
      },
      {
        company: 'MY EXCITING COMPANY',
        position: 'Business Development Consultant',
        subPosition: '',
        startDate: '2012',
        endDate: '2013',
        location: 'New York, NY',
        description: 'Liaised with C-level executives of My Exciting Company, a RW Ventures-backed ecommerce marketplace website with 100k members which helps designers sell their artwork and designs to businesses.',
        achievements: [
          'Analyzed data from 25000 monthly active users and used outputs to guide marketing and product strategies; increased average app engagement time by 2x and 30% decrease in drop off rate',
          'Identified steps to reduce return rates by 10% resulting in an eventual $75k cost savings'
        ]
      }
    ],
    education: resumeData.education?.length ? resumeData.education : [
      {
        institution: 'LEGENDS UNIVERSITY',
        degree: 'Master of Science in Management with Honors; Major in Management',
        startDate: '2011',
        endDate: '2012',
        location: 'San Francisco, CA',
        achievements: ['Awards: Resume Worded Fellow (only 5 awarded to class), Director\'s List 2012 (top 10%)']
      },
      {
        institution: 'RESUME WORDED UNIVERSITY',
        degree: 'Bachelor of Engineering; Major in Computer Science; Minor in Mathematics',
        startDate: '2007',
        endDate: '2011',
        location: 'New York, NY',
        achievements: ['Completed one year study abroad with Singapore University [optional; experienced hires do not need details in education, unless it adds new facts to overall resume, like it does in this example]']
      }
    ],
    additionalInfo: {
      technicalSkills: 'Java, PHP, Javascript, HTML/CSS, MATLAB [add skills from job description]',
      languages: 'Fluent in French (native), English; Conversational Proficiency in Chinese',
      certifications: 'CFA Level 2 (August 2016), Passed Resume Worded examinations',
      awards: 'RW\'s Top 30 Under 30 (2011); Won nationwide case competition out of 500+ participants (2013)'
    }
  };

  const styles = {
    container: 'font-serif text-black leading-tight',
    header: 'text-center mb-4',
    name: 'text-lg font-bold mb-1 tracking-wide',
    contact: 'text-sm mb-1',
    sectionTitle: 'text-sm font-bold mb-2 pb-1 border-b border-gray-400 uppercase',
    companyName: 'text-sm font-bold',
    position: 'text-sm',
    positionItalic: 'text-sm italic',
    location: 'text-sm text-right',
    dateRange: 'text-sm text-right',
    description: 'text-sm mt-1 text-justify leading-relaxed',
    bulletPoint: 'text-sm leading-relaxed'
  };

  return (
    <div className={`${className} ${styles.container} p-8 bg-white max-w-4xl mx-auto`}>
      
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.name}>{sampleData.personalInfo.fullName}</h1>
        <div className={styles.contact}>
          {sampleData.personalInfo.location} • {sampleData.personalInfo.email} • {sampleData.personalInfo.phone} • {sampleData.personalInfo.linkedin}
        </div>
      </div>

      {/* Professional Experience */}
      <div className="mb-6">
        <h2 className={styles.sectionTitle}>Professional Experience</h2>
        
        {sampleData.experience.map((exp: any, index: number) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between items-start mb-1">
              <div className="flex-1">
                <div className={styles.companyName}>{exp.company}</div>
                <div className={styles.position}>{exp.position}</div>
                {exp.subPosition && <div className={styles.position}>{exp.subPosition}</div>}
              </div>
              <div className="text-right">
                <div className={styles.location}>{exp.location}</div>
                <div className={styles.dateRange}>{exp.startDate}-{exp.endDate}</div>
                {index === 1 && <div className={styles.dateRange}>2015-2017</div>}
              </div>
            </div>
            
            <div className={styles.description}>{exp.description}</div>
            
            <ul className="mt-2 space-y-1">
              {exp.achievements.map((achievement: string, i: number) => (
                <li key={i} className={`${styles.bulletPoint} flex`}>
                  <span className="mr-2">•</span>
                  <span className="text-justify">{achievement}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Education */}
      <div className="mb-6">
        <h2 className={styles.sectionTitle}>Education</h2>
        
        {sampleData.education.map((edu: any, index: number) => (
          <div key={index} className="mb-3">
            <div className="flex justify-between items-start mb-1">
              <div className="flex-1">
                <div className={styles.companyName}>{edu.institution}</div>
                <div className={styles.positionItalic}>{edu.degree}</div>
              </div>
              <div className="text-right">
                <div className={styles.location}>{edu.location}</div>
                <div className={styles.dateRange}>{edu.startDate}-{edu.endDate}</div>
              </div>
            </div>
            
            {edu.achievements && edu.achievements.length > 0 && (
              <ul className="mt-1">
                {edu.achievements.map((achievement: string, i: number) => (
                  <li key={i} className={`${styles.bulletPoint} flex`}>
                    <span className="mr-2">•</span>
                    <span>{achievement}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Additional Information */}
      <div className="mb-6">
        <h2 className={styles.sectionTitle}>Additional Information</h2>
        
        <div className="space-y-2">
          <div className="flex">
            <span className="mr-2">•</span>
            <div>
              <span className="font-bold">Technical Skills:</span> {sampleData.additionalInfo.technicalSkills}
            </div>
          </div>
          
          <div className="flex">
            <span className="mr-2">•</span>
            <div>
              <span className="font-bold">Languages:</span> {sampleData.additionalInfo.languages}
            </div>
          </div>
          
          <div className="flex">
            <span className="mr-2">•</span>
            <div>
              <span className="font-bold">Certifications:</span> {sampleData.additionalInfo.certifications}
            </div>
          </div>
          
          <div className="flex">
            <span className="mr-2">•</span>
            <div>
              <span className="font-bold">Awards:</span> {sampleData.additionalInfo.awards}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
