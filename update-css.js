#!/usr/bin/env node

/**
 * Script to replace Tailwind CDN with local CSS in all HTML files
 */

const fs = require('fs');
const path = require('path');

// Define the old Tailwind CDN pattern and new local CSS
const oldPattern = /    <script src="https:\/\/cdn\.tailwindcss\.com"><\/script>\s*\n    <script>\s*\n        tailwind\.config = \{\s*\n            theme: \{\s*\n                extend: \{\s*\n                    colors: \{\s*\n                        brand: ['"]#0ea5e9['"]?\s*\n                    \}\s*\n                \}\s*\n            \}\s*\n        \}\s*\n    <\/script>/g;

const newCSS = '    <link rel="stylesheet" href="../../assets/css/output.css">';
const newCSSRoot = '    <link rel="stylesheet" href="assets/css/output.css">';
const newCSSOneLevel = '    <link rel="stylesheet" href="../assets/css/output.css">';

// Function to get the correct CSS path based on directory depth
function getCSSPath(filePath) {
    const depth = filePath.split('/').length - 1;
    if (depth === 0) return newCSSRoot;
    if (depth === 1) return newCSSOneLevel;
    return newCSS;
}

// Function to process a single HTML file
function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Check if file contains Tailwind CDN
        if (content.includes('cdn.tailwindcss.com')) {
            console.log(`Processing: ${filePath}`);
            
            // Replace the Tailwind CDN block with local CSS
            const cssPath = getCSSPath(filePath);
            content = content.replace(oldPattern, cssPath);
            
            // Fallback for simpler patterns
            if (content.includes('cdn.tailwindcss.com')) {
                // Handle variations in formatting
                content = content.replace(
                    /<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>[\s\S]*?<\/script>/g,
                    cssPath
                );
            }
            
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Updated: ${filePath}`);
        }
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
    }
}

// Function to recursively find all HTML files
function findHTMLFiles(dir, files = []) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            // Skip node_modules and other build directories
            if (!['node_modules', '.git', 'assets', 'src'].includes(item)) {
                findHTMLFiles(fullPath, files);
            }
        } else if (item.endsWith('.html')) {
            files.push(fullPath);
        }
    }
    
    return files;
}

// Main execution
console.log('🔄 Starting CSS replacement...');

const htmlFiles = findHTMLFiles('.');
console.log(`Found ${htmlFiles.length} HTML files`);

htmlFiles.forEach(processFile);

console.log('✅ CSS replacement completed!');
