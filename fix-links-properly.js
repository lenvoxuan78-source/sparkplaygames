#!/usr/bin/env node

/**
 * Script to properly fix all internal links to absolute paths
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
        
        // Fix broken paths first
        const brokenPatterns = [
            { pattern: /href="\/genre\/\.\.\/\.\.\/([^"]+)\/"/g, replacement: 'href="/$1/"' },
            { pattern: /href="\/genre\/\.\.\/\.\.\/([^"]+)"/g, replacement: 'href="/$1/"' },
            { pattern: /href="\/games\/\.\.\/\.\.\/([^"]+)\/"/g, replacement: 'href="/$1/"' },
            { pattern: /href="\/games\/\.\.\/\.\.\/([^"]+)"/g, replacement: 'href="/$1/"' }
        ];
        
        brokenPatterns.forEach(mapping => {
            const beforeCount = (content.match(mapping.pattern) || []).length;
            content = content.replace(mapping.pattern, mapping.replacement);
            const afterCount = (content.match(mapping.pattern) || []).length;
            const changes = beforeCount - afterCount;
            if (changes > 0) {
                changeCount += changes;
                updated = true;
            }
        });
        
        // Convert relative paths to absolute paths
        const relativePaths = [
            // Navigation links
            { pattern: /href="\.\.\/index\.html"/g, replacement: 'href="/"' },
            { pattern: /href="index\.html"/g, replacement: 'href="/"' },
            { pattern: /href="\.\.\/\.\.\/index\.html"/g, replacement: 'href="/"' },
            
            // Genre links
            { pattern: /href="\.\.\/genre\/"/g, replacement: 'href="/genre/"' },
            { pattern: /href="\.\.\/\.\.\/genre\/"/g, replacement: 'href="/genre/"' },
            { pattern: /href="genre\/"/g, replacement: 'href="/genre/"' },
            { pattern: /href="\.\.\/genre\/index\.html"/g, replacement: 'href="/genre/"' },
            { pattern: /href="\.\.\/\.\.\/genre\/index\.html"/g, replacement: 'href="/genre/"' },
            { pattern: /href="genre\/index\.html"/g, replacement: 'href="/genre/"' },
            
            // Specific genre pages
            { pattern: /href="\.\.\/genre\/([^"]+)\/"/g, replacement: 'href="/genre/$1/"' },
            { pattern: /href="\.\.\/\.\.\/genre\/([^"]+)\/"/g, replacement: 'href="/genre/$1/"' },
            { pattern: /href="\.\.\/genre\/([^"]+)\/index\.html"/g, replacement: 'href="/genre/$1/"' },
            { pattern: /href="\.\.\/\.\.\/genre\/([^"]+)\/index\.html"/g, replacement: 'href="/genre/$1/"' },
            
            // Best/Collections links
            { pattern: /href="\.\.\/best\/"/g, replacement: 'href="/best/"' },
            { pattern: /href="\.\.\/\.\.\/best\/"/g, replacement: 'href="/best/"' },
            { pattern: /href="best\/"/g, replacement: 'href="/best/"' },
            { pattern: /href="\.\.\/best\/index\.html"/g, replacement: 'href="/best/"' },
            { pattern: /href="\.\.\/\.\.\/best\/index\.html"/g, replacement: 'href="/best/"' },
            { pattern: /href="best\/index\.html"/g, replacement: 'href="/best/"' },
            
            // Specific best collection pages
            { pattern: /href="\.\.\/best\/([^"]+)\/"/g, replacement: 'href="/best/$1/"' },
            { pattern: /href="\.\.\/\.\.\/best\/([^"]+)\/"/g, replacement: 'href="/best/$1/"' },
            { pattern: /href="\.\.\/best\/([^"]+)\/index\.html"/g, replacement: 'href="/best/$1/"' },
            { pattern: /href="\.\.\/\.\.\/best\/([^"]+)\/index\.html"/g, replacement: 'href="/best/$1/"' },
            
            // Games links
            { pattern: /href="\.\.\/games\/"/g, replacement: 'href="/games/"' },
            { pattern: /href="\.\.\/\.\.\/games\/"/g, replacement: 'href="/games/"' },
            { pattern: /href="games\/"/g, replacement: 'href="/games/"' },
            { pattern: /href="\.\.\/games\/index\.html"/g, replacement: 'href="/games/"' },
            { pattern: /href="\.\.\/\.\.\/games\/index\.html"/g, replacement: 'href="/games/"' },
            { pattern: /href="games\/index\.html"/g, replacement: 'href="/games/"' },
            
            // Specific game pages
            { pattern: /href="\.\.\/games\/([^"]+)\/"/g, replacement: 'href="/games/$1/"' },
            { pattern: /href="\.\.\/\.\.\/games\/([^"]+)\/"/g, replacement: 'href="/games/$1/"' },
            { pattern: /href="\.\.\/games\/([^"]+)\/index\.html"/g, replacement: 'href="/games/$1/"' },
            { pattern: /href="\.\.\/\.\.\/games\/([^"]+)\/index\.html"/g, replacement: 'href="/games/$1/"' },
            { pattern: /href="\.\.\/([^"\/]+)\/index\.html"/g, replacement: 'href="/games/$1/"' }, // For game-to-game links
            
            // Other pages
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
            { pattern: /href="cookie\/index\.html"/g, replacement: 'href="/cookie/"' }
        ];
        
        relativePaths.forEach(mapping => {
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
console.log('🔄 Fixing internal links to proper absolute paths...\n');

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
console.log('📊 LINK FIXING SUMMARY');
console.log('='.repeat(50));
console.log(`Total files scanned: ${htmlFiles.length}`);
console.log(`Files updated: ${processedFiles}`);
console.log(`Total links fixed: ${totalChanges}`);

if (totalChanges > 0) {
    console.log('\n✅ Link fixing completed successfully!');
} else {
    console.log('\n✅ No broken links found!');
}

console.log('\n🎯 All internal links now use proper absolute paths.');
