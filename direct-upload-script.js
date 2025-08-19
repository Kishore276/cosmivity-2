// Direct upload script for your practice topics
// Copy and paste this entire script in the browser console on the practice page

async function uploadAllPracticeTopics() {
  try {
    console.log('🚀 Starting direct upload of all practice topics...');
    
    // Import Firebase functions
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const { db } = await import('./src/lib/firebase');
    
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
    
    // Function to upload a subject
    async function uploadSubject(subjectData, fileName) {
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
    }
    
    // Load files using fetch (if running from localhost)
    try {
      console.log('📁 Attempting to load JSON files...');
      
      const files = [
        { path: './practice topics/logical_reasoning.json', name: 'Logical Reasoning' },
        { path: './practice topics/quantitative_aptitude.json', name: 'Quantitative Aptitude' },
        { path: './practice topics/verbal_ability.json', name: 'Verbal Ability' }
      ];
      
      for (const file of files) {
        try {
          console.log(`📚 Loading ${file.name}...`);
          const response = await fetch(file.path);
          
          if (!response.ok) {
            throw new Error(`Failed to load ${file.path}: ${response.status}`);
          }
          
          const jsonData = await response.json();
          await uploadSubject(jsonData, file.name);
          
        } catch (fetchError) {
          console.warn(`⚠️ Could not auto-load ${file.name}:`, fetchError.message);
          console.log(`Please manually copy and paste the content of ${file.path}`);
        }
      }
      
    } catch (error) {
      console.log('📋 Auto-loading failed. Please use manual method below.');
    }
    
    console.log('🎉 Upload process completed! Check above for any manual steps needed.');
    console.log('🔄 Refresh the practice page to see your content!');
    
  } catch (error) {
    console.error('❌ Upload failed:', error);
  }
}

// Manual upload functions for each file
async function uploadLogicalReasoning() {
  const data = []; // Paste your logical_reasoning.json content here
  
  if (data.length === 0) {
    console.log(`
📋 To upload Logical Reasoning:
1. Copy the entire content of 'practice topics/logical_reasoning.json'
2. Replace the empty array [] above with your data
3. Run this function again
    `);
    return;
  }
  
  await uploadSubjectData(data, 'Logical Reasoning');
}

async function uploadQuantitativeAptitude() {
  const data = []; // Paste your quantitative_aptitude.json content here
  
  if (data.length === 0) {
    console.log(`
📋 To upload Quantitative Aptitude:
1. Copy the entire content of 'practice topics/quantitative_aptitude.json'
2. Replace the empty array [] above with your data
3. Run this function again
    `);
    return;
  }
  
  await uploadSubjectData(data, 'Quantitative Aptitude');
}

async function uploadVerbalAbility() {
  const data = []; // Paste your verbal_ability.json content here
  
  if (data.length === 0) {
    console.log(`
📋 To upload Verbal Ability:
1. Copy the entire content of 'practice topics/verbal_ability.json'
2. Replace the empty array [] above with your data
3. Run this function again
    `);
    return;
  }
  
  await uploadSubjectData(data, 'Verbal Ability');
}

// Helper function to upload subject data
async function uploadSubjectData(subjectData, subjectName) {
  try {
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const { db } = await import('./src/lib/firebase');
    
    console.log(`📚 Uploading ${subjectName}...`);
    
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
    
  } catch (error) {
    console.error(`❌ Error uploading ${subjectName}:`, error);
  }
}

// Instructions
console.log(`
🚀 Practice Topics Direct Upload Script Loaded!

AUTOMATIC UPLOAD (try first):
uploadAllPracticeTopics()

MANUAL UPLOAD (if automatic fails):
1. uploadLogicalReasoning()
2. uploadQuantitativeAptitude() 
3. uploadVerbalAbility()

The script will:
✅ Fix options format (convert single strings to arrays)
✅ Process all lessons and questions properly
✅ Upload to Firebase with correct structure
✅ Show detailed progress and results

After upload, refresh the practice page to see your content!
`);

// Make functions available globally
window.uploadAllPracticeTopics = uploadAllPracticeTopics;
window.uploadLogicalReasoning = uploadLogicalReasoning;
window.uploadQuantitativeAptitude = uploadQuantitativeAptitude;
window.uploadVerbalAbility = uploadVerbalAbility;
window.uploadSubjectData = uploadSubjectData;
