import { ResumeData, ResumeTemplate } from './firebase-services';

export const downloadResumeAsHTML = (resumeData: ResumeData, template?: ResumeTemplate) => {
  const html = generateResumeHTML(resumeData, template);
  const element = document.createElement('a');
  const file = new Blob([html], { type: 'text/html' });
  element.href = URL.createObjectURL(file);
  element.download = `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.html`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

export const downloadResumeAsPDF = async (resumeData: ResumeData, template?: ResumeTemplate) => {
  // For now, we'll create a print-friendly HTML that users can print to PDF
  const html = generatePrintableHTML(resumeData, template);
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.write(html);
    newWindow.document.close();
    newWindow.focus();
    setTimeout(() => {
      newWindow.print();
    }, 250);
  }
};

const getTemplateCSS = (template?: ResumeTemplate): string => {
  if (!template) return '';

  const templateName = template.name.toLowerCase().replace(/\s+/g, '-');

  switch (templateName) {
    case 'ats-professional':
      return `
        body { background: #f8fafc; }
        .container { border: 2px solid #dbeafe; background: white; }
        .header { background: #eff6ff; border-bottom: 3px solid #2563eb; color: #1e40af; }
        .name { color: #1e40af; font-size: 2.5em; letter-spacing: 2px; }
        .contact { color: #1e40af; font-weight: 600; }
        .section-title { color: #1e40af; border-bottom: 2px solid #93c5fd; text-transform: uppercase; letter-spacing: 3px; }
        .item-title { color: #1f2937; font-size: 1.1em; }
        .item-subtitle { color: #2563eb; font-weight: 600; }
        .item-date { color: #3b82f6; font-weight: 600; }
      `;
    case 'modern-minimalist':
      return `
        .container { border-left: 8px solid #10b981; padding-left: 2rem; }
        .name { font-weight: 300; font-size: 3em; letter-spacing: -1px; }
        .contact { color: #6b7280; font-weight: 300; }
        .section-title { color: #059669; font-size: 0.9em; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid #d1fae5; }
        .item-title { font-weight: 500; }
        .item-subtitle { color: #059669; }
        .item-date { color: #9ca3af; font-size: 0.8em; }
        .description { font-weight: 300; }
      `;
    case 'technical-focus':
      return `
        body { background: #111827; color: #10b981; font-family: 'Courier New', monospace; }
        .container { background: #1f2937; border: 1px solid #10b981; }
        .header { background: #000; color: #10b981; border-bottom: 2px solid #10b981; }
        .name { color: #34d399; }
        .section-title { background: #374151; color: #34d399; padding: 0.5rem 1rem; border-left: 4px solid #10b981; text-transform: uppercase; }
        .experience-item { background: #374151; border-left: 2px solid #10b981; padding: 1rem; margin: 0.5rem 0; }
        .item-title::before { content: '['; }
        .item-title::after { content: ']'; }
        .item-subtitle::before { content: '@ '; }
        .description::before { content: '// '; }
      `;
    case 'academic-cv':
      return `
        .container { border: 1px solid #d1d5db; }
        .header { text-align: center; border-bottom: 1px solid #9ca3af; padding-bottom: 2rem; }
        .name { font-size: 3em; letter-spacing: 1px; }
        .section-title { text-align: center; font-size: 1.3em; border-bottom: 2px solid #9ca3af; margin: 2rem 0 1.5rem 0; }
        .experience-item { text-align: center; margin: 2rem 0; }
        .description { text-align: justify; line-height: 1.8; margin-top: 1rem; }
      `;
    case 'creative-professional':
      return `
        body { background: linear-gradient(135deg, #fdf4ff 0%, #fef7f0 100%); }
        .container { background: white; border: 4px solid #e879f9; border-radius: 1rem; }
        .header { background: white; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #e879f9; margin: 1rem; padding: 2rem; }
        .name { background: linear-gradient(45deg, #a855f7, #ec4899, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 3em; }
        .contact { color: #7c3aed; font-weight: 600; }
        .section-title { color: #7c3aed; border-bottom: 4px solid #e879f9; font-size: 1.3em; }
        .experience-item { background: white; border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border: 1px solid #e879f9; padding: 1.5rem; margin: 1rem 0; }
        .item-subtitle { color: #a855f7; }
        .item-date { background: linear-gradient(45deg, #fdf4ff, #fef7f0); padding: 0.25rem 0.5rem; border-radius: 0.25rem; }
      `;
    default:
      return '';
  }
};

const generateResumeHTML = (resumeData: ResumeData, template?: ResumeTemplate): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${resumeData.personalInfo.fullName} - Resume</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            background: #fff;
        }
        .container { padding: 2rem; }
        .header { 
            text-align: center; 
            border-bottom: 3px solid #2563eb; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
        }
        .header h1 { 
            font-size: 2.5em; 
            font-weight: bold; 
            color: #1e40af; 
            margin-bottom: 10px; 
        }
        .contact-info { 
            display: flex; 
            justify-content: center; 
            gap: 20px; 
            flex-wrap: wrap; 
            font-size: 0.9em; 
            color: #666;
        }
        .contact-info span { 
            display: flex; 
            align-items: center; 
            gap: 5px; 
        }
        .section { 
            margin-bottom: 30px; 
        }
        .section-title { 
            font-size: 1.3em; 
            font-weight: bold; 
            color: #1e40af; 
            border-bottom: 2px solid #e5e7eb; 
            padding-bottom: 8px; 
            margin-bottom: 15px; 
            text-transform: uppercase; 
            letter-spacing: 1px;
        }
        .item { 
            margin-bottom: 20px; 
            padding-left: 0; 
        }
        .item-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start; 
            margin-bottom: 5px; 
        }
        .item-title { 
            font-weight: bold; 
            font-size: 1.1em; 
            color: #1f2937; 
        }
        .item-subtitle { 
            color: #6b7280; 
            font-style: italic; 
            font-size: 0.95em; 
        }
        .item-date { 
            color: #6b7280; 
            font-size: 0.9em; 
            font-weight: 500; 
        }
        .item-description { 
            margin: 8px 0; 
            color: #374151; 
            line-height: 1.6; 
        }
        .achievements { 
            margin: 10px 0; 
            padding-left: 20px; 
        }
        .achievements li { 
            margin-bottom: 5px; 
            color: #374151; 
        }
        .skills-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 15px; 
        }
        .skill-group { 
            background: #f9fafb; 
            padding: 15px; 
            border-radius: 8px; 
            border-left: 4px solid #2563eb; 
        }
        .skill-category { 
            font-weight: bold; 
            color: #1e40af; 
            margin-bottom: 8px; 
        }
        .skill-items { 
            color: #374151; 
            font-size: 0.95em; 
        }
        .project-links { 
            margin-top: 8px; 
            font-size: 0.9em; 
        }
        .project-links a { 
            color: #2563eb; 
            text-decoration: none; 
            margin-right: 15px; 
        }
        .project-links a:hover { 
            text-decoration: underline; 
        }
        .technologies { 
            background: #eff6ff; 
            padding: 8px 12px; 
            border-radius: 6px; 
            font-size: 0.9em; 
            color: #1e40af; 
            margin-top: 8px; 
            display: inline-block; 
        }
        @media print {
            body { padding: 20px; }
            .section { page-break-inside: avoid; }
        }
        ${getTemplateCSS(template)}
    </style>
</head>
<body>
  <div class="container">
    <div class="header">
        <h1>${resumeData.personalInfo.fullName}</h1>
        <div class="contact-info">
            ${resumeData.personalInfo.email ? `<span>📧 ${resumeData.personalInfo.email}</span>` : ''}
            ${resumeData.personalInfo.phone ? `<span>📞 ${resumeData.personalInfo.phone}</span>` : ''}
            ${resumeData.personalInfo.location ? `<span>📍 ${resumeData.personalInfo.location}</span>` : ''}
            ${resumeData.personalInfo.linkedin ? `<span>💼 <a href="${resumeData.personalInfo.linkedin}" target="_blank">LinkedIn</a></span>` : ''}
            ${resumeData.personalInfo.github ? `<span>💻 <a href="${resumeData.personalInfo.github}" target="_blank">GitHub</a></span>` : ''}
            ${resumeData.personalInfo.website ? `<span>🌐 <a href="${resumeData.personalInfo.website}" target="_blank">Website</a></span>` : ''}
        </div>
    </div>
    
    ${resumeData.summary ? `
    <div class="section">
        <div class="section-title">Professional Summary</div>
        <p class="item-description">${resumeData.summary}</p>
    </div>
    ` : ''}
    
    ${resumeData.experience && resumeData.experience.length > 0 ? `
    <div class="section">
        <div class="section-title">Professional Experience</div>
        ${resumeData.experience.map(exp => `
        <div class="item">
            <div class="item-header">
                <div>
                    <div class="item-title">${exp.position}</div>
                    <div class="item-subtitle">${exp.company}</div>
                </div>
                <div class="item-date">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</div>
            </div>
            ${exp.description ? `<p class="item-description">${exp.description}</p>` : ''}
            ${exp.achievements.length > 0 ? `
            <ul class="achievements">
                ${exp.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
            </ul>
            ` : ''}
        </div>
        `).join('')}
    </div>
    ` : ''}
    
    ${resumeData.education && resumeData.education.length > 0 ? `
    <div class="section">
        <div class="section-title">Education</div>
        ${resumeData.education.map(edu => `
        <div class="item">
            <div class="item-header">
                <div>
                    <div class="item-title">${edu.degree} in ${edu.field}</div>
                    <div class="item-subtitle">${edu.institution}</div>
                </div>
                <div class="item-date">${edu.startDate} - ${edu.endDate}</div>
            </div>
            ${edu.gpa ? `<p class="item-description">GPA: ${edu.gpa}</p>` : ''}
            ${edu.achievements.length > 0 ? `
            <ul class="achievements">
                ${edu.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
            </ul>
            ` : ''}
        </div>
        `).join('')}
    </div>
    ` : ''}
    
    ${resumeData.skills && resumeData.skills.length > 0 ? `
    <div class="section">
        <div class="section-title">Technical Skills</div>
        <div class="skills-grid">
            ${resumeData.skills.map(skillGroup => `
            <div class="skill-group">
                <div class="skill-category">${skillGroup.category}</div>
                <div class="skill-items">${skillGroup.items.join(' • ')}</div>
            </div>
            `).join('')}
        </div>
    </div>
    ` : ''}
    
    ${resumeData.projects && resumeData.projects.length > 0 ? `
    <div class="section">
        <div class="section-title">Projects</div>
        ${resumeData.projects.map(project => `
        <div class="item">
            <div class="item-title">${project.name}</div>
            <p class="item-description">${project.description}</p>
            ${project.technologies.length > 0 ? `
            <div class="technologies">
                <strong>Technologies:</strong> ${project.technologies.join(' • ')}
            </div>
            ` : ''}
            <div class="project-links">
                ${project.link ? `<a href="${project.link}" target="_blank">🔗 Live Demo</a>` : ''}
                ${project.github ? `<a href="${project.github}" target="_blank">💻 Source Code</a>` : ''}
            </div>
        </div>
        `).join('')}
    </div>
    ` : ''}
    
    ${resumeData.certifications && resumeData.certifications.length > 0 ? `
    <div class="section">
        <div class="section-title">Certifications</div>
        ${resumeData.certifications.map(cert => `
        <div class="item">
            <div class="item-header">
                <div>
                    <div class="item-title">${cert.name}</div>
                    <div class="item-subtitle">${cert.issuer}</div>
                </div>
                <div class="item-date">${cert.date}</div>
            </div>
            ${cert.link ? `<div class="project-links"><a href="${cert.link}" target="_blank">🏆 View Certificate</a></div>` : ''}
        </div>
        `).join('')}
    </div>
    ` : ''}
  </div>
</body>
</html>
  `;
};

const generatePrintableHTML = (resumeData: ResumeData, template?: ResumeTemplate): string => {
  const baseHTML = generateResumeHTML(resumeData, template);
  return baseHTML.replace(
    '</head>',
    `<style>
      @media print {
        body { margin: 0; padding: 15px; }
        .header { page-break-after: avoid; }
        .section { page-break-inside: avoid; margin-bottom: 20px; }
        .item { page-break-inside: avoid; }
      }
    </style>
    <script>
      window.onload = function() {
        setTimeout(function() {
          window.print();
        }, 500);
      }
    </script>
    </head>`
  );
};
