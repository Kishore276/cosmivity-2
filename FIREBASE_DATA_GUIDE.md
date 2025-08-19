# Firebase Data Structure Guide

## How to Add Your Aptitude Content to Firebase

### 📊 Database Structure

Your content should be added to the `aptitude-subjects` collection in Firebase Firestore with this structure:

```
aptitude-subjects/
├── document-1/
│   ├── name: "Number Systems"
│   ├── category: "quantitative"
│   ├── description: "Basic concepts of numbers..."
│   ├── createdBy: "admin"
│   ├── createdAt: timestamp
│   ├── updatedAt: timestamp
│   └── lessons: [
│       {
│         id: "lesson-1",
│         title: "Natural Numbers",
│         description: "Understanding natural numbers...",
│         content: "Theory content here...",
│         order: 0,
│         questions: [
│           {
│             id: "q1",
│             question: "Which is NOT a natural number?",
│             options: ["0", "1", "5", "10"],
│             answer: "0",
│             explanation: "Natural numbers start from 1...",
│             difficulty: "Easy"
│           }
│         ]
│       }
│     ]
```

### 🏷️ Categories

Use these exact category values:
- `"quantitative"` - For Quantitative Aptitude
- `"logical"` - For Logical Reasoning  
- `"verbal"` - For Verbal Ability

### 📝 Field Descriptions

**Subject Level:**
- `name`: Subject name (e.g., "Number Systems", "Analogies")
- `category`: One of the three categories above
- `description`: Brief description of the subject
- `createdBy`: "admin" or your identifier
- `lessons`: Array of lesson objects

**Lesson Level:**
- `id`: Unique identifier (e.g., "lesson-1")
- `title`: Lesson title (e.g., "Natural Numbers")
- `description`: Brief lesson description
- `content`: Theory/explanation content (optional)
- `order`: Number for ordering (0, 1, 2...)
- `questions`: Array of question objects

**Question Level:**
- `id`: Unique identifier (e.g., "q1")
- `question`: The question text
- `options`: Array of 4 options for multiple choice
- `answer`: Correct answer (should match one of the options)
- `explanation`: Explanation of the answer (optional)
- `difficulty`: "Easy", "Medium", or "Hard"

### 🚀 Quick Start Methods

#### Method 1: Use the Sample Script
1. Open the Practice page in your browser
2. Open browser console (F12)
3. Copy and paste the content from `add-sample-data.js`
4. Run `addSampleData()` in the console
5. Refresh the page to see the content

#### Method 2: Firebase Console
1. Go to Firebase Console → Firestore Database
2. Create collection: `aptitude-subjects`
3. Add documents with the structure above
4. Content will appear automatically on the website

#### Method 3: Programmatic Addition
Use the `aptitudeService.addSubject()` function in your code:

```javascript
await aptitudeService.addSubject({
  name: "Your Subject Name",
  category: "quantitative", // or "logical" or "verbal"
  description: "Subject description",
  lessons: [
    {
      id: "lesson-1",
      title: "Lesson Title",
      description: "Lesson description",
      content: "Theory content",
      order: 0,
      questions: [
        {
          id: "q1",
          question: "Question text?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          answer: "Option A",
          explanation: "Why this is correct",
          difficulty: "Medium"
        }
      ]
    }
  ],
  createdBy: "admin"
});
```

### 📚 Organizing Your Documents

**For Quantitative Aptitude:**
- Number Systems → Lessons: Natural Numbers, Integers, Rational Numbers
- Algebra → Lessons: Linear Equations, Quadratic Equations
- Geometry → Lessons: Basic Shapes, Area & Perimeter
- Data Interpretation → Lessons: Tables, Graphs, Charts

**For Logical Reasoning:**
- Analogies → Lessons: Word Analogies, Number Analogies
- Series → Lessons: Number Series, Letter Series
- Syllogisms → Lessons: Basic Syllogisms, Complex Syllogisms
- Puzzles → Lessons: Seating Arrangement, Blood Relations

**For Verbal Ability:**
- Reading Comprehension → Lessons: Short Passages, Long Passages
- Vocabulary → Lessons: Synonyms, Antonyms
- Grammar → Lessons: Tenses, Articles
- Sentence Correction → Lessons: Common Errors, Style

### ✅ Best Practices

1. **Consistent Naming**: Use clear, descriptive names
2. **Proper Ordering**: Use the `order` field to sequence lessons
3. **Quality Questions**: Include explanations for better learning
4. **Balanced Difficulty**: Mix Easy, Medium, and Hard questions
5. **Unique IDs**: Ensure all IDs are unique within their scope

### 🔄 Real-time Updates

The website automatically displays content from Firebase in real-time. Any changes you make to the database will appear immediately without needing to refresh the page.

### 📊 Data Validation

The system expects:
- At least 1 lesson per subject
- At least 1 question per lesson
- All required fields filled
- Valid category values
- Proper difficulty levels

Once you add content to Firebase using any of these methods, it will automatically appear on the Practice Hub page organized by categories with full practice functionality!
