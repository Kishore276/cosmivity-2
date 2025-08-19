// Script to add sample data to Firebase
// Run this in your browser console on the practice page

const sampleData = [
  {
    name: "Number Systems",
    category: "quantitative",
    description: "Basic concepts of numbers, operations, and properties",
    createdBy: "admin",
    lessons: [
      {
        id: "lesson-1",
        title: "Natural Numbers",
        description: "Understanding natural numbers and their properties",
        content: "Natural numbers are positive integers starting from 1. They include 1, 2, 3, 4, 5, and so on.",
        order: 0,
        questions: [
          {
            id: "q1",
            question: "Which of the following is NOT a natural number?",
            options: ["0", "1", "5", "10"],
            answer: "0",
            explanation: "Natural numbers start from 1, so 0 is not included.",
            difficulty: "Easy"
          },
          {
            id: "q2",
            question: "What is the sum of first 5 natural numbers?",
            options: ["10", "15", "20", "25"],
            answer: "15",
            explanation: "1 + 2 + 3 + 4 + 5 = 15",
            difficulty: "Easy"
          }
        ]
      },
      {
        id: "lesson-2",
        title: "Prime Numbers",
        description: "Understanding prime numbers and their identification",
        content: "A prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself.",
        order: 1,
        questions: [
          {
            id: "q3",
            question: "Which of the following is a prime number?",
            options: ["4", "6", "7", "8"],
            answer: "7",
            explanation: "7 is only divisible by 1 and 7, making it prime.",
            difficulty: "Medium"
          }
        ]
      }
    ]
  },
  {
    name: "Analogies",
    category: "logical",
    description: "Understanding relationships between words and concepts",
    createdBy: "admin",
    lessons: [
      {
        id: "lesson-3",
        title: "Word Analogies",
        description: "Finding relationships between pairs of words",
        content: "Analogies test your ability to see relationships between words or concepts.",
        order: 0,
        questions: [
          {
            id: "q4",
            question: "Book : Author :: Painting : ?",
            options: ["Canvas", "Artist", "Color", "Frame"],
            answer: "Artist",
            explanation: "Just as a book is created by an author, a painting is created by an artist.",
            difficulty: "Medium"
          }
        ]
      }
    ]
  },
  {
    name: "Reading Comprehension",
    category: "verbal",
    description: "Understanding and analyzing written passages",
    createdBy: "admin",
    lessons: [
      {
        id: "lesson-4",
        title: "Short Passages",
        description: "Comprehending short text passages",
        content: "Reading comprehension involves understanding the main idea, details, and inferences from text.",
        order: 0,
        questions: [
          {
            id: "q5",
            question: "Based on the passage: 'The sun provides energy for all life on Earth through photosynthesis.' What is the main source of energy for life?",
            options: ["Moon", "Sun", "Water", "Air"],
            answer: "Sun",
            explanation: "The passage clearly states that the sun provides energy for all life on Earth.",
            difficulty: "Easy"
          }
        ]
      }
    ]
  }
];

// Function to add data to Firebase
async function addSampleData() {
  try {
    // Import Firebase functions
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    const { db } = await import('./src/lib/firebase');
    
    console.log('Adding sample data to Firebase...');
    
    for (const subject of sampleData) {
      const docRef = await addDoc(collection(db, 'aptitude-subjects'), {
        ...subject,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`Added subject: ${subject.name} with ID: ${docRef.id}`);
    }
    
    console.log('Sample data added successfully!');
    alert('Sample data added successfully! Refresh the page to see the content.');
  } catch (error) {
    console.error('Error adding sample data:', error);
    alert('Error adding sample data. Check console for details.');
  }
}

// Instructions for use:
console.log(`
To add sample data to Firebase:
1. Open the Practice page in your browser
2. Open browser console (F12)
3. Copy and paste this entire script
4. Run: addSampleData()
5. Refresh the page to see the content

The script will add 3 sample subjects:
- Number Systems (Quantitative)
- Analogies (Logical)  
- Reading Comprehension (Verbal)
`);

// Uncomment the line below to run automatically:
// addSampleData();
