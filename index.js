const readers = require('./url_to_markdown_readers');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Output directory from environment or default
const outputDir = process.env.OUTPUT_DIR || './markdown-outputs';

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

    const reader = readers.reader_for_url(url);
    reader.read_url(url, null, inlineTitle, ignoreLinks, (markdown) => {
        console.log('URL successfully fetched and converted to markdown');
        saveMarkdown(url, markdown);
    });
}

// Set up interactive prompt
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('Markdown URL Fetcher running...');
console.log('Type a URL to fetch and convert, or type "exit" to quit.');

rl.on('line', (input) => {
    if (input.toLowerCase() === 'exit') {
        console.log('Exiting...');
        rl.close();
        process.exit(0);
    }

    const url = input.trim();
    if (!url) {
        console.log('Please enter a valid URL.');
        return;
    }

    // Process the input URL
    readURLAndSaveMarkdown(url, false, false);
});
