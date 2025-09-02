#!/usr/bin/env node

/**
 * Final script to ensure all HTML files have correct CSS links
 */

const fs = require('fs');
const path = require('path');

// Function to recursively find all HTML files
function findHTMLFiles(dir, files = []) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            if (!['node_modules', '.git', 'assets', 'src'].includes(item)) {
                findHTMLFiles(fullPath, files);
            }
        } else if (item.endsWith('.html')) {
            files.push(fullPath.replace(/\\/g, '/'));
        }
    }
    
    return files;
}

// Function to get correct CSS path based on file location
function getCorrectCSSPath(filePath) {
    const depth = filePath.split('/').length - 1;
    if (depth === 0) return 'assets/css/output.css';
    if (depth === 1) return '../assets/css/output.css';
    return '../../assets/css/output.css';
}

// Function to process a single HTML file
function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const correctPath = getCorrectCSSPath(filePath);
        let updated = false;
        
        // Remove Tailwind CDN blocks
        const tailwindPattern = /<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>[\s\S]*?<\/script>/g;
        if (tailwindPattern.test(content)) {
            content = content.replace(tailwindPattern, `    <link rel="stylesheet" href="${correctPath}">`);
            updated = true;
        }
        
        // Fix existing CSS links with wrong paths or indentation
        const cssPattern = /\s*<link rel="stylesheet" href="[^"]*assets\/css\/output\.css">/g;
        if (cssPattern.test(content)) {
            content = content.replace(cssPattern, `    <link rel="stylesheet" href="${correctPath}">`);
            updated = true;
        }
        
        if (updated) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Updated: ${filePath} -> ${correctPath}`);
        }
        
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
    }
}

// Main execution
console.log('🔄 Final CSS fix...');

const htmlFiles = findHTMLFiles('.');
console.log(`Found ${htmlFiles.length} HTML files`);

htmlFiles.forEach(processFile);

console.log('✅ Final CSS fix completed!');
