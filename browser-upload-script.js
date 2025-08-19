// Simple browser console upload script
// Copy and paste this entire script into your browser console on the practice page

// Step 1: Load this script first
console.log('🚀 Upload script loaded! Now run: uploadYourData()');

async function uploadYourData() {
  try {
    console.log('📚 Starting upload process...');
    
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
    async function uploadSubject(subjectData, subjectName) {
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
          createdBy: 'admin',
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
    
    console.log('📋 Ready to upload! Please use one of these methods:');
    console.log('');
    console.log('METHOD 1 - Upload Logical Reasoning:');
    console.log('1. Copy content from logical_reasoning.json');
    console.log('2. Run: uploadLogicalReasoning(YOUR_JSON_DATA)');
    console.log('');
    console.log('METHOD 2 - Upload Quantitative Aptitude:');
    console.log('1. Copy content from quantitative_aptitude.json');
    console.log('2. Run: uploadQuantitativeAptitude(YOUR_JSON_DATA)');
    console.log('');
    console.log('METHOD 3 - Upload Verbal Ability:');
    console.log('1. Copy content from verbal_ability.json');
    console.log('2. Run: uploadVerbalAbility(YOUR_JSON_DATA)');
    console.log('');
    console.log('📝 Example: uploadLogicalReasoning([{...your json data...}])');
    
    // Create upload functions
    window.uploadLogicalReasoning = async function(jsonData) {
      try {
        console.log('📚 Uploading Logical Reasoning...');
        await uploadSubject(jsonData, 'Logical Reasoning');
        console.log('✅ Logical Reasoning uploaded successfully!');
      } catch (error) {
        console.error('❌ Failed to upload Logical Reasoning:', error);
      }
    };
    
    window.uploadQuantitativeAptitude = async function(jsonData) {
      try {
        console.log('📚 Uploading Quantitative Aptitude...');
        await uploadSubject(jsonData, 'Quantitative Aptitude');
        console.log('✅ Quantitative Aptitude uploaded successfully!');
      } catch (error) {
        console.error('❌ Failed to upload Quantitative Aptitude:', error);
      }
    };
    
    window.uploadVerbalAbility = async function(jsonData) {
      try {
        console.log('📚 Uploading Verbal Ability...');
        await uploadSubject(jsonData, 'Verbal Ability');
        console.log('✅ Verbal Ability uploaded successfully!');
      } catch (error) {
        console.error('❌ Failed to upload Verbal Ability:', error);
      }
    };
    
    // Quick upload all function (if you have all data ready)
    window.uploadAll = async function(logicalData, quantitativeData, verbalData) {
      try {
        console.log('🚀 Uploading all subjects...');
        
        if (logicalData) {
          await uploadSubject(logicalData, 'Logical Reasoning');
          console.log('✅ Logical Reasoning done!');
        }
        
        if (quantitativeData) {
          await uploadSubject(quantitativeData, 'Quantitative Aptitude');
          console.log('✅ Quantitative Aptitude done!');
        }
        
        if (verbalData) {
          await uploadSubject(verbalData, 'Verbal Ability');
          console.log('✅ Verbal Ability done!');
        }
        
        console.log('🎉 All subjects uploaded successfully!');
        alert('🎉 All practice data uploaded! Refresh the page to see your content.');
        
      } catch (error) {
        console.error('❌ Upload failed:', error);
        alert(`Upload failed: ${error.message}`);
      }
    };
    
  } catch (error) {
    console.error('❌ Script initialization failed:', error);
    alert(`Script failed: ${error.message}`);
  }
}

// Auto-run the setup
uploadYourData();
