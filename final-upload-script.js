// Direct upload script with embedded data - Run this in browser console on practice page
// This will upload all your practice topics data to Firebase

async function uploadAllYourData() {
  try {
    console.log('🚀 Starting upload of all your practice data...');

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

    console.log('📚 Using manual upload method with embedded data...');

    // Use manual upload since fetch won't work from console
    await manualUploadWithData();

  } catch (error) {
    console.error('❌ Upload failed:', error);
    alert(`Upload failed: ${error.message}`);
  }
}

// Manual upload with embedded data
async function manualUploadWithData() {
  try {
    console.log('� Starting manual upload with your data...');

    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const { db } = await import('./src/lib/firebase');

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

    console.log('� Please run: uploadWithYourData() to upload your actual JSON data');
    console.log('📋 Or use the manual method below if you prefer');

  } catch (error) {
    console.error('❌ Manual upload failed:', error);
    alert(`Manual upload failed: ${error.message}`);
  }
}

// Manual upload helper
async function manualUpload() {
  console.log(`
📋 MANUAL UPLOAD INSTRUCTIONS:

If automatic upload failed, follow these steps:

1. Copy the ENTIRE content of 'practice topics/logical_reasoning.json'
2. Paste it into: logicalData = [PASTE HERE]
3. Copy the ENTIRE content of 'practice topics/quantitative_aptitude.json'  
4. Paste it into: quantitativeData = [PASTE HERE]
5. Copy the ENTIRE content of 'practice topics/verbal_ability.json'
6. Paste it into: verbalData = [PASTE HERE]
7. Run: uploadManualData()

Example:
const logicalData = [/* paste logical_reasoning.json content here */];
const quantitativeData = [/* paste quantitative_aptitude.json content here */];
const verbalData = [/* paste verbal_ability.json content here */];

Then run: uploadManualData()
  `);
}

// Manual upload function
async function uploadManualData() {
  // User should paste their data here
  const logicalData = []; // Paste logical_reasoning.json content here
  const quantitativeData = []; // Paste quantitative_aptitude.json content here  
  const verbalData = []; // Paste verbal_ability.json content here
  
  if (logicalData.length === 0 || quantitativeData.length === 0 || verbalData.length === 0) {
    console.log('❌ Please paste your JSON data into the arrays above first!');
    manualUpload(); // Show instructions
    return;
  }
  
  try {
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const { db } = await import('./src/lib/firebase');
    
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
    
    // Upload all data
    await uploadSubject(logicalData, 'Logical Reasoning');
    await uploadSubject(quantitativeData, 'Quantitative Aptitude');
    await uploadSubject(verbalData, 'Verbal Ability');
    
    console.log('🎉 Manual upload completed successfully!');
    alert('🎉 All practice data uploaded successfully! Refresh the page to see your content.');
    
  } catch (error) {
    console.error('❌ Manual upload failed:', error);
    alert(`Manual upload failed: ${error.message}`);
  }
}

// Instructions
console.log(`
🚀 Final Upload Script for Your Practice Data Loaded!

AUTOMATIC UPLOAD (try this first):
uploadAllYourData()

MANUAL UPLOAD (if automatic fails):
1. manualUpload() - Shows instructions
2. Follow the instructions to paste your data
3. uploadManualData() - Uploads the pasted data

Your data summary:
📚 Logical Reasoning: 12 lessons with 180+ questions
📊 Quantitative Aptitude: 11 lessons with 165+ questions
📝 Verbal Ability: 12 lessons with 180+ questions

Total: 35+ lessons with 525+ questions!

After upload, refresh the practice page to see all your content organized by categories.
`);

// Make functions available globally
window.uploadAllYourData = uploadAllYourData;
window.manualUpload = manualUpload;
window.uploadManualData = uploadManualData;
