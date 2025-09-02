#!/usr/bin/env node

/**
 * Build script for Spark Play Games
 * Compiles Tailwind CSS and optimizes for production
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting build process...');

// Step 1: Clean previous build
console.log('🧹 Cleaning previous build...');
if (fs.existsSync('assets/css/output.css')) {
    fs.unlinkSync('assets/css/output.css');
}

// Step 2: Build CSS
console.log('🎨 Building CSS...');
try {
    execSync('npm run build-css-prod', { stdio: 'inherit' });
    console.log('✅ CSS built successfully');
} catch (error) {
    console.error('❌ CSS build failed:', error.message);
    process.exit(1);
}

// Step 3: Verify CSS file exists and has content
if (!fs.existsSync('assets/css/output.css')) {
    console.error('❌ CSS file not generated');
    process.exit(1);
}

const cssStats = fs.statSync('assets/css/output.css');
console.log(`📊 CSS file size: ${(cssStats.size / 1024).toFixed(2)} KB`);

// Step 4: Validate HTML files
console.log('🔍 Validating HTML files...');
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

const htmlFiles = findHTMLFiles('.');
let validationErrors = 0;

htmlFiles.forEach(filePath => {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for Tailwind CDN (should not exist)
        if (content.includes('cdn.tailwindcss.com')) {
            console.error(`❌ ${filePath}: Still contains Tailwind CDN`);
            validationErrors++;
        }
        
        // Check for CSS link
        if (!content.includes('assets/css/output.css')) {
            console.error(`❌ ${filePath}: Missing CSS link`);
            validationErrors++;
        }
        
    } catch (error) {
        console.error(`❌ Error validating ${filePath}:`, error.message);
        validationErrors++;
    }
});

if (validationErrors > 0) {
    console.error(`❌ Build validation failed with ${validationErrors} errors`);
    process.exit(1);
}

console.log(`✅ Validated ${htmlFiles.length} HTML files`);
console.log('🎉 Build completed successfully!');

// Step 5: Show next steps
console.log('\n📋 Next steps:');
console.log('1. Test the website locally');
console.log('2. Check page load performance');
console.log('3. Deploy to production');
console.log('\n💡 Development tip: Use "npm run dev" for development with watch mode');
