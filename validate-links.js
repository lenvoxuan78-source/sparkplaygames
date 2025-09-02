#!/usr/bin/env node

/**
 * Script to validate all internal links are properly standardized to absolute paths
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
    
    // Check for relative paths that should be absolute
    const relativePatterns = [
        { pattern: /href="\.\.\/[^"]*"/g, description: 'Relative path with ../' },
        { pattern: /href="[^"]*\/index\.html"/g, description: 'Link to index.html instead of directory' },
        { pattern: /href="[^"]*\.\.\/[^"]*"/g, description: 'Path contains ../' },
        { pattern: /href="[^"]*\/\.\./g, description: 'Path ends with ..' }
    ];
    
    relativePatterns.forEach(({ pattern, description }) => {
        const matches = content.match(pattern);
        if (matches) {
            matches.forEach(match => {
                issues.push(`${description}: ${match}`);
            });
        }
    });
    
    // Check for correct absolute paths
    const absoluteLinks = content.match(/href="\/[^"]*"/g) || [];
    const validPaths = [
        '/', '/genre/', '/best/', '/games/', '/about/', '/contact/', '/privacy/', '/terms/', '/cookie/',
        // Genre pages
        '/genre/casual/', '/genre/arcade/', '/genre/idle/', '/genre/sandbox/', '/genre/simulator/',
        '/genre/driving/', '/genre/fps/', '/genre/multiplayer/', '/genre/action/',
        // Best collections
        '/best/best-arcade-picks/', '/best/cozy-and-idle/', '/best/shooters-3d/',
        // Games
        '/games/love-tester/', '/games/cat-simulator/', '/games/gta-simulator/', '/games/farming-island/',
        '/games/madalin-stunt-cars-pro/', '/games/real-flight-simulator/', '/games/stack-fire-ball/',
        '/games/toonz-io/', '/games/voxel-world/', '/games/wasteland-shooters/'
    ];
    
    absoluteLinks.forEach(link => {
        const href = link.match(/href="([^"]*)"/)[1];
        if (!validPaths.includes(href) && !href.startsWith('http') && href !== '#') {
            issues.push(`Unknown absolute path: ${link}`);
        }
    });
    
    return issues;
}

// Main validation
console.log('🔍 Validating internal link standardization...\n');

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
console.log('\n' + '='.repeat(60));
console.log('📊 LINK VALIDATION SUMMARY');
console.log('='.repeat(60));
console.log(`Total files: ${htmlFiles.length}`);
console.log(`Valid files: ${validFiles}`);
console.log(`Files with issues: ${htmlFiles.length - validFiles}`);
console.log(`Total issues: ${totalIssues}`);

if (totalIssues === 0) {
    console.log('\n🎉 All internal links are properly standardized!');
    console.log('\n✅ Benefits achieved:');
    console.log('• Consistent URL structure across all pages');
    console.log('• Better SEO with canonical URLs');
    console.log('• Improved search engine crawling');
    console.log('• Enhanced user experience');
    console.log('• Easier maintenance and debugging');
} else {
    console.log(`\n❌ Link standardization incomplete: ${totalIssues} issues found`);
    console.log('Please fix the issues above for optimal SEO performance.');
}

console.log('\n🎯 Next steps:');
console.log('1. Test all navigation links');
console.log('2. Verify game-to-game links work correctly');
console.log('3. Check breadcrumb navigation');
console.log('4. Deploy and monitor for 404 errors');
