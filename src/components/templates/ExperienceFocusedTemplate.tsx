import { Badge } from '@/components/ui/badge';
import { ResumeTemplate } from '@/lib/firebase-services';

interface TemplateProps {
  resumeData: any;
  template: ResumeTemplate;
  className?: string;
}

export function ExperienceFocusedTemplate({ resumeData, template, className = '' }: TemplateProps) {
  // Ensure resumeData exists
  const data = resumeData || {};
  
  // Map resumeData to template format with fallback values
  const sampleData = {
    personalInfo: {
      fullName: data.personalInfo?.fullName || 'FIRST_LASTNAME',
      email: data.personalInfo?.email || '[Your Email]',
      phone: data.personalInfo?.phone || '[Your Phone]',
      location: data.personalInfo?.location || '[Your City, State]',
      linkedin: data.personalInfo?.linkedin || '[LinkedIn]',
      portfolio: data.personalInfo?.portfolio || '[Portfolio]'
    },
    summary: data.summary || 'Recent [Your Degree] graduate from [College Name] with strong foundation in [Key Skills]. Demonstrated excellence in [Relevant Areas] through internships and academic projects. Proven track record of [Key Achievement]. Seeking an opportunity as [Target Role] to leverage analytical and organizational skills.',
    skills: (data.skills && Array.isArray(data.skills) && data.skills.length > 0) ? data.skills : [
      { category: 'Programming Languages', items: 'Java, Python, C++' },
      { category: 'Web Technologies', items: 'HTML5, CSS3, JavaScript, React.js' },
      { category: 'Database Management', items: 'MySQL, MongoDB' },
      { category: 'Tools & Platforms', items: 'Git, VS Code, AWS' }
    ],
    education: (data.education && Array.isArray(data.education) && data.education.length > 0) ? data.education : [
      {
        degree: 'Bachelor of Technology/Engineering in [Specialization]',
        institution: '[College Name], [University Name]',
        gpa: 'CGPA: X.XX/10.0',
        startDate: 'MM/YYYY',
        endDate: 'MM/YYYY',
        location: '',
        coursework: 'Relevant Coursework: [Course 1], [Course 2], [Course 3]'
      }
    ],
    experience: (data.experience && Array.isArray(data.experience) && data.experience.length > 0) ? data.experience : [
      {
        role: '[Intern Role]',
        company: '[Company Name]',
        location: '[Location]',
        startDate: 'MM/YYYY',
        endDate: 'MM/YYYY',
        achievements: [
          'Assisted in [specific project/task] resulting in [quantifiable result]',
          'Analyzed [data/process] and presented recommendations to [stakeholders]',
          'Collaborated with [department/team] to improve [process/metric]',
          'Managed [responsibility] leading to [achievement]'
        ]
      }
    ],
    projects: (data.projects && Array.isArray(data.projects) && data.projects.length > 0) ? data.projects : [
      {
        title: '[Project_Name]',
        startDate: 'MM/YYYY',
        endDate: 'MM/YYYY',
        description: 'Conducted [research/analysis] on [topic/issue]',
        achievements: [
          'Led team of [X] members to [accomplish objective]',
          'Developed [strategy/solution] that resulted in [outcome]'
        ]
      }
    ],
    certifications: (data.certifications && Array.isArray(data.certifications) && data.certifications.length > 0) ? data.certifications : [
      { title: '[Certification Name]', issuer: '[Issuing Organization]', date: '(MM/YYYY)' },
      { title: '[Certification Name]', issuer: '[Issuing Organization]', date: '(MM/YYYY)' }
    ],
    additionalInfo: (data.additionalInfo && Array.isArray(data.additionalInfo) && data.additionalInfo.length > 0) ? data.additionalInfo : [
      '[Technical Competition/Hackathon Achievement]',
      '[Relevant Technical Club/Committee Position]',
      '[Significant Workshop/Conference Participation]'
    ]
  };

  return (
    <div className={`max-w-4xl mx-auto bg-white text-gray-800 p-8 font-serif ${className}`}>
      {/* Header */}
      <header className="text-center border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className="text-3xl font-bold uppercase tracking-wide mb-2">
          {sampleData.personalInfo.fullName}
        </h1>
        <div className="text-sm text-gray-600 space-x-3">
          <span>{sampleData.personalInfo.email}</span>
          <span>•</span>
          <span>{sampleData.personalInfo.phone}</span>
          <span>•</span>
          <span>{sampleData.personalInfo.location}</span>
          <span>•</span>
          <span>{sampleData.personalInfo.linkedin}</span>
          <span>•</span>
          <span>{sampleData.personalInfo.portfolio}</span>
        </div>
      </header>

      {/* Objective/Summary */}
      <section className="mb-6">
        <h2 className="text-lg font-bold border-b border-gray-400 mb-3">OBJECTIVE</h2>
        <p className="text-sm leading-relaxed italic text-gray-700">
          {sampleData.summary}
        </p>
        <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
          <strong>💡 Tip:</strong> Customize this objective to match the specific role you're applying for. Mention the company name and specific position to show genuine interest.
        </div>
      </section>

      {/* Education */}
      <section className="mb-6">
        <h2 className="text-lg font-bold border-b border-gray-400 mb-3">EDUCATION</h2>
        {sampleData.education && sampleData.education.map((edu: any, index: number) => (
          <div key={index} className="mb-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-sm">{edu.degree}</h3>
                <p className="text-sm text-gray-600">{edu.institution}</p>
                {edu.coursework && (
                  <p className="text-xs text-gray-500 mt-1">{edu.coursework}</p>
                )}
              </div>
              <div className="text-right text-sm">
                <div className="font-medium">{edu.gpa}</div>
                <div className="text-gray-600">{edu.startDate} - {edu.endDate}</div>
              </div>
            </div>
          </div>
        ))}
        <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded">
          <strong>✅ Fresh Graduate Advantage:</strong> Highlight relevant coursework, academic projects, and GPA (if 3.5+). Include any academic honors or scholarships.
        </div>
      </section>

      {/* Experience */}
      <section className="mb-6">
        <h2 className="text-lg font-bold border-b border-gray-400 mb-3">EXPERIENCE</h2>
        {sampleData.experience && sampleData.experience.map((exp: any, index: number) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-sm">{exp.role}</h3>
                <p className="text-sm text-gray-600">{exp.company}</p>
              </div>
              <div className="text-right text-sm text-gray-600">
                <div>{exp.location}</div>
                <div>{exp.startDate} - {exp.endDate}</div>
              </div>
            </div>
            <ul className="list-disc list-inside text-sm space-y-1 ml-4">
              {exp.achievements && exp.achievements.map((achievement: any, achIndex: number) => (
                <li key={achIndex} className="text-gray-700">{achievement}</li>
              ))}
            </ul>
          </div>
        ))}
        <div className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
          <strong>🚀 Entry-Level Focus:</strong> Include internships, part-time work, volunteer experience, and leadership roles. Use action verbs and quantify achievements where possible.
        </div>
      </section>

      {/* Projects */}
      <section className="mb-6">
        <h2 className="text-lg font-bold border-b border-gray-400 mb-3">ACADEMIC/PERSONAL PROJECTS</h2>
        {sampleData.projects && sampleData.projects.map((project: any, index: number) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-sm">{project.title}</h3>
              <div className="text-sm text-gray-600">
                {project.startDate} - {project.endDate}
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-2">{project.description}</p>
            <ul className="list-disc list-inside text-sm space-y-1 ml-4">
              {project.achievements && project.achievements.map((achievement: any, achIndex: number) => (
                <li key={achIndex} className="text-gray-700">{achievement}</li>
              ))}
            </ul>
          </div>
        ))}
        <div className="mt-2 text-xs text-purple-600 bg-purple-50 p-2 rounded">
          <strong>💼 Project Power:</strong> Showcase 2-3 relevant projects that demonstrate technical skills. Include technologies used, your specific role, and measurable outcomes.
        </div>
      </section>

      {/* Skills */}
      <section className="mb-6">
        <h2 className="text-lg font-bold border-b border-gray-400 mb-3">TECHNICAL SKILLS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sampleData.skills && sampleData.skills.map((skillGroup: any, index: number) => (
            <div key={index} className="text-sm">
              <span className="font-semibold">{skillGroup.category}:</span>
              <span className="ml-2 text-gray-700">{skillGroup.items}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-indigo-600 bg-indigo-50 p-2 rounded">
          <strong>🎯 Skill Strategy:</strong> List skills relevant to the job posting. Include both technical and soft skills. Be honest - only list skills you can discuss confidently in an interview.
        </div>
      </section>

      {/* Certifications */}
      <section className="mb-6">
        <h2 className="text-lg font-bold border-b border-gray-400 mb-3">CERTIFICATIONS</h2>
        <div className="space-y-2">
          {sampleData.certifications && sampleData.certifications.map((cert: any, index: number) => (
            <div key={index} className="text-sm">
              <span className="font-semibold">{cert.title}</span>
              <span className="text-gray-600 ml-2">- {cert.issuer}</span>
              <span className="text-gray-500 ml-2">{cert.date}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Additional Information */}
      <section className="mb-6">
        <h2 className="text-lg font-bold border-b border-gray-400 mb-3">ADDITIONAL INFORMATION</h2>
        <ul className="list-disc list-inside text-sm space-y-1">
          {sampleData.additionalInfo && sampleData.additionalInfo.map((info: any, index: number) => (
            <li key={index} className="text-gray-700">{info}</li>
          ))}
        </ul>
        <div className="mt-2 text-xs text-teal-600 bg-teal-50 p-2 rounded">
          <strong>🌟 Stand Out:</strong> Include leadership experiences, extracurricular activities, languages, and any unique achievements that differentiate you from other candidates.
        </div>
      </section>

      {/* Fresh Graduate Tips Section */}
      <section className="mt-8 bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-bold text-center mb-4 text-gray-800">💡 FRESH GRADUATE SUCCESS TIPS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <h3 className="font-semibold text-blue-700 mb-2">Resume Optimization:</h3>
            <ul className="space-y-1 text-gray-600">
              <li>• Tailor resume for each application</li>
              <li>• Use keywords from job description</li>
              <li>• Keep it to 1-2 pages maximum</li>
              <li>• Use consistent formatting throughout</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-green-700 mb-2">Application Strategy:</h3>
            <ul className="space-y-1 text-gray-600">
              <li>• Apply to entry-level and internship roles</li>
              <li>• Network through LinkedIn and alumni</li>
              <li>• Prepare for behavioral interviews</li>
              <li>• Follow up on applications professionally</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
