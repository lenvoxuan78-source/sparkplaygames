#!/usr/bin/env node

/**
 * Validation script for CSS migration
 * Ensures all pages have been properly migrated from Tailwind CDN to local CSS
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

// Function to validate a single HTML file
function validateFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // Check for Tailwind CDN (should not exist)
    if (content.includes('cdn.tailwindcss.com')) {
        issues.push('❌ Still contains Tailwind CDN');
    }
    
    // Check for CSS link
    if (!content.includes('assets/css/output.css')) {
        issues.push('❌ Missing local CSS link');
    }
    
    // Check for inline Tailwind config (should not exist)
    if (content.includes('tailwind.config =')) {
        issues.push('❌ Still contains inline Tailwind config');
    }
    
    // Validate CSS path based on file location
    const depth = filePath.split('/').length - 1;
    let expectedPath;
    if (depth === 0) expectedPath = 'assets/css/output.css';
    else if (depth === 1) expectedPath = '../assets/css/output.css';
    else expectedPath = '../../assets/css/output.css';
    
    if (!content.includes(`href="${expectedPath}"`)) {
        issues.push(`❌ Incorrect CSS path (expected: ${expectedPath})`);
    }
    
    return issues;
}

// Main validation
console.log('🔍 Validating CSS migration...\n');

const htmlFiles = findHTMLFiles('.');
let totalIssues = 0;
let validFiles = 0;

console.log(`Found ${htmlFiles.length} HTML files to validate\n`);

htmlFiles.forEach(filePath => {
    const issues = validateFile(filePath);
    
    if (issues.length === 0) {
        console.log(`✅ ${filePath}`);
        validFiles++;
    } else {
        console.log(`❌ ${filePath}:`);
        issues.forEach(issue => console.log(`   ${issue}`));
        totalIssues += issues.length;
    }
});

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 VALIDATION SUMMARY');
console.log('='.repeat(50));
console.log(`Total files: ${htmlFiles.length}`);
console.log(`Valid files: ${validFiles}`);
console.log(`Files with issues: ${htmlFiles.length - validFiles}`);
console.log(`Total issues: ${totalIssues}`);

// Check CSS file
if (fs.existsSync('assets/css/output.css')) {
    const cssStats = fs.statSync('assets/css/output.css');
    console.log(`CSS file size: ${(cssStats.size / 1024).toFixed(2)} KB`);
    console.log('✅ CSS file exists');
} else {
    console.log('❌ CSS file missing');
    totalIssues++;
}

// Final result
if (totalIssues === 0) {
    console.log('\n🎉 CSS migration completed successfully!');
    console.log('All pages are now using local CSS instead of Tailwind CDN.');
    console.log('\n📈 Performance benefits:');
    console.log('• No blocking CDN requests');
    console.log('• Faster page load times');
    console.log('• Better caching control');
    console.log('• Offline compatibility');
} else {
    console.log(`\n❌ Migration incomplete: ${totalIssues} issues found`);
    console.log('Please fix the issues above before deploying.');
    process.exit(1);
}

console.log('\n🚀 Ready for deployment!');
