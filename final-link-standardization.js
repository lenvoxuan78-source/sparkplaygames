#!/usr/bin/env node

/**
 * Final comprehensive script to standardize ALL internal links to absolute paths
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
        let changeCount = 0;
        
        // Define all possible link patterns that need fixing
        const linkPatterns = [
            // Fix broken paths with mixed absolute/relative
            { pattern: /href="\/genre\/\.\.\/([^"]+)\/"/g, replacement: 'href="/games/$1/"' },
            { pattern: /href="\/games\/\.\.\/([^"]+)\/"/g, replacement: 'href="/games/$1/"' },
            { pattern: /href="\/best\/\.\.\/([^"]+)\/"/g, replacement: 'href="/$1/"' },
            
            // Convert relative paths to absolute paths
            { pattern: /href="\.\.\/index\.html"/g, replacement: 'href="/"' },
            { pattern: /href="index\.html"/g, replacement: 'href="/"' },
            { pattern: /href="\.\.\/\.\.\/index\.html"/g, replacement: 'href="/"' },
            
            // Navigation links
            { pattern: /href="\.\.\/genre\/"/g, replacement: 'href="/genre/"' },
            { pattern: /href="\.\.\/\.\.\/genre\/"/g, replacement: 'href="/genre/"' },
            { pattern: /href="genre\/"/g, replacement: 'href="/genre/"' },
            { pattern: /href="\.\.\/genre\/index\.html"/g, replacement: 'href="/genre/"' },
            { pattern: /href="\.\.\/\.\.\/genre\/index\.html"/g, replacement: 'href="/genre/"' },
            { pattern: /href="genre\/index\.html"/g, replacement: 'href="/genre/"' },
            
            { pattern: /href="\.\.\/best\/"/g, replacement: 'href="/best/"' },
            { pattern: /href="\.\.\/\.\.\/best\/"/g, replacement: 'href="/best/"' },
            { pattern: /href="best\/"/g, replacement: 'href="/best/"' },
            { pattern: /href="\.\.\/best\/index\.html"/g, replacement: 'href="/best/"' },
            { pattern: /href="\.\.\/\.\.\/best\/index\.html"/g, replacement: 'href="/best/"' },
            { pattern: /href="best\/index\.html"/g, replacement: 'href="/best/"' },
            
            { pattern: /href="\.\.\/games\/"/g, replacement: 'href="/games/"' },
            { pattern: /href="\.\.\/\.\.\/games\/"/g, replacement: 'href="/games/"' },
            { pattern: /href="games\/"/g, replacement: 'href="/games/"' },
            { pattern: /href="\.\.\/games\/index\.html"/g, replacement: 'href="/games/"' },
            { pattern: /href="\.\.\/\.\.\/games\/index\.html"/g, replacement: 'href="/games/"' },
            { pattern: /href="games\/index\.html"/g, replacement: 'href="/games/"' },
            
            { pattern: /href="\.\.\/about\/"/g, replacement: 'href="/about/"' },
            { pattern: /href="\.\.\/\.\.\/about\/"/g, replacement: 'href="/about/"' },
            { pattern: /href="about\/"/g, replacement: 'href="/about/"' },
            { pattern: /href="\.\.\/about\/index\.html"/g, replacement: 'href="/about/"' },
            { pattern: /href="\.\.\/\.\.\/about\/index\.html"/g, replacement: 'href="/about/"' },
            { pattern: /href="about\/index\.html"/g, replacement: 'href="/about/"' },
            
            { pattern: /href="\.\.\/contact\/"/g, replacement: 'href="/contact/"' },
            { pattern: /href="\.\.\/\.\.\/contact\/"/g, replacement: 'href="/contact/"' },
            { pattern: /href="contact\/"/g, replacement: 'href="/contact/"' },
            { pattern: /href="\.\.\/contact\/index\.html"/g, replacement: 'href="/contact/"' },
            { pattern: /href="\.\.\/\.\.\/contact\/index\.html"/g, replacement: 'href="/contact/"' },
            { pattern: /href="contact\/index\.html"/g, replacement: 'href="/contact/"' },
            
            { pattern: /href="\.\.\/privacy\/"/g, replacement: 'href="/privacy/"' },
            { pattern: /href="\.\.\/\.\.\/privacy\/"/g, replacement: 'href="/privacy/"' },
            { pattern: /href="privacy\/"/g, replacement: 'href="/privacy/"' },
            { pattern: /href="\.\.\/privacy\/index\.html"/g, replacement: 'href="/privacy/"' },
            { pattern: /href="\.\.\/\.\.\/privacy\/index\.html"/g, replacement: 'href="/privacy/"' },
            { pattern: /href="privacy\/index\.html"/g, replacement: 'href="/privacy/"' },
            
            { pattern: /href="\.\.\/terms\/"/g, replacement: 'href="/terms/"' },
            { pattern: /href="\.\.\/\.\.\/terms\/"/g, replacement: 'href="/terms/"' },
            { pattern: /href="terms\/"/g, replacement: 'href="/terms/"' },
            { pattern: /href="\.\.\/terms\/index\.html"/g, replacement: 'href="/terms/"' },
            { pattern: /href="\.\.\/\.\.\/terms\/index\.html"/g, replacement: 'href="/terms/"' },
            { pattern: /href="terms\/index\.html"/g, replacement: 'href="/terms/"' },
            
            { pattern: /href="\.\.\/cookie\/"/g, replacement: 'href="/cookie/"' },
            { pattern: /href="\.\.\/\.\.\/cookie\/"/g, replacement: 'href="/cookie/"' },
            { pattern: /href="cookie\/"/g, replacement: 'href="/cookie/"' },
            { pattern: /href="\.\.\/cookie\/index\.html"/g, replacement: 'href="/cookie/"' },
            { pattern: /href="\.\.\/\.\.\/cookie\/index\.html"/g, replacement: 'href="/cookie/"' },
            { pattern: /href="cookie\/index\.html"/g, replacement: 'href="/cookie/"' },
            
            // Specific category pages
            { pattern: /href="\.\.\/genre\/([^"]+)\/"/g, replacement: 'href="/genre/$1/"' },
            { pattern: /href="\.\.\/\.\.\/genre\/([^"]+)\/"/g, replacement: 'href="/genre/$1/"' },
            { pattern: /href="\.\.\/genre\/([^"]+)\/index\.html"/g, replacement: 'href="/genre/$1/"' },
            { pattern: /href="\.\.\/\.\.\/genre\/([^"]+)\/index\.html"/g, replacement: 'href="/genre/$1/"' },
            
            // Specific collection pages
            { pattern: /href="\.\.\/best\/([^"]+)\/"/g, replacement: 'href="/best/$1/"' },
            { pattern: /href="\.\.\/\.\.\/best\/([^"]+)\/"/g, replacement: 'href="/best/$1/"' },
            { pattern: /href="\.\.\/best\/([^"]+)\/index\.html"/g, replacement: 'href="/best/$1/"' },
            { pattern: /href="\.\.\/\.\.\/best\/([^"]+)\/index\.html"/g, replacement: 'href="/best/$1/"' },
            
            // Specific game pages
            { pattern: /href="\.\.\/games\/([^"]+)\/"/g, replacement: 'href="/games/$1/"' },
            { pattern: /href="\.\.\/\.\.\/games\/([^"]+)\/"/g, replacement: 'href="/games/$1/"' },
            { pattern: /href="\.\.\/games\/([^"]+)\/index\.html"/g, replacement: 'href="/games/$1/"' },
            { pattern: /href="\.\.\/\.\.\/games\/([^"]+)\/index\.html"/g, replacement: 'href="/games/$1/"' },
            
            // Game-to-game links (from Similar Games sections)
            { pattern: /href="\.\.\/([a-z-]+)\/index\.html"/g, replacement: 'href="/games/$1/"' },
            { pattern: /href="\.\.\/([a-z-]+)\/"/g, replacement: 'href="/games/$1/"' },
            
            // For genre pages linking to other genres
            { pattern: /href="([a-z-]+)\/index\.html"/g, replacement: 'href="/genre/$1/"' },
            { pattern: /href="([a-z-]+)\/"/g, replacement: 'href="/genre/$1/"' }
        ];
        
        // Apply all patterns
        linkPatterns.forEach(mapping => {
            const beforeCount = (content.match(mapping.pattern) || []).length;
            content = content.replace(mapping.pattern, mapping.replacement);
            const afterCount = (content.match(mapping.pattern) || []).length;
            const changes = beforeCount - afterCount;
            if (changes > 0) {
                changeCount += changes;
                updated = true;
            }
        });
        
        if (updated) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Updated: ${filePath} (${changeCount} links)`);
        }
        
        return changeCount;
        
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        return 0;
    }
}

// Main execution
console.log('🔄 Final link standardization to absolute paths...\n');

const htmlFiles = findHTMLFiles('.');
console.log(`Found ${htmlFiles.length} HTML files\n`);

let totalChanges = 0;
let processedFiles = 0;

htmlFiles.forEach(filePath => {
    const changes = processFile(filePath);
    totalChanges += changes;
    if (changes > 0) {
        processedFiles++;
    }
});

console.log('\n' + '='.repeat(50));
console.log('📊 FINAL LINK STANDARDIZATION SUMMARY');
console.log('='.repeat(50));
console.log(`Total files scanned: ${htmlFiles.length}`);
console.log(`Files updated: ${processedFiles}`);
console.log(`Total links standardized: ${totalChanges}`);

if (totalChanges > 0) {
    console.log('\n✅ Link standardization completed successfully!');
    console.log('All internal links now use absolute paths.');
} else {
    console.log('\n✅ All links already standardized!');
}

console.log('\n🎯 SEO Benefits:');
console.log('• Consistent URL structure across all pages');
console.log('• Better search engine crawling and indexing');
console.log('• Improved canonical URL handling');
console.log('• Enhanced user experience with predictable URLs');
console.log('• Easier maintenance and debugging');
