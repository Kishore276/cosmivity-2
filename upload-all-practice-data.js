// Complete upload script for all 3 practice topic JSON files
// Copy and paste this entire script in the browser console on the practice page

async function uploadAllPracticeData() {
  try {
    console.log('🚀 Starting upload of all practice data...');
    
    // Import Firebase functions
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const { db } = await import('./src/lib/firebase');
    
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
    
    // Function to upload a subject
    async function uploadSubject(subjectData, fileName) {
      for (const subject of subjectData) {
        // Process lessons and fix questions
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
    
    // Try to load files automatically
    const files = [
      { path: './practice topics/logical_reasoning.json', name: 'Logical Reasoning' },
      { path: './practice topics/quantitative_aptitude.json', name: 'Quantitative Aptitude' },
      { path: './practice topics/verbal_ability.json', name: 'Verbal Ability' }
    ];
    
    let uploadedCount = 0;
    
    for (const file of files) {
      try {
        console.log(`📚 Loading ${file.name}...`);
        const response = await fetch(file.path);
        
        if (!response.ok) {
          throw new Error(`Failed to load ${file.path}: ${response.status}`);
        }
        
        const jsonData = await response.json();
        await uploadSubject(jsonData, file.name);
        uploadedCount++;
        
      } catch (fetchError) {
        console.warn(`⚠️ Could not auto-load ${file.name}:`, fetchError.message);
        console.log(`Please use manual upload for ${file.name}`);
      }
    }
    
    if (uploadedCount === 3) {
      console.log('🎉 All files uploaded successfully!');
      console.log('🔄 Refresh the practice page to see your content!');
      alert('🎉 All practice data uploaded successfully! Refresh the page to see your content.');
    } else {
      console.log(`⚠️ Only ${uploadedCount}/3 files uploaded automatically. Use manual methods below for remaining files.`);
    }
    
  } catch (error) {
    console.error('❌ Upload failed:', error);
    alert(`Upload failed: ${error.message}`);
  }
}

// Manual upload functions (if automatic fails)
async function uploadLogicalReasoning() {
  const logicalData = [
    {
      "name": "Logical Reasoning",
      "category": "logical",
      "description": "Logical aptitude section.",
      "createdBy": "admin",
      "lessons": [
        // Your logical reasoning lessons data will go here
        // Copy from logical_reasoning.json if needed
      ]
    }
  ];
  
  if (logicalData[0].lessons.length === 0) {
    console.log('📋 Please copy the lessons data from logical_reasoning.json into the logicalData array above');
    return;
  }
  
  await uploadSubjectData(logicalData, 'Logical Reasoning');
}

async function uploadQuantitativeAptitude() {
  const quantitativeData = [
    {
      "name": "Quantitative Aptitude", 
      "category": "quantitative",
      "description": "Quantitative aptitude section.",
      "createdBy": "admin",
      "lessons": [
        // Your quantitative aptitude lessons data will go here
        // Copy from quantitative_aptitude.json if needed
      ]
    }
  ];
  
  if (quantitativeData[0].lessons.length === 0) {
    console.log('📋 Please copy the lessons data from quantitative_aptitude.json into the quantitativeData array above');
    return;
  }
  
  await uploadSubjectData(quantitativeData, 'Quantitative Aptitude');
}

async function uploadVerbalAbility() {
  const verbalData = [
    {
      "name": "Verbal Ability",
      "category": "verbal", 
      "description": "Verbal aptitude section.",
      "createdBy": "admin",
      "lessons": [
        // Your verbal ability lessons data will go here
        // Copy from verbal_ability.json if needed
      ]
    }
  ];
  
  if (verbalData[0].lessons.length === 0) {
    console.log('📋 Please copy the lessons data from verbal_ability.json into the verbalData array above');
    return;
  }
  
  await uploadSubjectData(verbalData, 'Verbal Ability');
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
🚀 Practice Data Upload Script Loaded!

AUTOMATIC UPLOAD (recommended):
uploadAllPracticeData()

MANUAL UPLOAD (if automatic fails):
1. uploadLogicalReasoning()
2. uploadQuantitativeAptitude()
3. uploadVerbalAbility()

The script will:
✅ Load all 3 JSON files from your practice topics folder
✅ Fix the options format (convert single strings to proper arrays)
✅ Process all lessons and questions correctly
✅ Upload to Firebase with proper structure
✅ Show detailed progress and results

After upload, refresh the practice page to see your content!
`);

// Make functions available globally
window.uploadAllPracticeData = uploadAllPracticeData;
window.uploadLogicalReasoning = uploadLogicalReasoning;
window.uploadQuantitativeAptitude = uploadQuantitativeAptitude;
window.uploadVerbalAbility = uploadVerbalAbility;
window.uploadSubjectData = uploadSubjectData;
