#!/usr/bin/env node

/**
 * Script to fix incorrect game links that use /genre/games/ instead of /games/
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
        
        // Fix incorrect game links
        const gamePatterns = [
            { pattern: /href="\/genre\/games\/([^"]+)\/"/g, replacement: 'href="/games/$1/"' },
            { pattern: /href="\/best\/games\/([^"]+)\/"/g, replacement: 'href="/games/$1/"' },
            { pattern: /href="\/games\/games\/([^"]+)\/"/g, replacement: 'href="/games/$1/"' },
            
            // Fix any remaining relative game links
            { pattern: /href="games\/([^"]+)\/"/g, replacement: 'href="/games/$1/"' },
            { pattern: /href="\.\/games\/([^"]+)\/"/g, replacement: 'href="/games/$1/"' },
            
            // Fix genre navigation links that might be wrong
            { pattern: /href="\/games\/genre\/"/g, replacement: 'href="/genre/"' },
            { pattern: /href="\/best\/genre\/"/g, replacement: 'href="/genre/"' },
            
            // Fix best collection links
            { pattern: /href="\/genre\/best\/"/g, replacement: 'href="/best/"' },
            { pattern: /href="\/games\/best\/"/g, replacement: 'href="/best/"' },
            
            // Fix specific navigation issues
            { pattern: /href="\/genre\/" class="text-gray-700 hover:text-brand">Home/g, replacement: 'href="/" class="text-gray-700 hover:text-brand">Home' },
            { pattern: /href="\/" class="text-brand font-medium">Genres/g, replacement: 'href="/genre/" class="text-brand font-medium">Genres' }
        ];
        
        gamePatterns.forEach(mapping => {
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
            console.log(`✅ Fixed: ${filePath} (${changeCount} links)`);
        }
        
        return changeCount;
        
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        return 0;
    }
}

// Main execution
console.log('🔄 Fixing incorrect game links...\n');

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
console.log('📊 GAME LINK FIXING SUMMARY');
console.log('='.repeat(50));
console.log(`Total files scanned: ${htmlFiles.length}`);
console.log(`Files updated: ${processedFiles}`);
console.log(`Total links fixed: ${totalChanges}`);

if (totalChanges > 0) {
    console.log('\n✅ Game link fixing completed successfully!');
} else {
    console.log('\n✅ All game links already correct!');
}

console.log('\n🎯 All game links now use proper /games/ paths.');
