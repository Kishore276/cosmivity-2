import { Badge } from '@/components/ui/badge';


interface TemplateProps {
  resumeData: any;
  template: any;
  className?: string;
}

export function ModernCleanTemplate({ resumeData, template, className = '' }: TemplateProps) {
  const styles = {
    container: 'bg-white text-gray-900 font-sans border border-gray-300',
    header: 'text-center border-b-2 border-gray-900 pb-3 mb-4',
    name: 'text-xl font-bold text-gray-900 mb-2 tracking-wide',
    contact: 'text-xs text-gray-700 flex justify-center gap-3 flex-wrap items-center',
    sectionTitle: 'text-sm font-bold text-gray-900 border-b border-gray-400 pb-1 mb-2 uppercase tracking-wide',
    itemTitle: 'font-bold text-gray-900 text-xs',
    itemSubtitle: 'text-gray-700 text-xs',
    itemDate: 'text-gray-600 text-xs',
    description: 'text-gray-700 text-xs mt-1 leading-relaxed',
    bulletPoint: 'text-gray-700 text-xs leading-relaxed'
  };

  const sampleData = {
    personalInfo: {
      fullName: resumeData.personalInfo?.fullName || 'M S Aditya Vardhan',
      email: resumeData.personalInfo?.email || 'msadityavardhan18@gmail.com',
      phone: resumeData.personalInfo?.phone || '+91-9392584546',
      location: resumeData.personalInfo?.location || 'Amaravati, Andhra Pradesh',
      linkedin: resumeData.personalInfo?.linkedin || 'LinkedIn',
      github: resumeData.personalInfo?.github || 'GitHub'
    },
    summary: resumeData.summary || 'Enthusiastic graduate seeking to start a career as an entry-level engineer with a reputed firm driven by technology. Passionate about experimenting and learning new projects. Strong collaborative skills gained through team projects and a proactive approach to learning. Excited to contribute innovative solutions and learn from experienced professionals in a dynamic environment.',
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
        institution: 'Vellore Institute of Technology',
        degree: 'B.Tech in Computer Science and Engineering (GPA: 8.62/10)',
        field: '',
        startDate: '2021',
        endDate: 'Present',
        gpa: '8.62',
        achievements: []
      }
    ],
    skills: resumeData.skills?.length ? resumeData.skills : [
      { category: 'Technical Skills', items: ['Machine Learning', 'Natural Language Processing', 'Deep Learning', 'OOPS', 'Artificial Intelligence'] },
      { category: 'Programming Languages', items: ['Java', 'HTML', 'CSS', 'Python', 'ReactJs', 'NodeJs'] },
      { category: 'Tools', items: ['NLTK', 'Numpy', 'scikit-learn', 'PyTorch', 'TensorFlow', 'OpenCV', 'PowerBI'] },
      { category: 'Databases', items: ['SQL', 'MongoDB'] },
      { category: 'Soft Skills', items: ['Leadership', 'Teamwork', 'Communication', 'Time management', 'Problem Solving', 'Analytical Thinking'] }
    ]
  };

  return (
    <div className={`${className} ${styles.container} p-6 rounded-lg shadow-sm border text-xs leading-tight`}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.name}>{sampleData.personalInfo.fullName}</h1>
        <div className={styles.contact}>
          <span>{sampleData.personalInfo.email}</span>
          <span>{sampleData.personalInfo.phone}</span>
          <span>{sampleData.personalInfo.location}</span>
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
        <h2 className={styles.sectionTitle}>Experience</h2>
        <div className="mb-3">
          <div className="flex justify-between items-start mb-1">
            <div>
              <div className={styles.itemTitle}>Senior Software Engineer</div>
              <div className={styles.itemSubtitle}>Tech Company Inc.</div>
            </div>
            <div className={styles.itemDate}>2022 - Present</div>
          </div>
          <p className={styles.description}>Led development of scalable web applications serving 100K+ users.</p>
          <ul className="list-disc list-inside mt-1">
            <li className={styles.bulletPoint}>Improved performance by 40%</li>
            <li className={styles.bulletPoint}>Mentored 3 junior developers</li>
          </ul>
        </div>
      </div>

      {/* Education */}
      <div className="mb-4">
        <h2 className={styles.sectionTitle}>Education</h2>
  {sampleData.education.slice(0, 1).map((edu: any, index: number) => (
          <div key={index} className="mb-2">
            <div className="flex justify-between items-start">
              <div>
                <div className={styles.itemTitle}>{edu.degree}</div>
                <div className={styles.itemSubtitle}>{edu.institution}</div>
              </div>
              <div className={styles.itemDate}>{edu.startDate} - {edu.endDate}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="mb-4">
        <h2 className={styles.sectionTitle}>Skills</h2>
        <div className="grid grid-cols-1 gap-2">
          {sampleData.skills.slice(0, 5).map((skillGroup: any, index: number) => (
            <div key={index}>
              <span className={styles.itemTitle}>{skillGroup.category}: </span>
              <span className={styles.description}>{skillGroup.items.slice(0, 6).join(', ')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div className="mb-4">
        <h2 className={styles.sectionTitle}>Projects</h2>
        
        <div className="mb-3">
          <div className={styles.itemTitle}>Autism Disorder Detection</div>
          <ul className="list-disc list-inside mt-1">
            <li className={styles.bulletPoint}>Developed a machine learning model to detect autism spectrum disorder using facial recognition and behavioral analysis</li>
            <li className={styles.bulletPoint}>Achieved 92% accuracy using deep learning techniques with TensorFlow and OpenCV</li>
            <li className={styles.bulletPoint}>Implemented real-time detection system with user-friendly interface for healthcare professionals</li>
          </ul>
        </div>

        <div className="mb-3">
          <div className={styles.itemTitle}>Meeting Summarization using NLP</div>
          <ul className="list-disc list-inside mt-1">
            <li className={styles.bulletPoint}>Built an automated meeting summarization system using natural language processing techniques</li>
            <li className={styles.bulletPoint}>Utilized NLTK and transformer models to extract key points and action items from meeting transcripts</li>
            <li className={styles.bulletPoint}>Reduced manual summarization time by 80% and improved meeting follow-up efficiency</li>
          </ul>
        </div>

        <div className="mb-3">
          <div className={styles.itemTitle}>Smart Traffic Management System</div>
          <ul className="list-disc list-inside mt-1">
            <li className={styles.bulletPoint}>Designed an intelligent traffic management system using IoT sensors and machine learning algorithms</li>
            <li className={styles.bulletPoint}>Implemented real-time traffic flow optimization reducing congestion by 35% in simulation</li>
            <li className={styles.bulletPoint}>Developed web dashboard for traffic monitoring and control using React.js and Node.js</li>
          </ul>
        </div>
      </div>

      {/* Certifications */}
      <div className="mb-4">
        <h2 className={styles.sectionTitle}>Certifications</h2>
        <div className="mb-2">
          <div className={styles.itemTitle}>AWS Cloud Practitioner:</div>
          <div className={styles.description}>AWS Certificate</div>
        </div>
        <div className="mb-2">
          <div className={styles.itemTitle}>Machine Learning Specialization:</div>
          <div className={styles.description}>Stanford University (Coursera)</div>
        </div>
        <div className="mb-2">
          <div className={styles.itemTitle}>Full Stack Web Development:</div>
          <div className={styles.description}>FreeCodeCamp</div>
        </div>
      </div>

      {/* Extra-Curricular Activities */}
      <div className="mb-4">
        <h2 className={styles.sectionTitle}>Extra-Curricular Activities</h2>

        <div className="mb-3">
          <div className={styles.itemTitle}>NextGen Cloud Tech Club - Technical Team Member</div>
          <ul className="list-disc list-inside mt-1">
            <li className={styles.bulletPoint}>Organized technical workshops and coding competitions for 200+ students</li>
            <li className={styles.bulletPoint}>Led team of 8 members in developing club's official website and mobile application</li>
            <li className={styles.bulletPoint}>Mentored junior students in programming and project development</li>
          </ul>
        </div>

        <div className="mb-3">
          <div className={styles.itemTitle}>Research Paper</div>
          <ul className="list-disc list-inside mt-1">
            <li className={styles.bulletPoint}>Applied to present my research paper at the ICISML conference on meeting summarization using natural language processing</li>
          </ul>
        </div>

        <div className="mb-3">
          <div className={styles.itemTitle}>Community Volunteer</div>
          <ul className="list-disc list-inside mt-1">
            <li className={styles.bulletPoint}>Participated in organizing and managing various events during the college fest. Responsibilities included coordinating with different teams and ensuring smooth execution of activities. Developed strong organizational skills.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
