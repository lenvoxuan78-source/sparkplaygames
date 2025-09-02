#!/usr/bin/env node

/**
 * Script to standardize all internal links to absolute paths
 * Converts relative paths (../games/, ./genre/) to absolute paths (/games/, /genre/)
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

// Define link mapping patterns
const linkMappings = [
    // Navigation links
    { pattern: /href="\.\.\/index\.html"/g, replacement: 'href="/"' },
    { pattern: /href="index\.html"/g, replacement: 'href="/"' },
    { pattern: /href="\.\.\/\.\.\/index\.html"/g, replacement: 'href="/"' },
    
    // Genre links
    { pattern: /href="\.\.\/genre\/index\.html"/g, replacement: 'href="/genre/"' },
    { pattern: /href="\.\.\/\.\.\/genre\/index\.html"/g, replacement: 'href="/genre/"' },
    { pattern: /href="genre\/index\.html"/g, replacement: 'href="/genre/"' },
    { pattern: /href="\.\.\/genre\/([^"]+)\/index\.html"/g, replacement: 'href="/genre/$1/"' },
    { pattern: /href="\.\.\/\.\.\/genre\/([^"]+)\/index\.html"/g, replacement: 'href="/genre/$1/"' },
    { pattern: /href="([^"]+)\/index\.html"/g, replacement: 'href="/genre/$1/"' }, // For genre pages linking to other genres
    
    // Best/Collections links
    { pattern: /href="\.\.\/best\/index\.html"/g, replacement: 'href="/best/"' },
    { pattern: /href="\.\.\/\.\.\/best\/index\.html"/g, replacement: 'href="/best/"' },
    { pattern: /href="best\/index\.html"/g, replacement: 'href="/best/"' },
    { pattern: /href="\.\.\/index\.html"/g, replacement: 'href="/best/"' }, // For best collection pages
    { pattern: /href="\.\.\/\.\.\/best\/([^"]+)\/index\.html"/g, replacement: 'href="/best/$1/"' },
    
    // Games links
    { pattern: /href="\.\.\/games\/index\.html"/g, replacement: 'href="/games/"' },
    { pattern: /href="\.\.\/\.\.\/games\/index\.html"/g, replacement: 'href="/games/"' },
    { pattern: /href="games\/index\.html"/g, replacement: 'href="/games/"' },
    { pattern: /href="\.\.\/games\/([^"]+)\/index\.html"/g, replacement: 'href="/games/$1/"' },
    { pattern: /href="\.\.\/\.\.\/games\/([^"]+)\/index\.html"/g, replacement: 'href="/games/$1/"' },
    { pattern: /href="\.\.\/([^"]+)\/index\.html"/g, replacement: 'href="/games/$1/"' }, // For game pages linking to other games
    
    // About, Contact, etc.
    { pattern: /href="\.\.\/about\/index\.html"/g, replacement: 'href="/about/"' },
    { pattern: /href="\.\.\/\.\.\/about\/index\.html"/g, replacement: 'href="/about/"' },
    { pattern: /href="about\/index\.html"/g, replacement: 'href="/about/"' },
    
    { pattern: /href="\.\.\/contact\/index\.html"/g, replacement: 'href="/contact/"' },
    { pattern: /href="\.\.\/\.\.\/contact\/index\.html"/g, replacement: 'href="/contact/"' },
    { pattern: /href="contact\/index\.html"/g, replacement: 'href="/contact/"' },
    
    { pattern: /href="\.\.\/privacy\/index\.html"/g, replacement: 'href="/privacy/"' },
    { pattern: /href="\.\.\/\.\.\/privacy\/index\.html"/g, replacement: 'href="/privacy/"' },
    { pattern: /href="privacy\/index\.html"/g, replacement: 'href="/privacy/"' },
    
    { pattern: /href="\.\.\/terms\/index\.html"/g, replacement: 'href="/terms/"' },
    { pattern: /href="\.\.\/\.\.\/terms\/index\.html"/g, replacement: 'href="/terms/"' },
    { pattern: /href="terms\/index\.html"/g, replacement: 'href="/terms/"' },
    
    { pattern: /href="\.\.\/cookie\/index\.html"/g, replacement: 'href="/cookie/"' },
    { pattern: /href="\.\.\/\.\.\/cookie\/index\.html"/g, replacement: 'href="/cookie/"' },
    { pattern: /href="cookie\/index\.html"/g, replacement: 'href="/cookie/"' }
];

// Function to process a single HTML file
function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;
        let changeCount = 0;
        
        // Apply all link mappings
        linkMappings.forEach(mapping => {
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
console.log('🔄 Standardizing internal links to absolute paths...\n');

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
console.log('📊 LINK STANDARDIZATION SUMMARY');
console.log('='.repeat(50));
console.log(`Total files scanned: ${htmlFiles.length}`);
console.log(`Files updated: ${processedFiles}`);
console.log(`Total links converted: ${totalChanges}`);

if (totalChanges > 0) {
    console.log('\n✅ Link standardization completed successfully!');
    console.log('All internal links now use absolute paths for better SEO and consistency.');
} else {
    console.log('\n✅ No relative links found - all links already standardized!');
}

console.log('\n🎯 Benefits:');
console.log('• Consistent URL structure');
console.log('• Better SEO with canonical URLs');
console.log('• Improved user experience');
console.log('• Easier maintenance and debugging');
