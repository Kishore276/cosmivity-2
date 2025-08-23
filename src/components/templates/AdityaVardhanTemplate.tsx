import { Badge } from '@/components/ui/badge';
import { ResumeTemplate } from '@/lib/firebase-services';

interface TemplateProps {
  resumeData: any;
  template: ResumeTemplate;
  className?: string;
}

export function AdityaVardhanTemplate({ resumeData, template, className = '' }: TemplateProps) {
  // Map resumeData to template format with fallback values
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
    experience: resumeData.experience?.length ? resumeData.experience : [],
    education: resumeData.education?.length ? resumeData.education : [
      {
        degree: 'B Tech in Computer Science and Engineering',
        institution: 'Vellore Institute of Technology',
        startYear: '2021',
        endYear: 'Present',
        location: 'Amaravati, Andhra Pradesh',
        gpa: '8.62/10'
      },
      {
        degree: 'Intermediate',
        institution: 'Narayana Junior College',
        startYear: '2019',
        endYear: '2021',
        location: 'Andhra Pradesh',
        gpa: '9.60/10'
      },
      {
        degree: 'Schooling',
        institution: 'Narayana Institutions',
        startYear: '2018',
        endYear: '2019',
        location: 'Andhra Pradesh',
        gpa: '10/10'
      }
    ],
    projects: resumeData.projects?.length ? resumeData.projects : [
      {
        title: 'Autism Disorder Detection',
        technologies: 'Python, Convolutional Neural Networks, ResNet, VGG16, Deep Learning',
        description: [
          'Developed a deep learning-based system to detect autistic traits from image datasets, focusing on early and accurate diagnosis of autism spectrum disorders using advanced computer vision techniques such as normalization, data augmentation, and feature extraction.',
          'Incorporated advanced architectures like ResNet and VGG16 for improved accuracy and robustness.',
          'Evaluated the model using various metrics and cross-validation techniques to identify potential indicators of autism. Integrated transfer learning for faster training and better generalization on datasets.'
        ]
      },
      {
        title: 'Rice Plant Disease Detection',
        technologies: 'Python, Deep Learning, Convolutional Neural Networks',
        description: [
          'Developed a Convolutional Neural Network (CNN) model using TF 2D convolution, Max Pooling, and Softmax output layers to classify rice plant diseases with 95% accuracy, implementing data augmentation to enhance model performance.',
          'Trained the model on a dataset containing upon reaching the desired accuracy.',
          'Achieved a 95% accuracy on a standard rice leaf disease dataset.'
        ]
      },
      {
        title: 'Gaming Community',
        technologies: 'ReactJS, NodeJS, MongoDB',
        description: [
          'Developed a full-stack web application providing a platform for gamers to connect, share content, and communicate. Built a secure backend using Node.js and MongoDB, implementing user authentication and session management with JWT for data protection.',
          'Designed and implemented search and filtering functionalities to allow users to find game-specific groups and posts quickly. Integrated real-time messaging to allow users to chat and communicate within the platform.'
        ]
      }
    ],
    skills: resumeData.skills?.length ? resumeData.skills : [
      { category: 'Technical Skills', items: 'Machine Learning, Natural Language Processing, Deep Learning, OOPS, Artificial Intelligence' },
      { category: 'Programming Languages', items: 'Java, HTML, CSS, Python, ReactJS, NodeJS' },
      { category: 'Tools', items: 'NLTK, Numpy, scikit-learn, PyTorch, TensorFlow, OpenCV, PowerBI' },
      { category: 'Databases', items: 'SQL, MongoDB' },
      { category: 'Soft Skills', items: 'Leadership, Teamwork, Communication, Time management, Problem Solving, Analytical Thinking' }
    ],
    certifications: resumeData.certifications?.length ? resumeData.certifications : [
      { title: 'AWS Cloud Practitioner', issuer: 'AWS Certificate' },
      { title: 'MERN Full Stack Web Development', issuer: 'MERN Certificate' },
      { title: 'Google Analytics for Beginners', issuer: 'certificate' }
    ],
    activities: resumeData.activities?.length ? resumeData.activities : [
      {
        title: 'NextGen Cloud Tech Club - Technical Team Member',
        description: ['Worked as a technical team member in the NextGen Cloud tech club for 6 months']
      },
      {
        title: '(Institution of Engineers) Chapter - Technical Co-Lead',
        description: ['We are the founding team members of the IE chapter in our college']
      },
      {
        title: 'Research Paper',
        description: ['Applied to present my research paper at the ICISML conference on meeting summarization using natural language processing']
      },
      {
        title: 'Community Volunteer',
        description: ['Participated in organizing and managing various events during the college fest. Responsibilities included coordinating with different teams and ensuring smooth execution of activities. Developed strong organizational skills.']
      }
    ]
  };

  const styles = {
    container: 'bg-white text-black font-sans max-w-4xl mx-auto',
    header: 'text-center mb-6 border-b-2 border-black pb-4',
    name: 'text-2xl font-bold text-black mb-2 tracking-wide',
    contact: 'text-sm text-black flex justify-center items-center gap-4 mb-2',
    contactItem: 'flex items-center gap-1',
    sectionTitle: 'text-lg font-bold text-black mb-3 border-b border-black pb-1',
    itemTitle: 'font-bold text-black text-sm',
    itemSubtitle: 'text-black text-sm italic',
    itemDate: 'text-black text-sm font-medium',
    description: 'text-black text-sm leading-relaxed',
    bulletPoint: 'text-black text-sm leading-relaxed ml-4',
    skillCategory: 'font-semibold text-black text-sm',
    skillList: 'text-black text-sm'
  };

  return (
    <div className={`${styles.container} ${className} p-8 leading-relaxed border`}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.name}>{sampleData.personalInfo.fullName}</h1>
        <div className={styles.contact}>
          <div className={styles.contactItem}>
            <span>📞</span>
            <span>{sampleData.personalInfo.phone}</span>
          </div>
          <div className={styles.contactItem}>
            <span>✉️</span>
            <span>{sampleData.personalInfo.email}</span>
          </div>
          <div className={styles.contactItem}>
            <span>🔗</span>
            <span>{sampleData.personalInfo.linkedin}</span>
          </div>
          <div className={styles.contactItem}>
            <span>💻</span>
            <span>{sampleData.personalInfo.github}</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6">
        <h2 className={styles.sectionTitle}>Summary</h2>
        <p className={styles.description}>
          {sampleData.summary}
        </p>
      </div>

      {/* Education */}
      <div className="mb-6">
        <h2 className={styles.sectionTitle}>Education</h2>
        
        {sampleData.education.map((edu: any, index: number) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between items-start">
              <div>
                <div className={styles.itemTitle}>{edu.institution}</div>
                <div className={styles.itemSubtitle}>
                  {edu.degree} {edu.gpa && `(GPA: ${edu.gpa})`}
                </div>
              </div>
              <div className={styles.itemDate}>
                {edu.startYear} - {edu.endYear}
                {edu.location && <><br/>{edu.location}</>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Projects */}
      <div className="mb-6">
        <h2 className={styles.sectionTitle}>Projects</h2>
        
        {sampleData.projects.map((project: any, index: number) => (
          <div key={index} className="mb-4">
            <div className={styles.itemTitle}>
              {project.title} | {project.technologies}
            </div>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {Array.isArray(project.description) 
                ? project.description.map((desc: string, descIndex: number) => (
                    <li key={descIndex} className={styles.bulletPoint}>{desc}</li>
                  ))
                : <li className={styles.bulletPoint}>{project.description}</li>
              }
            </ul>
          </div>
        ))}

        {/* Experience Section - If any experience exists */}
        {sampleData.experience.length > 0 && (
          <>
            <h2 className={styles.sectionTitle}>Experience</h2>
            {sampleData.experience.map((exp: any, index: number) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className={styles.itemTitle}>{exp.position}</div>
                    <div className={styles.itemSubtitle}>{exp.company}</div>
                  </div>
                  <div className={styles.itemDate}>
                    {exp.startDate} - {exp.endDate}
                    {exp.location && <><br/>{exp.location}</>}
                  </div>
                </div>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {Array.isArray(exp.responsibilities) 
                    ? exp.responsibilities.map((resp: string, respIndex: number) => (
                        <li key={respIndex} className={styles.bulletPoint}>{resp}</li>
                      ))
                    : <li className={styles.bulletPoint}>{exp.responsibilities}</li>
                  }
                </ul>
              </div>
            ))}
          </>
        )}

        <div className="mb-4">
          <div className={styles.description}>
            <strong>Other Projects:</strong> Customer churn prediction, Smart Farming Assistant, Smart Farming using Solar Power, Facial Emotion Detection.
          </div>
        </div>
      </div>

      {/* Technical Skills */}
      <div className="mb-6">
        <h2 className={styles.sectionTitle}>Technical Skills</h2>
        <div className="grid grid-cols-1 gap-2">
          {sampleData.skills.map((skill: any, index: number) => (
            <div key={index}>
              <span className={styles.skillCategory}>✓ {skill.category}:</span>
              <span className={styles.skillList}> {skill.items}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div className="mb-6">
        <h2 className={styles.sectionTitle}>Certifications</h2>
        <div className="space-y-2">
          {sampleData.certifications.map((cert: any, index: number) => (
            <div key={index}>
              <span className={styles.skillCategory}>✓ {cert.title}:</span>
              <span className={styles.skillList}> {cert.issuer}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Extra-Curricular Activities */}
      <div className="mb-6">
        <h2 className={styles.sectionTitle}>Extra-Curricular Activities</h2>
        
        {sampleData.activities.map((activity: any, index: number) => (
          <div key={index} className="mb-3">
            <div className={styles.itemTitle}>{activity.title}</div>
            <ul className="list-disc list-inside mt-1">
              {Array.isArray(activity.description) 
                ? activity.description.map((desc: string, descIndex: number) => (
                    <li key={descIndex} className={styles.bulletPoint}>{desc}</li>
                  ))
                : <li className={styles.bulletPoint}>{activity.description}</li>
              }
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
