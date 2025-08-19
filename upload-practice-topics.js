// Script to upload your practice topics JSON files to Firebase
// Run this in the browser console on the practice page

async function uploadPracticeTopics() {
  try {
    console.log('🚀 Starting upload of practice topics...');
    
    // Import Firebase functions
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const { db } = await import('./src/lib/firebase');
    
    // Your JSON data (paste the content of your files here)
    const practiceData = {
      logical_reasoning: [], // Will be filled with your data
      quantitative_aptitude: [], // Will be filled with your data
      verbal_ability: [] // Will be filled with your data
    };
    
    // Function to fix options format
    function fixOptionsFormat(questions) {
      return questions.map(question => {
        if (question.options && question.options.length === 1 && typeof question.options[0] === 'string') {
          // Split the single string into array of options
          const optionsString = question.options[0];
          const options = optionsString.split('\n').map(opt => {
            // Remove A), B), C), D) prefixes and trim
            return opt.replace(/^[A-D]\)\s*/, '').trim();
          }).filter(opt => opt.length > 0);
          
          return {
            ...question,
            options: options
          };
        }
        return question;
      });
    }
    
    // Function to process and upload a subject
    async function uploadSubject(subjectData, fileName) {
      try {
        console.log(`📚 Processing ${fileName}...`);
        
        for (const subject of subjectData) {
          // Fix options format for all questions in all lessons
          const processedLessons = subject.lessons.map(lesson => ({
            ...lesson,
            questions: fixOptionsFormat(lesson.questions || [])
          }));
          
          const docData = {
            name: subject.name,
            category: subject.category,
            description: subject.description,
            lessons: processedLessons,
            createdBy: subject.createdBy || 'admin',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          
          const docRef = await addDoc(collection(db, 'aptitude-subjects'), docData);
          
          const totalQuestions = processedLessons.reduce((total, lesson) => 
            total + (lesson.questions ? lesson.questions.length : 0), 0
          );
          
          console.log(`✅ Uploaded: "${subject.name}" with ${processedLessons.length} lessons and ${totalQuestions} questions - ID: ${docRef.id}`);
        }
        
        console.log(`✅ Completed ${fileName}`);
        
      } catch (error) {
        console.error(`❌ Error uploading ${fileName}:`, error);
        throw error;
      }
    }
    
    // Load and upload each file
    console.log('📁 Loading JSON files...');
    
    // You'll need to paste your JSON data here or load it
    // For now, I'll create a function to help you load the files
    
    console.log(`
🔧 To complete the upload, you need to:

1. Copy the content of each JSON file
2. Paste them into the variables below
3. Run the upload function

Example:
const logicalData = [/* paste logical_reasoning.json content here */];
const quantitativeData = [/* paste quantitative_aptitude.json content here */];
const verbalData = [/* paste verbal_ability.json content here */];

await uploadSubject(logicalData, 'Logical Reasoning');
await uploadSubject(quantitativeData, 'Quantitative Aptitude');
await uploadSubject(verbalData, 'Verbal Ability');
    `);
    
    return { success: true, message: 'Upload functions ready' };
    
  } catch (error) {
    console.error('❌ Upload failed:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to upload individual subject data
async function uploadSubjectData(subjectData, subjectName) {
  try {
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const { db } = await import('./src/lib/firebase');
    
    console.log(`📚 Uploading ${subjectName}...`);
    
    // Function to fix options format
    function fixOptionsFormat(questions) {
      return questions.map(question => {
        if (question.options && question.options.length === 1 && typeof question.options[0] === 'string') {
          const optionsString = question.options[0];
          const options = optionsString.split('\n').map(opt => {
            return opt.replace(/^[A-D]\)\s*/, '').trim();
          }).filter(opt => opt.length > 0);
          
          return {
            ...question,
            options: options
          };
        }
        return question;
      });
    }
    
    for (const subject of subjectData) {
      const processedLessons = subject.lessons.map(lesson => ({
        ...lesson,
        questions: fixOptionsFormat(lesson.questions || [])
      }));
      
      const docData = {
        name: subject.name,
        category: subject.category,
        description: subject.description,
        lessons: processedLessons,
        createdBy: subject.createdBy || 'admin',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'aptitude-subjects'), docData);
      
      const totalQuestions = processedLessons.reduce((total, lesson) => 
        total + (lesson.questions ? lesson.questions.length : 0), 0
      );
      
      console.log(`✅ Uploaded: "${subject.name}" with ${processedLessons.length} lessons and ${totalQuestions} questions - ID: ${docRef.id}`);
    }
    
    return { success: true };
    
  } catch (error) {
    console.error(`❌ Error uploading ${subjectName}:`, error);
    throw error;
  }
}

// Instructions
console.log(`
🚀 Practice Topics Upload Script Loaded!

To upload your JSON files:

Method 1 - Manual Copy/Paste:
1. Copy content from each JSON file
2. Use: await uploadSubjectData(yourData, 'Subject Name')

Method 2 - File Upload:
1. Use the file upload method from upload-json-to-firebase.js

Example usage:
// Copy your logical_reasoning.json content and paste as:
const logicalData = [/* your JSON content */];
await uploadSubjectData(logicalData, 'Logical Reasoning');

The script will automatically:
✅ Fix the options format (split single strings into arrays)
✅ Process all lessons and questions
✅ Upload to Firebase with proper structure
✅ Show progress and results
`);

// Make functions available globally
window.uploadPracticeTopics = uploadPracticeTopics;
window.uploadSubjectData = uploadSubjectData;
