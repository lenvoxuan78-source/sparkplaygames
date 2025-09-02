#!/usr/bin/env node

/**
 * Simple validation script for internal navigation links only
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
    
    // Only check for navigation link problems (exclude CSS and asset links)
    const problemPatterns = [
        { pattern: /href="[^"]*\/index\.html"/g, description: 'Link to index.html instead of directory' },
        { pattern: /href="\/genre\/games\/"/g, description: 'Incorrect /genre/games/ path' },
        { pattern: /href="\/genre\/genre\/"/g, description: 'Duplicate /genre/genre/ path' },
        { pattern: /href="\/genre\/best\/"/g, description: 'Incorrect /genre/best/ path' },
        { pattern: /href="\/best\/games\/"/g, description: 'Incorrect /best/games/ path' },
        { pattern: /href="\/games\/genre\/"/g, description: 'Incorrect /games/genre/ path' },
        { pattern: /href="\/games\/best\/"/g, description: 'Incorrect /games/best/ path' }
    ];
    
    problemPatterns.forEach(({ pattern, description }) => {
        const matches = content.match(pattern);
        if (matches) {
            matches.forEach(match => {
                issues.push(`${description}: ${match}`);
            });
        }
    });
    
    // Count navigation links only
    const navLinks = content.match(/href="\/[^"]*"(?![^>]*stylesheet)/g) || [];
    
    return { issues, navLinkCount: navLinks.length };
}

// Main validation
console.log('🔍 Validating internal navigation links...\n');

const htmlFiles = findHTMLFiles('.');
let totalIssues = 0;
let validFiles = 0;
let totalNavLinks = 0;

console.log(`Found ${htmlFiles.length} HTML files\n`);

htmlFiles.forEach(filePath => {
    const { issues, navLinkCount } = validateFile(filePath);
    totalNavLinks += navLinkCount;
    
    if (issues.length === 0) {
        console.log(`✅ ${filePath} (${navLinkCount} nav links)`);
        validFiles++;
    } else {
        console.log(`❌ ${filePath}:`);
        issues.forEach(issue => console.log(`   ${issue}`));
        totalIssues += issues.length;
    }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 INTERNAL LINK VALIDATION SUMMARY');
console.log('='.repeat(60));
console.log(`Total files: ${htmlFiles.length}`);
console.log(`Valid files: ${validFiles}`);
console.log(`Files with issues: ${htmlFiles.length - validFiles}`);
console.log(`Total issues: ${totalIssues}`);
console.log(`Total navigation links: ${totalNavLinks}`);

if (totalIssues === 0) {
    console.log('\n🎉 ALL INTERNAL NAVIGATION LINKS ARE STANDARDIZED!');
    console.log('\n✅ Benefits achieved:');
    console.log('• Consistent URL structure across all pages');
    console.log('• Better SEO with canonical URLs');
    console.log('• Improved search engine crawling');
    console.log('• Enhanced user experience');
    console.log('• Easier maintenance and debugging');
    
    console.log('\n📋 Link Structure:');
    console.log('• Home: /');
    console.log('• Games: /games/ and /games/game-name/');
    console.log('• Genres: /genre/ and /genre/category/');
    console.log('• Collections: /best/ and /best/collection/');
    console.log('• Pages: /about/, /contact/, /privacy/, /terms/, /cookie/');
    
} else {
    console.log(`\n❌ Link standardization incomplete: ${totalIssues} issues found`);
    console.log('Please fix the issues above for optimal SEO performance.');
}

console.log('\n🎯 Internal link standardization task completed!');
