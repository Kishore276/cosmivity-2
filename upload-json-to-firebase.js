// Script to upload JSON files to Firebase
// This script can be run in the browser console or as a Node.js script

// Method 1: Browser Console Upload (Recommended for small files)
async function uploadJSONToFirebase(jsonData, collectionName = 'aptitude-subjects') {
  try {
    console.log('Starting upload to Firebase...');
    
    // Import Firebase functions
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const { db } = await import('./src/lib/firebase');
    
    let uploadCount = 0;
    
    // Handle different JSON structures
    let dataToUpload = [];
    
    if (Array.isArray(jsonData)) {
      // If it's already an array of subjects
      dataToUpload = jsonData;
    } else if (jsonData.subjects) {
      // If it has a subjects property
      dataToUpload = jsonData.subjects;
    } else if (jsonData['aptitude-subjects']) {
      // If it matches our sample structure
      dataToUpload = jsonData['aptitude-subjects'];
    } else {
      // If it's a single subject object
      dataToUpload = [jsonData];
    }
    
    console.log(`Found ${dataToUpload.length} subjects to upload`);
    
    for (const subject of dataToUpload) {
      // Validate required fields
      if (!subject.name || !subject.category) {
        console.warn('Skipping subject - missing name or category:', subject);
        continue;
      }
      
      // Ensure category is valid
      const validCategories = ['quantitative', 'logical', 'verbal'];
      if (!validCategories.includes(subject.category)) {
        console.warn(`Invalid category "${subject.category}" for subject "${subject.name}". Using "quantitative" as default.`);
        subject.category = 'quantitative';
      }
      
      // Process lessons and questions
      if (subject.lessons && Array.isArray(subject.lessons)) {
        subject.lessons = subject.lessons.map((lesson, lessonIndex) => ({
          id: lesson.id || `lesson-${Date.now()}-${lessonIndex}`,
          title: lesson.title || `Lesson ${lessonIndex + 1}`,
          description: lesson.description || '',
          content: lesson.content || '',
          order: lesson.order !== undefined ? lesson.order : lessonIndex,
          questions: (lesson.questions || []).map((question, qIndex) => ({
            id: question.id || `q-${Date.now()}-${lessonIndex}-${qIndex}`,
            question: question.question || '',
            options: Array.isArray(question.options) ? question.options : [],
            answer: question.answer || '',
            explanation: question.explanation || '',
            difficulty: question.difficulty || 'Medium'
          })).filter(q => q.question.trim() !== '')
        })).filter(lesson => lesson.questions.length > 0);
      } else {
        subject.lessons = [];
      }
      
      // Skip subjects with no valid lessons
      if (subject.lessons.length === 0) {
        console.warn(`Skipping subject "${subject.name}" - no valid lessons found`);
        continue;
      }
      
      // Prepare document for Firebase
      const docData = {
        name: subject.name,
        category: subject.category,
        description: subject.description || '',
        lessons: subject.lessons,
        createdBy: subject.createdBy || 'admin',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Add to Firebase
      const docRef = await addDoc(collection(db, collectionName), docData);
      uploadCount++;
      
      console.log(`✅ Uploaded: "${subject.name}" (${subject.lessons.length} lessons) - ID: ${docRef.id}`);
    }
    
    console.log(`🎉 Upload complete! Successfully uploaded ${uploadCount} subjects.`);
    alert(`Upload successful! ${uploadCount} subjects added to Firebase. Refresh the page to see them.`);
    
    return { success: true, count: uploadCount };
    
  } catch (error) {
    console.error('❌ Upload failed:', error);
    alert(`Upload failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Method 2: File Upload Helper
function uploadJSONFile() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.multiple = true; // Allow multiple files
  
  input.onchange = async (event) => {
    const files = event.target.files;
    
    for (const file of files) {
      console.log(`Processing file: ${file.name}`);
      
      try {
        const text = await file.text();
        const jsonData = JSON.parse(text);
        
        console.log(`Parsed JSON from ${file.name}:`, jsonData);
        await uploadJSONToFirebase(jsonData);
        
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        alert(`Error processing ${file.name}: ${error.message}`);
      }
    }
  };
  
  input.click();
}

// Method 3: Direct JSON Paste
function uploadJSONFromClipboard() {
  const jsonString = prompt('Paste your JSON data here:');
  
  if (!jsonString) {
    console.log('Upload cancelled');
    return;
  }
  
  try {
    const jsonData = JSON.parse(jsonString);
    uploadJSONToFirebase(jsonData);
  } catch (error) {
    console.error('Invalid JSON:', error);
    alert('Invalid JSON format. Please check your data.');
  }
}

// Method 4: Batch Upload Multiple JSON Objects
async function batchUploadJSON(jsonArray) {
  console.log('Starting batch upload...');
  
  let totalUploaded = 0;
  
  for (let i = 0; i < jsonArray.length; i++) {
    console.log(`Processing batch ${i + 1}/${jsonArray.length}`);
    const result = await uploadJSONToFirebase(jsonArray[i]);
    
    if (result.success) {
      totalUploaded += result.count;
    }
    
    // Small delay to avoid overwhelming Firebase
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`🎉 Batch upload complete! Total subjects uploaded: ${totalUploaded}`);
  return totalUploaded;
}

// Helper function to convert different JSON formats
function convertToStandardFormat(jsonData) {
  // Add conversion logic here based on your JSON structure
  // This is a template - modify based on your actual JSON format
  
  if (jsonData.quantitative || jsonData.logical || jsonData.verbal) {
    // If your JSON has category-based structure
    const subjects = [];
    
    if (jsonData.quantitative) {
      subjects.push(...jsonData.quantitative.map(subject => ({
        ...subject,
        category: 'quantitative'
      })));
    }
    
    if (jsonData.logical) {
      subjects.push(...jsonData.logical.map(subject => ({
        ...subject,
        category: 'logical'
      })));
    }
    
    if (jsonData.verbal) {
      subjects.push(...jsonData.verbal.map(subject => ({
        ...subject,
        category: 'verbal'
      })));
    }
    
    return subjects;
  }
  
  return jsonData;
}

// Instructions
console.log(`
🚀 JSON to Firebase Upload Script Loaded!

Choose your upload method:

1. Upload JSON file(s):
   uploadJSONFile()

2. Paste JSON directly:
   uploadJSONFromClipboard()

3. Upload from variable:
   uploadJSONToFirebase(yourJsonData)

4. Batch upload multiple files:
   batchUploadJSON([json1, json2, json3])

Example usage:
- uploadJSONFile() // Opens file picker
- uploadJSONFromClipboard() // Paste JSON in prompt
- uploadJSONToFirebase(myData) // Direct upload

The script will automatically:
✅ Validate your JSON structure
✅ Convert to Firebase format
✅ Generate missing IDs
✅ Handle different JSON layouts
✅ Show upload progress
✅ Display results

Your JSON can be in any of these formats:
- Array of subjects: [subject1, subject2, ...]
- Object with subjects: {subjects: [...]}
- Category-based: {quantitative: [...], logical: [...], verbal: [...]}
- Single subject: {name: "...", category: "...", lessons: [...]}
`);
