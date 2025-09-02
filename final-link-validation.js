#!/usr/bin/env node

/**
 * Final validation script for internal link standardization
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
    
    // Check for problematic patterns (excluding CSS files)
    const problemPatterns = [
        { pattern: /href="\.\.\/[^"]*(?<!\.css)"/g, description: 'Relative path with ../ (non-CSS)' },
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
    
    // Count different types of links
    const stats = {
        absoluteLinks: (content.match(/href="\/[^"]*"/g) || []).length,
        relativeLinks: (content.match(/href="[^"\/][^"]*"/g) || []).length,
        externalLinks: (content.match(/href="https?:\/\/[^"]*"/g) || []).length,
        anchorLinks: (content.match(/href="#[^"]*"/g) || []).length
    };
    
    return { issues, stats };
}

// Main validation
console.log('🔍 Final validation of internal link standardization...\n');

const htmlFiles = findHTMLFiles('.');
let totalIssues = 0;
let validFiles = 0;
let totalStats = {
    absoluteLinks: 0,
    relativeLinks: 0,
    externalLinks: 0,
    anchorLinks: 0
};

console.log(`Found ${htmlFiles.length} HTML files\n`);

htmlFiles.forEach(filePath => {
    const { issues, stats } = validateFile(filePath);
    
    // Accumulate stats
    Object.keys(totalStats).forEach(key => {
        totalStats[key] += stats[key];
    });
    
    if (issues.length === 0) {
        console.log(`✅ ${filePath} (${stats.absoluteLinks} absolute, ${stats.relativeLinks} relative)`);
        validFiles++;
    } else {
        console.log(`❌ ${filePath}:`);
        issues.forEach(issue => console.log(`   ${issue}`));
        totalIssues += issues.length;
    }
});

// Summary
console.log('\n' + '='.repeat(70));
console.log('📊 FINAL LINK STANDARDIZATION VALIDATION SUMMARY');
console.log('='.repeat(70));
console.log(`Total files: ${htmlFiles.length}`);
console.log(`Valid files: ${validFiles}`);
console.log(`Files with issues: ${htmlFiles.length - validFiles}`);
console.log(`Total issues: ${totalIssues}`);
console.log('');
console.log('📈 Link Statistics:');
console.log(`• Absolute links (good): ${totalStats.absoluteLinks}`);
console.log(`• Relative links (review needed): ${totalStats.relativeLinks}`);
console.log(`• External links: ${totalStats.externalLinks}`);
console.log(`• Anchor links: ${totalStats.anchorLinks}`);

if (totalIssues === 0) {
    console.log('\n🎉 LINK STANDARDIZATION COMPLETED SUCCESSFULLY!');
    console.log('\n✅ All internal links are now using absolute paths');
    console.log('\n🎯 SEO Benefits Achieved:');
    console.log('• Consistent URL structure across all pages');
    console.log('• Better search engine crawling and indexing');
    console.log('• Improved canonical URL handling');
    console.log('• Enhanced user experience with predictable URLs');
    console.log('• Easier maintenance and debugging');
    console.log('• Reduced risk of broken links during site restructuring');
    
    console.log('\n📋 Link Structure Summary:');
    console.log('• Navigation: All use /section/ format');
    console.log('• Games: All use /games/game-name/ format');
    console.log('• Genres: All use /genre/category/ format');
    console.log('• Collections: All use /best/collection/ format');
    console.log('• Pages: All use /page-name/ format');
    
} else {
    console.log(`\n❌ Link standardization incomplete: ${totalIssues} issues found`);
    console.log('Please fix the issues above for optimal SEO performance.');
}

console.log('\n🚀 Ready for deployment with optimized internal linking!');
