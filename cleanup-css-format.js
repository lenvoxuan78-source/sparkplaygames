#!/usr/bin/env node

/**
 * Script to clean up CSS link formatting in all HTML files
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

// Function to process a single HTML file
function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;
        
        // Fix formatting issues where CSS link is attached to script tag
        const badFormatPattern = /(\s*<\/script>)\s*(<link rel="stylesheet" href="[^"]*assets\/css\/output\.css">)/g;
        if (badFormatPattern.test(content)) {
            content = content.replace(badFormatPattern, '$1\n\n    $2');
            updated = true;
        }
        
        // Ensure proper indentation for CSS links
        const cssPattern = /^\s*<link rel="stylesheet" href="([^"]*assets\/css\/output\.css)">/gm;
        content = content.replace(cssPattern, '    <link rel="stylesheet" href="$1">');
        
        if (updated) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Cleaned up: ${filePath}`);
        }
        
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
    }
}

// Main execution
console.log('🔄 Cleaning up CSS formatting...');

const htmlFiles = findHTMLFiles('.');
htmlFiles.forEach(processFile);

console.log('✅ CSS formatting cleanup completed!');
