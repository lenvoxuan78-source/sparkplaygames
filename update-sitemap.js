#!/usr/bin/env node

/**
 * Sitemap Governance Script for Spark Play Games
 * 
 * Usage:
 *   node update-sitemap.js add <url> <priority> <changefreq>
 *   node update-sitemap.js remove <url>
 *   node update-sitemap.js update <url> <lastmod>
 * 
 * Examples:
 *   node update-sitemap.js add "https://sparkplaygames.com/games/new-game/" "0.9" "weekly"
 *   node update-sitemap.js remove "https://sparkplaygames.com/games/removed-game/"
 *   node update-sitemap.js update "https://sparkplaygames.com/games/existing-game/" "2025-09-01"
 */

const fs = require('fs');
const path = require('path');

const SITEMAP_PATH = path.join(__dirname, 'sitemap.xml');

function readSitemap() {
    if (!fs.existsSync(SITEMAP_PATH)) {
        throw new Error('Sitemap file not found');
    }
    return fs.readFileSync(SITEMAP_PATH, 'utf8');
}

function writeSitemap(content) {
    fs.writeFileSync(SITEMAP_PATH, content, 'utf8');
}

function addUrl(url, priority = '0.9', changefreq = 'weekly') {
    let sitemap = readSitemap();
    const lastmod = new Date().toISOString().split('T')[0];
    
    // Check if URL already exists
    if (sitemap.includes(`<loc>${url}</loc>`)) {
        console.log(`URL already exists in sitemap: ${url}`);
        return;
    }
    
    const newEntry = `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    
    // Insert before closing </urlset>
    sitemap = sitemap.replace('</urlset>', `${newEntry}\n  \n</urlset>`);
    
    writeSitemap(sitemap);
    console.log(`Added URL to sitemap: ${url}`);
}

function removeUrl(url) {
    let sitemap = readSitemap();
    
    // Find and remove the URL entry
    const urlRegex = new RegExp(`  <url>\\s*<loc>${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>[\\s\\S]*?</url>\\s*`, 'g');
    const originalSitemap = sitemap;
    sitemap = sitemap.replace(urlRegex, '');
    
    if (sitemap === originalSitemap) {
        console.log(`URL not found in sitemap: ${url}`);
        return;
    }
    
    writeSitemap(sitemap);
    console.log(`Removed URL from sitemap: ${url}`);
    
    // Add to _redirects for 410 status
    const redirectsPath = path.join(__dirname, '_redirects');
    const parsedUrl = new URL(url);
    const redirectEntry = `${parsedUrl.pathname}*  /games/  410\n`;
    
    if (fs.existsSync(redirectsPath)) {
        let redirects = fs.readFileSync(redirectsPath, 'utf8');
        if (!redirects.includes(redirectEntry.trim())) {
            fs.appendFileSync(redirectsPath, redirectEntry);
            console.log(`Added 410 redirect for: ${parsedUrl.pathname}`);
        }
    }
}

function updateUrl(url, lastmod = null) {
    let sitemap = readSitemap();
    const newLastmod = lastmod || new Date().toISOString().split('T')[0];
    
    // Find and update the lastmod for the URL
    const urlRegex = new RegExp(`(<loc>${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>[\\s\\S]*?<lastmod>)([^<]+)(</lastmod>)`, 'g');
    const originalSitemap = sitemap;
    sitemap = sitemap.replace(urlRegex, `$1${newLastmod}$3`);
    
    if (sitemap === originalSitemap) {
        console.log(`URL not found in sitemap: ${url}`);
        return;
    }
    
    writeSitemap(sitemap);
    console.log(`Updated lastmod for URL: ${url} -> ${newLastmod}`);
}

function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    try {
        switch (command) {
            case 'add':
                if (args.length < 2) {
                    console.error('Usage: node update-sitemap.js add <url> [priority] [changefreq]');
                    process.exit(1);
                }
                addUrl(args[1], args[2], args[3]);
                break;
                
            case 'remove':
                if (args.length < 2) {
                    console.error('Usage: node update-sitemap.js remove <url>');
                    process.exit(1);
                }
                removeUrl(args[1]);
                break;
                
            case 'update':
                if (args.length < 2) {
                    console.error('Usage: node update-sitemap.js update <url> [lastmod]');
                    process.exit(1);
                }
                updateUrl(args[1], args[2]);
                break;
                
            default:
                console.log('Sitemap Governance Script');
                console.log('');
                console.log('Commands:');
                console.log('  add <url> [priority] [changefreq]  - Add new URL to sitemap');
                console.log('  remove <url>                       - Remove URL from sitemap and add 410 redirect');
                console.log('  update <url> [lastmod]             - Update lastmod date for existing URL');
                console.log('');
                console.log('Examples:');
                console.log('  node update-sitemap.js add "https://sparkplaygames.com/games/new-game/" "0.9" "weekly"');
                console.log('  node update-sitemap.js remove "https://sparkplaygames.com/games/old-game/"');
                console.log('  node update-sitemap.js update "https://sparkplaygames.com/games/existing-game/"');
        }
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { addUrl, removeUrl, updateUrl };