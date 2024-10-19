const readers = require('./url_to_markdown_readers.js');
const processor = require('./url_to_markdown_processor.js');
const validURL = require('@7c/validurl');
const fs = require('fs');
const path = require('path');
const JSDOM = require('jsdom').JSDOM;

// Get URL from command-line arguments
const url = process.argv[2];  // First argument passed to the script
const outputDir = process.env.OUTPUT_DIR || './markdown-outputs';
const inlineTitle = process.argv.includes('--title');  // Check if '--title' is passed
const ignoreLinks = process.argv.includes('--no-links');  // Check if '--no-links' is passed

// Ensure URL is provided
if (!url || !validURL(url)) {
    console.error('Usage: node index.js <url> [--title] [--no-links]');
    process.exit(1);
}

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Function to save markdown to a file
function saveMarkdown(url, markdown) {
    const fileName = path.join(outputDir, `${new URL(url).hostname}-${Date.now()}.md`);
    fs.writeFileSync(fileName, markdown);
    console.log(`Markdown saved to ${fileName}`);
}

// Function to read URL and convert to markdown
function readURLAndSaveMarkdown(url, inlineTitle, ignoreLinks) {
    console.log(`Fetching URL: ${url}`);
    console.log(`Options - Inline Title: ${inlineTitle}, Ignore Links: ${ignoreLinks}`);
    
    reader = readers.reader_for_url(url);
    reader.read_url(url, null, inlineTitle, ignoreLinks, (markdown) => {
        console.log('URL successfully fetched and converted to markdown');
        saveMarkdown(url, markdown);
    });
}

// Read and process the URL
readURLAndSaveMarkdown(url, inlineTitle, ignoreLinks);
