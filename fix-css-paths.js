#!/usr/bin/env node

/**
 * Script to fix CSS paths in all HTML files
 */

const fs = require('fs');
const path = require('path');

// Define the correct CSS paths based on directory structure
const pathMappings = {
    // Root level files
    'index.html': 'assets/css/output.css',
    
    // One level deep
    'about/index.html': '../assets/css/output.css',
    'contact/index.html': '../assets/css/output.css',
    'cookie/index.html': '../assets/css/output.css',
    'games/index.html': '../assets/css/output.css',
    'privacy/index.html': '../assets/css/output.css',
    'terms/index.html': '../assets/css/output.css',
    'best/index.html': '../assets/css/output.css',
    'genre/index.html': '../assets/css/output.css',
    
    // Two levels deep - genre pages
    'genre/casual/index.html': '../../assets/css/output.css',
    'genre/arcade/index.html': '../../assets/css/output.css',
    'genre/idle/index.html': '../../assets/css/output.css',
    'genre/sandbox/index.html': '../../assets/css/output.css',
    'genre/simulator/index.html': '../../assets/css/output.css',
    'genre/driving/index.html': '../../assets/css/output.css',
    'genre/fps/index.html': '../../assets/css/output.css',
    'genre/multiplayer/index.html': '../../assets/css/output.css',
    'genre/action/index.html': '../../assets/css/output.css',
    
    // Two levels deep - best collections
    'best/best-arcade-picks/index.html': '../../assets/css/output.css',
    'best/cozy-and-idle/index.html': '../../assets/css/output.css',
    'best/shooters-3d/index.html': '../../assets/css/output.css',
    
    // Two levels deep - game pages
    'games/love-tester/index.html': '../../assets/css/output.css',
    'games/cat-simulator/index.html': '../../assets/css/output.css',
    'games/gta-simulator/index.html': '../../assets/css/output.css',
    'games/farming-island/index.html': '../../assets/css/output.css',
    'games/madalin-stunt-cars-pro/index.html': '../../assets/css/output.css',
    'games/real-flight-simulator/index.html': '../../assets/css/output.css',
    'games/stack-fire-ball/index.html': '../../assets/css/output.css',
    'games/toonz-io/index.html': '../../assets/css/output.css',
    'games/voxel-world/index.html': '../../assets/css/output.css',
    'games/wasteland-shooters/index.html': '../../assets/css/output.css'
};

// Function to process a single HTML file
function processFile(filePath, correctPath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Check if file needs updating
        if (content.includes('cdn.tailwindcss.com') || content.includes('assets/css/output.css')) {
            console.log(`Processing: ${filePath}`);
            
            // Remove Tailwind CDN if present
            content = content.replace(
                /<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>[\s\S]*?<\/script>/g,
                `    <link rel="stylesheet" href="${correctPath}">`
            );
            
            // Fix existing CSS links with wrong paths
            content = content.replace(
                /<link rel="stylesheet" href="[^"]*assets\/css\/output\.css">/g,
                `    <link rel="stylesheet" href="${correctPath}">`
            );
            
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Updated: ${filePath} -> ${correctPath}`);
        }
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
    }
}

// Main execution
console.log('🔄 Starting CSS path fixes...');

let processedCount = 0;
for (const [filePath, correctPath] of Object.entries(pathMappings)) {
    if (fs.existsSync(filePath)) {
        processFile(filePath, correctPath);
        processedCount++;
    } else {
        console.log(`⚠️  File not found: ${filePath}`);
    }
}

console.log(`✅ Processed ${processedCount} files`);
