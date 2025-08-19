// JSON Format Converter for Different Aptitude Test Structures
// This helps convert various JSON formats to our Firebase structure

// Common JSON format converters
const formatConverters = {
  
  // Format 1: Simple question-answer format
  simpleQA: (data) => {
    /*
    Expected input:
    {
      "subject": "Number Systems",
      "category": "quantitative",
      "questions": [
        {
          "question": "What is 2+2?",
          "options": ["3", "4", "5", "6"],
          "answer": "4"
        }
      ]
    }
    */
    return {
      name: data.subject || data.name || "Unknown Subject",
      category: data.category || "quantitative",
      description: data.description || "",
      lessons: [{
        id: "lesson-1",
        title: "Practice Questions",
        description: "Practice questions for " + (data.subject || data.name),
        content: "",
        order: 0,
        questions: (data.questions || []).map((q, index) => ({
          id: `q-${index + 1}`,
          question: q.question || q.q || "",
          options: q.options || q.choices || [],
          answer: q.answer || q.correct || "",
          explanation: q.explanation || q.exp || "",
          difficulty: q.difficulty || "Medium"
        }))
      }],
      createdBy: "admin"
    };
  },

  // Format 2: Chapter-wise structure
  chapterWise: (data) => {
    /*
    Expected input:
    {
      "subject": "Quantitative Aptitude",
      "chapters": [
        {
          "name": "Number Systems",
          "questions": [...]
        }
      ]
    }
    */
    return {
      name: data.subject || data.name || "Unknown Subject",
      category: data.category || "quantitative",
      description: data.description || "",
      lessons: (data.chapters || data.lessons || []).map((chapter, index) => ({
        id: `lesson-${index + 1}`,
        title: chapter.name || chapter.title || `Chapter ${index + 1}`,
        description: chapter.description || "",
        content: chapter.content || chapter.theory || "",
        order: index,
        questions: (chapter.questions || []).map((q, qIndex) => ({
          id: `q-${index + 1}-${qIndex + 1}`,
          question: q.question || q.q || "",
          options: q.options || q.choices || [],
          answer: q.answer || q.correct || "",
          explanation: q.explanation || q.exp || "",
          difficulty: q.difficulty || q.level || "Medium"
        }))
      })),
      createdBy: "admin"
    };
  },

  // Format 3: Topic-based structure
  topicBased: (data) => {
    /*
    Expected input:
    {
      "topics": {
        "Number Systems": {
          "questions": [...]
        },
        "Algebra": {
          "questions": [...]
        }
      }
    }
    */
    const subjects = [];
    const topics = data.topics || data;
    
    Object.keys(topics).forEach((topicName, index) => {
      const topic = topics[topicName];
      subjects.push({
        name: topicName,
        category: data.category || "quantitative",
        description: topic.description || "",
        lessons: [{
          id: "lesson-1",
          title: "Practice Questions",
          description: `Questions for ${topicName}`,
          content: topic.content || topic.theory || "",
          order: 0,
          questions: (topic.questions || []).map((q, qIndex) => ({
            id: `q-${qIndex + 1}`,
            question: q.question || q.q || "",
            options: q.options || q.choices || [],
            answer: q.answer || q.correct || "",
            explanation: q.explanation || q.exp || "",
            difficulty: q.difficulty || "Medium"
          }))
        }],
        createdBy: "admin"
      });
    });
    
    return subjects;
  },

  // Format 4: Exam-style format
  examStyle: (data) => {
    /*
    Expected input:
    {
      "exam": "Aptitude Test",
      "sections": [
        {
          "name": "Quantitative",
          "questions": [...]
        }
      ]
    }
    */
    return (data.sections || []).map((section, index) => ({
      name: section.name || `Section ${index + 1}`,
      category: section.category || getCategoryFromName(section.name),
      description: section.description || "",
      lessons: [{
        id: "lesson-1",
        title: "Practice Questions",
        description: `Questions for ${section.name}`,
        content: "",
        order: 0,
        questions: (section.questions || []).map((q, qIndex) => ({
          id: `q-${qIndex + 1}`,
          question: q.question || q.q || "",
          options: q.options || q.choices || [],
          answer: q.answer || q.correct || "",
          explanation: q.explanation || q.exp || "",
          difficulty: q.difficulty || "Medium"
        }))
      }],
      createdBy: "admin"
    }));
  }
};

// Helper function to determine category from name
function getCategoryFromName(name) {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('quantitative') || lowerName.includes('math') || lowerName.includes('numerical')) {
    return 'quantitative';
  } else if (lowerName.includes('logical') || lowerName.includes('reasoning') || lowerName.includes('logic')) {
    return 'logical';
  } else if (lowerName.includes('verbal') || lowerName.includes('english') || lowerName.includes('language')) {
    return 'verbal';
  }
  return 'quantitative'; // default
}

// Auto-detect format and convert
function autoConvertJSON(jsonData) {
  console.log('Auto-detecting JSON format...');
  
  // Check for different format indicators
  if (jsonData.questions && !jsonData.chapters && !jsonData.lessons) {
    console.log('Detected: Simple Q&A format');
    return formatConverters.simpleQA(jsonData);
  }
  
  if (jsonData.chapters || (jsonData.lessons && Array.isArray(jsonData.lessons))) {
    console.log('Detected: Chapter-wise format');
    return formatConverters.chapterWise(jsonData);
  }
  
  if (jsonData.topics || (typeof jsonData === 'object' && !Array.isArray(jsonData) && !jsonData.name && !jsonData.subject)) {
    console.log('Detected: Topic-based format');
    return formatConverters.topicBased(jsonData);
  }
  
  if (jsonData.sections || jsonData.exam) {
    console.log('Detected: Exam-style format');
    return formatConverters.examStyle(jsonData);
  }
  
  if (Array.isArray(jsonData)) {
    console.log('Detected: Array of subjects');
    return jsonData;
  }
  
  // Default: treat as single subject
  console.log('Using default conversion');
  return formatConverters.simpleQA(jsonData);
}

// Main conversion function
function convertJSONToFirebaseFormat(jsonData) {
  try {
    let converted = autoConvertJSON(jsonData);
    
    // Ensure it's an array
    if (!Array.isArray(converted)) {
      converted = [converted];
    }
    
    // Validate and clean up
    converted = converted.filter(subject => {
      if (!subject.name || !subject.lessons || subject.lessons.length === 0) {
        console.warn('Skipping invalid subject:', subject);
        return false;
      }
      return true;
    });
    
    console.log(`Converted ${converted.length} subjects for Firebase`);
    return converted;
    
  } catch (error) {
    console.error('Conversion failed:', error);
    throw new Error(`JSON conversion failed: ${error.message}`);
  }
}

// Upload with auto-conversion
async function uploadJSONWithAutoConvert(jsonData) {
  try {
    const converted = convertJSONToFirebaseFormat(jsonData);
    
    // Use the upload function from the main script
    if (typeof uploadJSONToFirebase === 'function') {
      return await uploadJSONToFirebase(converted);
    } else {
      console.error('Upload function not found. Make sure to load upload-json-to-firebase.js first');
      return { success: false, error: 'Upload function not available' };
    }
  } catch (error) {
    console.error('Upload with conversion failed:', error);
    return { success: false, error: error.message };
  }
}

// Example usage and instructions
console.log(`
📄 JSON Format Converter Loaded!

This script can handle various JSON formats:

1. Simple Q&A:
   {
     "subject": "Math",
     "questions": [{"question": "...", "options": [...], "answer": "..."}]
   }

2. Chapter-wise:
   {
     "subject": "Aptitude",
     "chapters": [{"name": "Numbers", "questions": [...]}]
   }

3. Topic-based:
   {
     "topics": {
       "Algebra": {"questions": [...]},
       "Geometry": {"questions": [...]}
     }
   }

4. Exam-style:
   {
     "sections": [{"name": "Quantitative", "questions": [...]}]
   }

Usage:
1. Load your JSON: const myData = {...}
2. Convert: const converted = convertJSONToFirebaseFormat(myData)
3. Upload: uploadJSONWithAutoConvert(myData)

Or use the file upload with auto-conversion:
uploadJSONFile() // Will auto-detect and convert format
`);

// Make functions available globally
window.convertJSONToFirebaseFormat = convertJSONToFirebaseFormat;
window.uploadJSONWithAutoConvert = uploadJSONWithAutoConvert;
window.autoConvertJSON = autoConvertJSON;
