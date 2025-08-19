#!/usr/bin/env node

/**
 * Batch Word Document to JSON Converter
 * 
 * This script can process multiple text files (exported from Word documents)
 * and convert them to JSON format for the practice application.
 * 
 * Usage:
 * 1. Export your Word documents as .txt files
 * 2. Place them in a 'word-docs' folder
 * 3. Run: node batch-word-to-json.js
 * 4. JSON files will be created in 'practice topics' folder
 */

const fs = require('fs');
const path = require('path');

// Configuration
const INPUT_FOLDER = 'word-docs';
const OUTPUT_FOLDER = 'practice topics';

// Ensure folders exist
if (!fs.existsSync(INPUT_FOLDER)) {
    fs.mkdirSync(INPUT_FOLDER);
    console.log(`📁 Created ${INPUT_FOLDER} folder. Place your .txt files here.`);
}

if (!fs.existsSync(OUTPUT_FOLDER)) {
    fs.mkdirSync(OUTPUT_FOLDER);
    console.log(`📁 Created ${OUTPUT_FOLDER} folder.`);
}

/**
 * Parse questions from text content
 */
function parseQuestions(text) {
    const questions = [];
    
    // Split by question numbers (1., 2., 3., etc.)
    const questionBlocks = text.split(/(?=\d+\.\s)/).filter(block => block.trim());
    
    questionBlocks.forEach((block, index) => {
        const lines = block.trim().split('\n').map(line => line.trim()).filter(line => line);
        
        if (lines.length < 3) return; // Skip if not enough content
        
        let questionText = '';
        let options = [];
        let answer = '';
        let explanation = '';
        
        let currentSection = 'question';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Remove question number from first line
            if (i === 0) {
                questionText = line.replace(/^\d+\.\s*/, '');
                continue;
            }
            
            // Check for options (A), B), C), D))
            if (/^[A-D]\)/.test(line)) {
                options.push(line);
                currentSection = 'options';
            }
            // Check for answer
            else if (/^Answer:\s*/i.test(line)) {
                answer = line.replace(/^Answer:\s*/i, '').trim();
                currentSection = 'answer';
            }
            // Check for explanation
            else if (/^Explanation:\s*/i.test(line)) {
                explanation = line.replace(/^Explanation:\s*/i, '').trim();
                currentSection = 'explanation';
            }
            // Continue building current section
            else {
                if (currentSection === 'question') {
                    questionText += ' ' + line;
                } else if (currentSection === 'explanation') {
                    explanation += ' ' + line;
                }
            }
        }
        
        // Convert answer letter to option text
        let correctOption = answer.toUpperCase();
        let answerText = '';
        
        if (correctOption && options.length > 0) {
            const optionIndex = correctOption.charCodeAt(0) - 65; // A=0, B=1, etc.
            if (options[optionIndex]) {
                answerText = options[optionIndex].replace(/^[A-D]\)\s*/, '').trim();
            }
        }
        
        if (questionText && options.length >= 2) {
            questions.push({
                id: `q${index + 1}`,
                question: questionText.trim(),
                options: options,
                answer: answerText,
                correctOption: correctOption,
                explanation: explanation || undefined,
                difficulty: "Medium"
            });
        }
    });
    
    return questions;
}

/**
 * Convert a single file
 */
function convertFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileName = path.basename(filePath, '.txt');
        
        // Try to determine category from filename
        let category = 'other';
        const lowerFileName = fileName.toLowerCase();
        
        if (lowerFileName.includes('quantitative') || lowerFileName.includes('math') || lowerFileName.includes('arithmetic')) {
            category = 'quantitative-aptitude';
        } else if (lowerFileName.includes('logical') || lowerFileName.includes('reasoning')) {
            category = 'logical-reasoning';
        } else if (lowerFileName.includes('verbal') || lowerFileName.includes('english') || lowerFileName.includes('language')) {
            category = 'verbal-ability';
        } else if (lowerFileName.includes('general') || lowerFileName.includes('knowledge') || lowerFileName.includes('gk')) {
            category = 'general-knowledge';
        }
        
        const questions = parseQuestions(content);
        
        if (questions.length === 0) {
            console.log(`⚠️  No questions found in ${fileName}`);
            return false;
        }
        
        const jsonOutput = {
            name: fileName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            category: category,
            description: `Practice questions for ${fileName.replace(/[-_]/g, ' ')}`,
            createdBy: "admin",
            lessons: [
                {
                    id: "lesson-1",
                    title: `${fileName.replace(/[-_]/g, ' ')} Practice Questions`,
                    description: `Practice questions for ${fileName.replace(/[-_]/g, ' ')}`,
                    content: "",
                    order: 0,
                    questions: questions
                }
            ]
        };
        
        const outputPath = path.join(OUTPUT_FOLDER, `${fileName}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(jsonOutput, null, 2));
        
        console.log(`✅ Converted ${fileName}: ${questions.length} questions → ${outputPath}`);
        return true;
        
    } catch (error) {
        console.error(`❌ Error converting ${filePath}:`, error.message);
        return false;
    }
}

/**
 * Main function
 */
function main() {
    console.log('🚀 Starting batch conversion...\n');
    
    // Get all .txt files from input folder
    const files = fs.readdirSync(INPUT_FOLDER)
        .filter(file => file.endsWith('.txt'))
        .map(file => path.join(INPUT_FOLDER, file));
    
    if (files.length === 0) {
        console.log(`📝 No .txt files found in ${INPUT_FOLDER} folder.`);
        console.log('\n📋 Instructions:');
        console.log('1. Export your Word documents as .txt files');
        console.log(`2. Place them in the ${INPUT_FOLDER} folder`);
        console.log('3. Run this script again');
        return;
    }
    
    console.log(`📁 Found ${files.length} files to convert:\n`);
    
    let successCount = 0;
    let totalQuestions = 0;
    
    files.forEach(file => {
        const success = convertFile(file);
        if (success) {
            successCount++;
            // Count questions in the generated file
            try {
                const outputFile = path.join(OUTPUT_FOLDER, `${path.basename(file, '.txt')}.json`);
                const jsonContent = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
                totalQuestions += jsonContent.lessons[0].questions.length;
            } catch (e) {
                // Ignore counting errors
            }
        }
    });
    
    console.log('\n🎉 Conversion complete!');
    console.log(`✅ Successfully converted: ${successCount}/${files.length} files`);
    console.log(`📊 Total questions: ${totalQuestions}`);
    console.log(`📂 Output folder: ${OUTPUT_FOLDER}`);
    
    if (successCount > 0) {
        console.log('\n📋 Next steps:');
        console.log('1. Review the generated JSON files');
        console.log('2. Copy them to your project\'s "practice topics" folder');
        console.log('3. Restart your application to load the new questions');
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { parseQuestions, convertFile };
